function SidePane (callbacks, options)
{
    var noCloseIcon;
    var absolutePos;
    
    if (Cary.tools.isNothing (options))
        options = {};
    
    if (Cary.tools.isNothing (callbacks))
        callbacks = {};
    
    noCloseIcon = 'noCloseIcon' in options ? options.noCloseIcon : true;
    absolutePos = ('position' in options && 'absolute' in options.position) ? options.position.absolute : true;
    
    var parent  = 'parent' in options ? options.parent : document.getElementsByTagName ('body') [0];
    var title   = 'title' in options ? options.title : '';
    var wndOpts = { position: { top: -2, left: -2, width: Cary.tools.int2pix (parent.clientWidth - 30), height: Cary.tools.int2pix (parent.clientHeight - 15), 
                                        absolute: absolutePos }, 
                    title: title, parent: parent, visible: true, noCloseIcon: noCloseIcon };
                
    if ('onClose' in options && options.onClose)
        wndOpts.onClose = options.onClose;
    
    this.options   = options;
    this.callbacks = callbacks;
    
    Cary.ui.Window.apply (this, [wndOpts]);
}

SidePane.prototype = Object.create (Cary.ui.Window.prototype);

SidePane.prototype.queryClose = function ()
{
    return 'closeable' in this.options ? this.options.closeable : false;
};

SidePane.prototype.forceClose = function ()
{
    this.close ();

    if ('onClose' in this.callbacks)
        this.callbacks.onClose ();
};

function ConfigurablePane (parent, title, position, callbacks, options)
{
    if (Cary.tools.isNothing (options))
        options = {};
    
    if (Cary.tools.isNothing (callbacks))
        callbacks = {};
    
    if (Cary.tools.isNothing (parent))
        parent = document.getElementsByTagName ('body') [0];
    
    if (Cary.tools.isNothing (title))
        title = '';

    if (Cary.tools.isNothing (position))
        position = { bottom: 5, left: 5, right: 5, height: 200, absolute: true };
    
    this.callbacks = callbacks;
    
    Cary.ui.Window.apply (this, [{position: position,  paneMode: true, title: title, parent: parent, visible: true }]);
}

ConfigurablePane.prototype = Object.create (Cary.ui.Window.prototype);

ConfigurablePane.prototype.queryClose = function ()
{
    return false;
};

ConfigurablePane.prototype.onInitialize = function ()
{
    var instance       = this;
    var settingsButton = document.createElement ('img');
    
    settingsButton.src       = 'res/settings26.png';
    settingsButton.className = 'paneSettingsButton';
    settingsButton.onclick   = function ()
                               {
                                   if ('onEditSettings' in instance.callbacks) instance.callbacks.onEditSettings (instance);
                               };
    settingsButton.title     = stringTable.pressToSetup;
    
    this.settingsButton = settingsButton;
    
    this.wnd.appendChild (settingsButton);
};

