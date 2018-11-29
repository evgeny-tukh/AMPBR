//var settings    = { scanexBorder: { west: 26.275, east: 31.33334, north: 61/*.99999*/, south: 59.3333 } };
var settings    = { scanexBorder: { west: areaBox.west, east: areaBox.east, north: areaBox.north, south: areaBox.south, zoom: areaBox.zoom,
                                    limitedWest: areaBox.l_west, limitedEast: areaBox.l_east, limitedNorth: areaBox.l_north, limitedSouth: areaBox.l_south,
                                    limitedAreaText: areaBox.l_text, limitedAreaEnbabled: areaBox.l_enabled, limitedZoom: areaBox.l_zoom, } };
var layoutFlags = { LEFT_PANE: 1, BOTTOM_PANE: 2 };
var globals     = { layout: layoutFlags.BOTTOM_PANE | layoutFlags.LEFT_PANE, minZoom: 7, maxZoom: 11 };

function init ()
{
    var map     = new Cary.Map ();
    var mapDiv  = document.getElementById ('mapDiv');
    var zoomInButton;
    var zoomOutButton;
    var lftPaneButton;
    var btmPaneButton;
    var logoutButton;
    var posInd;

    globals.map = map;
    
    setUpLayout ();
    
    globals.lftPane     = new LeftPane (document.getElementById ('lpanel'), hideLeftPane);
    globals.btmPane     = new BottomPane (document.getElementById ('bpanel'), hideBottomPane);
    globals.map         = map;
    globals.onMouseMove = onMouseMove;

    map.attach (mapDiv);
    map.createMap ();
    map.setupPredefinedBaseMaps ();

    map.map.setOptions ({ minZoom: globals.minZoom, maxZoom: globals.maxZoom, zoom: 7 });
    //map.map.setCenter ({ lat: (settings.scanexBorder.north + settings.scanexBorder.south) / 2, lng: (settings.scanexBorder.west + settings.scanexBorder.east) / 2 });
    if (settings.scanexBorder.limitedAreaEnbabled)
    {
        globals.map.map.setZoom (settings.scanexBorder.limitedZoom);
        globals.map.map.setCenter ({ lat: (settings.scanexBorder.limitedNorth + settings.scanexBorder.limitedSouth) / 2, lng: (settings.scanexBorder.limitedWest + settings.scanexBorder.limitedEast) / 2 });
    }
    else
    {
        globals.map.map.setZoom (settings.scanexBorder.zoom);
        globals.map.map.setCenter ({ lat: (settings.scanexBorder.north + settings.scanexBorder.south) / 2, lng: (settings.scanexBorder.west + settings.scanexBorder.east) / 2 });
    }

    //setTimeout (function () { map.map.setZoom (8); }, 2000);
    
    zoomInButton  = map.createImgButton (google.maps.ControlPosition.RIGHT_TOP, 'res/zoom-in-20.png', { onClick: function () { map.zoomIn (); } });
    zoomOutButton = map.createImgButton (google.maps.ControlPosition.RIGHT_TOP, 'res/zoom-out-20.png', { onClick: function () { map.zoomOut (); } });
    lftPaneButton = map.createImgButton (google.maps.ControlPosition.LEFT_CENTER, 'res/rgt_arr.png', { onClick: showLeftPane });
    btmPaneButton = map.createImgButton (google.maps.ControlPosition.BOTTOM_CENTER, 'res/up_arr.png', { onClick: showBottomPane });
    logoutButton  = map.createImgButton (google.maps.ControlPosition.TOP_RIGHT, 'res/exit26.png', { onClick: logout });
    posInd        = map.createPosIndicator (google.maps.ControlPosition.TOP_CENTER);

    map.addEventListener ('zoom_changed', onZoomChanged);
    map.addEventListener ('mousemove', onMouseMove);
    map.addEventListener ('mouseover', function () { posInd.show (true); });
    map.addEventListener ('mouseout', function () { posInd.show (false); });

    google.maps.event.addListener (document, 'keydup',
                                   function ()
                                   {
                                       alert ('!!!');
                                   });
    
    zoomInButton.show ();
    zoomOutButton.show ();
    logoutButton.show ();

    zoomOutButton.enable (globals.minZoom < 7);
    zoomInButton.enable (globals.maxZoom > 7);
        
    function onZoomChanged ()
    {
        var curZoom = map.map.getZoom ();
        
        zoomOutButton.enable (curZoom > globals.minZoom);
        zoomInButton.enable (curZoom < globals.maxZoom);
        //zoomOutButton.img.style.opacity = (curZoom <= globals.minZoom) ? 0.5 : 1.0;
        //zoomInButton.img.style.opacity  = (curZoom >= globals.maxZoom) ? 0.5 : 1.0;
    }
    
    function onMouseMove (event)
    {
        posInd.onMouseEvent (event);

        if (globals.showOverlayInfo)
            globals.showOverlayInfo (event);
    }
    
    function logout ()
    {
        Cary.tools.sendRequest ({ url: 'logout.php', method: Cary.tools.methods.get, content: Cary.tools.contentTypes.plainText });

        window.location = 'login.html';
    }
    
    function hideBottomPane ()
    {
        hidePane (layoutFlags.BOTTOM_PANE);
        
        btmPaneButton.show ();
    }
    
    function hideLeftPane ()
    {
        hidePane (layoutFlags.LEFT_PANE);
        
        lftPaneButton.show ();
    }
    
    function showBottomPane ()
    {
        globals.layout |= layoutFlags.BOTTOM_PANE;
        
        setUpLayout ();
    }
    
    function showLeftPane ()
    {
        globals.layout |= layoutFlags.LEFT_PANE;
        
        setUpLayout ();
    }
}

function onResize ()
{
    globals.btmPane.wnd.style.width = Cary.tools.int2pix (document.getElementById ('bpanel').clientWidth - 30);
}

function hidePane (paneFlag)
{
    globals.layout &= ~paneFlag;
    
    setUpLayout ();
}

function setUpLayout ()
{
    var mapDiv        = document.getElementById ('mapDiv');
    var lPanel        = document.getElementById ('lpanel');
    var bPanel        = document.getElementById ('bpanel');
    var lPanelVisible = isPaneVisible (layoutFlags.LEFT_PANE);
    var bPanelVisible = isPaneVisible (layoutFlags.BOTTOM_PANE);
    
    mapDiv.className = 'map';
    lPanel.className = lPanelVisible ? 'lPane' : 'hidden';
    bPanel.className = bPanelVisible ? 'bPane' : 'hidden';

    //mapDiv.style.left   = Cary.tools.int2pix (lPanelVisible ? 0 : 300);
    //mapDiv.style.bottom = Cary.tools.int2pix (bPanelVisible ? 0 : 300);
    
    //lPanel.style.bottom = Cary.tools.int2pix (bPanelVisible ? 256 : 3);
    
    function isPaneVisible (flag)
    {
        return (globals.layout & flag) === flag;
    }
}