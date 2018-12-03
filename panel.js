function Pane (options)
{
    var parent, title, absolutePos, onClose;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    parent      = 'parent' in options ? options.parent : null;
    title       = 'title' in options ? options.title : null;
    absolutePos = 'absolutePos' in options ? options.absolutePos : true;
    
    this.onClose = 'onClose' in options ? options.onClose : null;
    
    SidePane.apply (this, 
                    [{},
                     { position: { top: -2, left: -2, width: Cary.tools.int2pix (parent.clientWidth - 30), height: Cary.tools.int2pix (parent.clientHeight - 15), absolute: absolutePos }, 
                       title: title, parent: parent, visible: true, closeable: true, noCloseIcon: false, onClose: this.onClose }]);
}

Pane.prototype = Object.create (SidePane.prototype);

Pane.prototype.queryClose = function ()
{
    this.onClose ();
    
    return false;
};

function LeftPane (parent, onClose)
{
    Pane.apply (this, [{ parent: parent, title: 'Settings', absoutePos: true , onClose: onClose}]);
}

LeftPane.prototype = Object.create (Pane.prototype);

LeftPane.prototype.onInitialize = function ()
{
    SidePane.prototype.onInitialize.apply (this, arguments);

    var now         = Cary.tools.getTimestamp ();
    var date        = now - /*24 * 3600000 * 2*/ - 60000;
    var columns     = [{ title: 'Parameter', width: 100 }, { title: 'Value', width: 150 }];
    var dateStyle   = { padding: 5, 'padding-bottom': 2, margin: 0, 'margin-right': 10, 'line-height': 22, 'text-align': 'left', width: 280, 'font-size': '16px', 'line-height': '20px' };
    var dateBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: 'Look at date' }, dateStyle);
    var metaBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: 'Planned data' }, dateStyle);
    var aquaBlock   = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: 'MODIS Aqua' }, dateStyle);
    var smoothBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: 'Smooth tiles' }, dateStyle);
    var areaBlock   = settings.scanexBorder.limitedAreaEnbabled ? new Cary.ui.ControlBlock ({ parent: this.client, visible: true, text: settings.scanexBorder.limitedAreaText }, dateStyle) : null;
    //var queryBlock = new Cary.ui.ControlBlock ({ parent: this.client, visible: true }, { padding: 10 });
    var shiftToFut  = new Cary.ui.Button ({ text: Cary.symbols.toRight2/*'>>'*/, parent: dateBlock.htmlObject, visible: true, onClick: shiftToFuture },
                                          { width: 20, 'padding-left': 1, 'padding-right': 1, height: 17, float: 'right', 'margin-right': 2, 'line-height': 10 });
    var dateCtl     = new Cary.ui.EditBox ({ parent: dateBlock.htmlObject, visible: true, onClick: selectDate }, 
                                           { 'font-size': '15px', float: 'right', height: 18, width: 120, 'margin-right': 2 });
    var shiftToPst  = new Cary.ui.Button ({ text: Cary.symbols.toLeft2/*'<<'*/, parent: dateBlock.htmlObject, visible: true, onClick: shiftToPast },
                                          { width: 20, 'padding-left': 1, 'padding-right': 1, height: 17, float: 'right', 'margin-right': 2, 'line-height': 10 });
    var showMeta    = new Cary.ui.CheckBox ({ parent: metaBlock.htmlObject, visible: true, onChange: showHideMetaData }, { float: 'right', 'margin-right': '138px' });
    var showAqua    = new Cary.ui.CheckBox ({ parent: aquaBlock.htmlObject, visible: true, onChange: showHideAquaData }, { float: 'right', 'margin-right': '138px' });
    var limitArea   = settings.scanexBorder.limitedAreaEnbabled ? new Cary.ui.CheckBox ({ parent: areaBlock.htmlObject, visible: true, onChange: switchArea, checked: true }, { float: 'right', 'margin-right': '138px' }) : null;
    var smoothTiles = new Cary.ui.CheckBox ({ parent: smoothBlock.htmlObject, visible: true, onChange: switchSmoothMode, checked: globals.smoothTiles }, { float: 'right', 'margin-right': '138px' });
    
    this.metaData = [];
    this.aquaData = [];
    
    this.dataList = new Cary.ui.ListView ({ parent: this.client, columns: columns, visible: false },
                                          { border: 'solid', 'border-width': '1px', position: 'absolute', right: 5, top: 150, left: 5, bottom: 5, fontSize: 10, overflowY: 'scroll' });
                        
    dateCtl.setValue (Cary.tools.formatDate (date));
    
    queryData ();
    
    function showHideMetaData (show)
    {
        showScanExData (show, 'metaData');
    }
    
    function showHideAquaData (show)
    {
        //showScanExData (show, 'aquaData');
        showAllScanExOverlays (show, 'aqua');
    }
    
    function switchSmoothMode (smoothMode)
    {
        var map    = globals.map.map;
        var zoom   = map.getZoom ();
        var bounds = map.getBounds ();
        
        globals.smoothTiles = smoothMode;

        map.setZoom (0);
        
        google.maps.event.addListenerOnce (map, 'tilesloaded', onTilesRefreshed);
        
        function onTilesRefreshed ()
        {
            map.setZoom (zoom);
            map.panToBounds (bounds);
        }
    }
    
    function switchArea (limitArea)
    {
        if (limitArea)
        {
            globals.map.map.setZoom (settings.scanexBorder.limitedZoom);
            globals.map.map.setCenter ({ lat: (settings.scanexBorder.limitedNorth + settings.scanexBorder.limitedSouth) / 2, lng: (settings.scanexBorder.limitedWest + settings.scanexBorder.limitedEast) / 2 });
        }
        else
        {
            globals.map.map.setZoom (settings.scanexBorder.zoom);
            globals.map.map.setCenter ({ lat: (settings.scanexBorder.north + settings.scanexBorder.south) / 2, lng: (settings.scanexBorder.west + settings.scanexBorder.east) / 2 });
        }
    }
    
    function shiftToFuture ()
    {
        var dayLength = 24 * 3600000;
        var newDate   = date + dayLength;
        
        if (newDate <= now + dayLength * 20)
            date = newDate;
        
        dateCtl.setValue (Cary.tools.formatDate (date));
        
        //showMeta.setValue (false);
        //showAqua.setValue (false);
        
        queryData ();
    }
    
    function shiftToPast ()
    {
        date -= 24 * 3600000;
        
        dateCtl.setValue (Cary.tools.formatDate (date));
        
        //showMeta.setValue (false);
        //showAqua.setValue (false);
        
        queryData ();
    }
    
    function selectDate (event)
    {
        var dayLength = 365 * 24 * 3600000;
        var calendarDesc = { position: { x: 100, y: 100 },
                             max: new Date (now + dayLength * 20),
                             min: new Date (now - dayLength * 365),
                             onSelect: function (selectedDate)
                                       {
                                           event.target.value = Cary.tools.formatDate (selectedDate);

                                           CalendarControl.instance.close ();
                                           
                                           date = selectedDate.getTime ();
                                           
                                           queryData ();
                                       } };
            
        new CalendarControl (calendarDesc, new Date (date));
    }
    
    function queryData ()
    {
        var dt  = new Date (date);
        var url = 'http://maps.kosmosnimki.ru/rest/ver1/layers/AF64ECA6B32F437CB6AC72B5E6F85B97/search?&apikey=4WYFYJC5X0&query=[acqdate]=\'' +
                  dt.getFullYear () + '-' + (dt.getMonth () + 1) +  '-' + dt.getDate () + '\'' /*+ '&border=' + Border.encode (settings.scanexBorder)*/;

        Cary.tools.sendRequest ({ mathod: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, resType: Cary.tools.resTypes.json, onLoad: onLoadPics, url: url });
        
        url = 'http://maps.kosmosnimki.ru/rest/ver1/layers/579E4AEE477F4C8595B4E21DAF505631/search?&apikey=4WYFYJC5X0&query=[acqdatetime]>\'' +
              dt.getFullYear () + '-' + (dt.getMonth () + 1) +  '-' + (dt.getDate () + 0) + '\' and [acqdatetime]<\'' + dt.getFullYear () + '-' + (dt.getMonth () + 1) +  '-' + 
              (dt.getDate () + 1) + '\'';

        Cary.tools.sendRequest ({ mathod: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, resType: Cary.tools.resTypes.json, onLoad: onLoadMeta, url: url });
        
        url = 'http://maps.kosmosnimki.ru/rest/ver1/layers/EB271FC4D2AD425A9BAA78ADEA041AB9/search?&apikey=4WYFYJC5X0&query=[DateTime]>\'' +
              dt.getFullYear () + '-' + (dt.getMonth () + 1) +  '-' + (dt.getDate () + 0) + '\' and [DateTime]<\'' + dt.getFullYear () + '-' + (dt.getMonth () + 1) +  '-' + 
              (dt.getDate () + 1) + '\'';

        Cary.tools.sendRequest ({ mathod: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText, resType: Cary.tools.resTypes.json, onLoad: onLoadAqua, url: url });
        
        function onLoadPics (data)
        {
            globals.btmPane.populate (data, 'sentinel');
            
            if (showAqua.getValue ())
                showHideAquaData (true);
        }
        
        function onLoadMeta (data)
        {
            globals.btmPane.loadData (data, 'metaData');
            
            if (showMeta.getValue ())
                showHideMetaData (true);
        }
        
        function onLoadAqua (data)
        {
            globals.btmPane.populate (data, 'aqua');
        }
    }
};

