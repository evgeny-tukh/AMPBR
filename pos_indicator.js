Cary.controls.PosIndicator = function (map, location, options)
{
    var left, top, ctlOptions;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    left = 'left' in options ? options.left : 50;
    top  = 'top' in options ? options.top : 50;

    for (var key in options)
        ctlOptions [key] = options [key];
    
    Cary.controls.GenericMapDomControl.apply (this, [map, location, ctlOptions, 'posIndicator']);
};

Cary.controls.PosIndicator.prototype = Object.create (Cary.controls.GenericMapDomControl.prototype);

Cary.controls.PosIndicator.prototype.setValue = function (lat, lon)
{
    this.setText (Cary.tools.formatLat (lat) + ' ' + Cary.tools.formatLon (lon));
};

Cary.controls.PosIndicator.prototype.onMouseEvent = function (event)
{
    this.setValue (event.latLng.lat (), event.latLng.lng ());
};
