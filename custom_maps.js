var scanExOverlays = { sentinel: {}, aqua: {} };
var scanExData     = { metaData: [], aquaData: [], sentinel: [] };
var overlayBorders = { metaData: {}, aquaData: {}, sentinel: {} };

function addOverlayBorder (ovlType, catalogID, overlayData)
{
    var points = [];
    var border;
    var propagating = false;
    
    overlayData.geometry.coordinates [0].forEach (function (vertex) { points.push ({ lat: vertex [1], lng: vertex [0] }); });

    if (catalogID in overlayBorders [ovlType])
        overlayBorders [ovlType][catalogID].setMap (null);
    
    border = new google.maps.Polygon ({ paths: [points], strokeColor: 'black', strokeOpacity: 0.8, strokeWeight: 1, fillColor: 'transparent', fillOpacity: 0.5/*, map: globals.map.map*/ });
    
    border.data = overlayData;
    
    border.addListener ('mouseover', showOverlayInfo);
    border.addListener ('mouseout', hideOverlayInfo);
    
    overlayBorders [ovlType][catalogID] = border;

    globals.showOverlayInfo = showOverlayInfo;
    
    function showOverlayInfo (event)
    {
        if (this.data)
            globals.lftPane.showInfo (this.data, true, true);
        else
            globals.lftPane.cleanUpInfo ();
        
        if (propagating)
            return;
        
        propagating = true;
        
        for (var curOvlType in overlayBorders)
        {
            if (curOvlType !== ovlType || !this.data)
            {
                for (var curCatID in overlayBorders [curOvlType])
                {
                    var border = overlayBorders [curOvlType][curCatID];

                    if (border && border.getMap () && google.maps.geometry.poly.containsLocation (event.latLng, border))
                        globals.lftPane.showInfo (border.data, true, false);
                }
            }
        }
        
        propagating = false;
    }
    
    function hideOverlayInfo ()
    {
        globals.lftPane.showInfo (this.data, false);
    }
}

function createScanExTileUrlFunction (catalogID, forceGrayScale)
{
    return function (coord, zoom)
           {
               var X = coord.x % (1 << zoom);  // wrap
               var result;
               
               result = 'http://jecat.ru/AMPBR/gettile.php?x=' + X.toString () + '&y=' + coord.y.toString () + '&z=' + zoom.toString () + '&l=' + catalogID +
                        '&g=' + forceGrayScale.toString ();
               
               //return 'http://geomixer.scanex.ru/TileSender.ashx?ModeKey=tile&ftc=osm&x=' + X.toString () + '&y=' + coord.y.toString () + '&z=' + zoom.toString () + 
               //       '&srs=3857&LayerName=' + catalogID + '&key=mm6UnkKa4BVxRa6YxDVxyYch5SeuT0VlGi82zJr9MhZ4XUGSOORqzgozbX5uByvl61AInDA4N0znBdLMEBmwF1ANUlUwG0XNyARpq0K9Wis%3D';
               return result; //'http://localhost:8080/RadarPictures/requests/gettile.php?x=' + X.toString () + '&y=' + coord.y.toString () + '&z=' + zoom.toString () + '&l=' + catalogID;
               //return 'gettile.php?x=' + X.toString () + '&y=' + coord.y.toString () + '&z=' + zoom.toString () + '&l=' + catalogID;
           };
}

function removeAllScanExOverlays (overlayType)
{
    for (var key in scanExOverlays [overlayType])
    {
        showScanExOverlay (key, false, overlayType);
        
        //if (key in overlayBorders [overlayType])
        //    overlayBorders [overlayType][key].setMsp (null);
    }
    
    scanExOverlays [overlayType] = {};
    overlayBorders [overlayType] = {};
}

function showScanExData (show, key)
{
    scanExData [key].forEach (function (polygon) { polygon.setMap (null); });
    
    scanExData [key] = [];
    
    if (show)
        globals [key].forEach (function (data)
                               {
                                   var vertices    = [];
                                   var srcVertices = data.geometry.coordinates [0];
                                   var border;

                                   srcVertices.forEach (function (vertex)
                                                        {
                                                            vertices.push ({ lat: vertex [1], lng: vertex [0] });
                                                        });

                                   border = new google.maps.Polygon ({ paths: [vertices], strokeColor: 'black', strokeOpacity: 0.8, strokeWeight: 1,
                                                                       fillColor: 'yellow', fillOpacity: 0.5, map: globals.map.map });

                                   border.addListener ('mousemove', globals.onMouseMove);
                                   
                                   scanExData [key].push (border);
                               });
}

function showAllScanExOverlays (show, ovlType)
{
    scanExData [ovlType].forEach (function (ovlData)
                         {
                             showScanExOverlay (ovlData.properties.GMX_RasterCatalogID, show, ovlType);
                         });
}

function showScanExOverlay (catalogID, show, ovlType)
{
    var mapObject = Cary.checkMap (globals.map);
    var layer;

    if (typeof (show) === 'undefined')
        show = true;

    if (show && !(catalogID in scanExOverlays [ovlType]))
        scanExOverlays [ovlType][catalogID] = new Cary.maps.overlayMaps.CustomOverlayMapType (catalogID, createScanExTileUrlFunction (catalogID, ovlType === 'sentinel' ? 1 : 0));

    layer = scanExOverlays [ovlType][catalogID];

    if (show)
    {
        mapObject.overlayMapTypes.insertAt (0, layer);
        
        if (catalogID in overlayBorders [ovlType])
        {
            overlayBorders [ovlType][catalogID].setMap (globals.map.map);
            overlayBorders [ovlType][catalogID].addListener ('mousemove', globals.onMouseMove);
        }
    }
    else
    {
        var mapType;
        var i, count;

        if (catalogID in overlayBorders [ovlType])
            overlayBorders [ovlType][catalogID].setMap (null);
        
        for (i = 0, count = mapObject.overlayMapTypes.getLength (); i < count; ++ i)
        {
            mapType = mapObject.overlayMapTypes.getAt (i);

            if (mapType === layer)
            {
                mapObject.overlayMapTypes.removeAt (i); break;
            }
        }
    }
}