LeftPane.prototype.cleanUpInfo = function ()
{
    this.dataList.removeAllItems ();
};

LeftPane.prototype.showInfo = function (data, show, cleanUpFirst)
{
    var properties = { acqdatetime: 'Date/time', DateTime: 'Date/time', mode: 'Mode', platform: 'Platform', Platforn: 'PLATFORM', polar: 'Polar', resolution: 'Resolution',
                       Delay: 'Delay', ORBIT: 'Orbit', SENSOR: 'Sensor', Station: 'Station' };
    
    if (Cary.tools.isNothing (cleanUpFirst))
        cleanUpFirst = true;
    
    if (cleanUpFirst || !show)
        this.dataList.removeAllItems ();
    else
        this.dataList.addItem (['', '']);
    
    for (var key in properties)
    {
        if (key in data.properties)
            this.dataList.addItem ([properties [key], data.properties [key]]);
    }
    
    this.dataList.show (show);
};

function BottomPane (parent, onClose)
{
    Pane.apply (this, [{ parent: parent, title: 'Data', absolutePos: false, onClose: onClose }]);
}

BottomPane.prototype = Object.create (Pane.prototype);

BottomPane.prototype.onInitialize = function ()
{
    var columns  = [{ title: Cary.symbols.checked, width: 20, onItemClick: onSelectDeselect, onHeaderClick: onCheckUncheckAll }, { title: 'Scene ID', width: 340 }, { title: 'Catalog ID', width: 400 }, { title: 'Platform', width: 90 },
                    { title: 'Acqisition', width: 160 }, { title: 'Mode', width: 40 }, { title: 'Res', width: 40 }, { title: 'Polar', width: 40 }];
    var instance = this;
    
    this.metaData = [];
    this.aquaData = [];
    
    this.dataList = new Cary.ui.ListView ({ parent: this.wnd, columns: columns, visible: true },
                                          { position: 'absolute', right: 2, top: 30, left: 0, height: parseInt (this.wnd.style.height) - 50, fontSize: 10 });
                                         
    SidePane.prototype.onInitialize.apply (this, arguments);
    
    //this.wnd.style.width = '97%';
    //this.wnd.style.right = '5px';
    
    function onCheckUncheckAll ()
    {
        var checkAll;
        var i;
        
        checkAll = instance.dataList.columnHeaders [0].innerText === Cary.symbols.unchecked;

        instance.dataList.columnHeaders [0].innerText = checkAll ? Cary.symbols.checked : Cary.symbols.unchecked;
        
        for (i = 0; i < instance.dataList.getItemCount (); ++ i)
        {
            var catalogID = instance.dataList.getItemText (i, 2);
            
            instance.dataList.setItemText (i, 0, checkAll ? Cary.symbols.checked : Cary.symbols.unchecked);
            
            showScanExOverlay (catalogID, checkAll, 'sentinel');
        }
    }
    
    function onSelectDeselect (row, column)
    {
        var selected  = instance.dataList.getItemText (row, column) === Cary.symbols.checked;
        var catalogID = instance.dataList.getItemText (row, 2);

        instance.dataList.setItemText (row, column, selected ? Cary.symbols.unchecked : Cary.symbols.checked);
        
        showScanExOverlay (catalogID, !selected, 'sentinel');
    }
};

BottomPane.prototype.reset = function ()
{
    this.dataList.enumItems (function (item, index)
                             {
                                 if (this.dataList.getItemText (index, 0) === Cary.symbols.checked)
                                 {
                                     showScanExOverlay (this.dataList.getItemText (index, 2), false);
                                 }
                             });
    
    removeAllScanExOverlays ('sentinel');
    removeAllScanExOverlays ('aqua');
    
    this.dataList.removeAllItems ();
};

BottomPane.prototype.populate = function (data, ovlType)
{
    var instance     = this;
    var approvedData = [];
    var isSentinel   = ovlType === 'sentinel';
    var i, j;
    
    removeAllScanExOverlays (ovlType);
    
    if (data.type === 'FeatureCollection')
    {
        if (isSentinel)
            this.dataList.removeAllItems ();

        scanExData [ovlType] = [];
        
        data.features.forEach (function (data)
                               {
                                   var vertices = data.geometry.coordinates;
                                   var north    = -90.0,
                                       south    = 90.0,
                                       west     = 180.0,
                                       east     = -180.0;
                                       
                                   vertices [0].forEach (function (vertex)
                                                         {
                                                             var lat = vertex [1],
                                                                 lon = vertex [0];
                                                                 
                                                             if (lat > north)
                                                                 north = lat;
                                                             
                                                             if (lat < south)
                                                                 south = lat;
                                                                 
                                                             if (lon > east)
                                                                 east = lon;
                                                             
                                                             if (lon < west)
                                                                 west = lon;
                                                         });

                                   var cellCornerInside = (between (west, settings.scanexBorder.west, settings.scanexBorder.east) || 
                                                           between (east, settings.scanexBorder.west, settings.scanexBorder.east)) && 
                                                          (between (north, settings.scanexBorder.south, settings.scanexBorder.north) || 
                                                           between (south, settings.scanexBorder.south, settings.scanexBorder.north));
                                   var cellIncludes     = (between (settings.scanexBorder.west, west, east) || between (settings.scanexBorder.east, west, east)) &&
                                                          (between (settings.scanexBorder.south, south, north) || between (settings.scanexBorder.north, south, north));
                                                      
                                   if (cellCornerInside || cellIncludes)
                                   {
                                       data.bounds = { west: west, east: east, north: north, south: south };
                                       
                                       approvedData.push (data);
                                   }
                               });

        // Exclude cells having more fresh overlays
        for (i = 0; i < approvedData.length; ++ i)
            approvedData [i].covered = false;
        
        instance.dataList.columnHeaders [0].innerText = Cary.symbols.checked;
        
        approvedData.forEach (function (data)
                              {
                                  if (!data.covered)
                                  {
                                      var props = data.properties;

                                      addOverlayBorder (ovlType, props.GMX_RasterCatalogID, data);
                
                                      if (isSentinel)
                                      {
                                          instance.dataList.addItem ([Cary.symbols.checked, props.sceneid, props.GMX_RasterCatalogID, props.platform, props.acqdatetime, props.mode,
                                                                      props.resolution, props.polar],
                                                                     data);
                                                                 
                                          showScanExOverlay (props.GMX_RasterCatalogID, true, ovlType);
                                      }

                                      scanExData [ovlType].push (data);
                                  }
                              });
    }
};

BottomPane.prototype.loadMetaData = function (data)
{
    this.loadData (data, 'metaData');
};

BottomPane.prototype.loadAquaData = function (data)
{
    this.loadData (data, 'aquaData');
};

BottomPane.prototype.loadData = function (data, key)
{
    if (!key)
        key = 'metaData';
    
    showScanExData (false, key);
    
    if (data.type === 'FeatureCollection')
    {
        globals [key] = [];
        
        data.features.forEach (function (data)
                               {
                                   var vertices = data.geometry.coordinates;
                                   var north    = -90.0,
                                       south    = 90.0,
                                       west     = 180.0,
                                       east     = -180.0;

                                   vertices [0].forEach (function (vertex)
                                                         {
                                                             var lat = vertex [1],
                                                                 lon = vertex [0];
                                                                 
                                                             if (lat > north)
                                                                 north = lat;
                                                             
                                                             if (lat < south)
                                                                 south = lat;
                                                                 
                                                             if (lon > east)
                                                                 east = lon;
                                                             
                                                             if (lon < west)
                                                                 west = lon;
                                                         });
                                   
                                   if ((between (west, settings.scanexBorder.west, settings.scanexBorder.east) || 
                                        between (east, settings.scanexBorder.west, settings.scanexBorder.east)) && 
                                       (between (north, settings.scanexBorder.south, settings.scanexBorder.north) || 
                                        between (south, settings.scanexBorder.south, settings.scanexBorder.north)) ||
                                        
                                       (between (settings.scanexBorder.west, west, east) || between (settings.scanexBorder.east, west, east)) &&
                                       (between (settings.scanexBorder.south, south, north) || between (settings.scanexBorder.north, south, north)))
                                   {
                                       data.bounds = { west: west, east: east, north: north, south: south };
                                       
                                       globals [key].push (data);
                                   }
                               });
    }
};

function between (value, minValue, maxValue)
{
    return value >= minValue && value <= maxValue;
}

function areasAreCrossing (area1, area2)
{
    return ((between (area1.bounds.north, area2.bounds.south, area2.bounds.north) || between (area1.bounds.south, area2.bounds.south, area2.bounds.north)) &&
            (between (area1.bounds.east, area2.bounds.west, area2.bounds.east) || between (area1.bounds.west, area2.bounds.west, area2.bounds.east))) ||
           ((between (area2.bounds.north, area1.bounds.south, area1.bounds.north) || between (area2.bounds.south, area1.bounds.south, area1.bounds.north)) &&
            (between (area2.bounds.east, area1.bounds.west, area1.bounds.east) || between (area2.bounds.west, area1.bounds.west, area1.bounds.east)));
}
