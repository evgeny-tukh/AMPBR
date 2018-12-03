<?php
    require_once 'session/session_mgr.php';
    
    $sessionMgr = new SessionManager ();

    $curTime = time ();
    
    if (!$sessionMgr->isAuthenticated () || $sessionMgr->isSessionExpired ())
    {
        include ('login.html');
    }
    else
    {
        $sessionMgr->setAccessTime ();
        
        $features = $sessionMgr->getUserFeatures ();
        ?>

        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>
                    AMPB - Satellite Pictures
                </title>
                <style>
                    body
                    {
                        background-color: cyan;
                    }

                    .hidden
                    {
                        display: none;
                    }
                                
                    .lPane, .bPane, .map
                    {
                        position: absolute;
                        background-color: white;
                        font-size: 16px;
                        margin: 0px;
                        padding: 0px;
                    }
                    
                    .lPane
                    {
                        left: 3px;
                        width: 300px;
                        top: 3px;
                        bottom: 256px;
                    }
                    
                    .bPane
                    {
                        bottom: 3px;
                        height: 250px;
                        left: 3px;
                        right: 3px;
                    }
                    
                    .map
                    {
                        /*top: 0px;
                        right: 0px;*/
                        left: 0px;
                        top: 0px;
                        right: 0px;
                        bottom: 0px;
                    }
                </style>
                <script>
                    <?php
                        $indent = str_repeat (' ', 16);

                        echo $indent."var areaBox = {};\n";

                        foreach (['north', 'south', 'west', 'east', 'l_north', 'l_south', 'l_west', 'l_east', 'l_enabled', 'l_text', 'zoom', 'l_zoom'] as $key)
                        {
                            $value = SessionManager::getVariable ($key);

                            echo $indent."areaBox.$key = $value; // Test\n";
                        }
                        //echo "var areaBox = { north: $boxNorth, south: $boxSouth, west: $boxWest, east: $boxEast };\n";

                    ?>
                </script>
                <script src="https://maps.googleapis.com/maps/api/js?libraries=geometry&key=AIzaSyCsZWmFuiHNNNIh5GSgkz6bhJuWhbtk21g"></script>
                <!--<script src="cary.min.js"></script>-->
                    <script src="../cary/cary.js"></script>
                    <script src="../cary/tools.js"></script>
                    <script src="../cary/service.js"></script>
                    <script src="../cary/geo_util.js"></script>
                    <script src="../cary/gm/maps.js"></script>
                    <script src="../cary/gm/map_controls.js"></script>
                    <script src="../cary/gm/mf_balloon.js"></script>
                    <script src="../cary/gm/map_locker.js"></script>
                    <script src="../cary/gm/pos_indicator.js"></script>
                    <script src="../cary/gm/img_button.js"></script>
                    <script src="../cary/gm/brg_rgn_tag.js"></script>
                    <script src="../cary/gm/gm_panel.js"></script>
                    <script src="../cary/gm/map_menu.js"></script>
                    <script src="../cary/gm/drawers/gen_drawer.js"></script>
                    <script src="../cary/gm/drawers/polyline_drawer.js"></script>
                    <script src="../cary/gm/drawers/polygon_drawer.js"></script>
                    <script src="../cary/gm/drawers/icon_drawer.js"></script>
                    <script src="../cary/gm/drawers/circle_drawer.js"></script>
                    <script src="../cary/gm/drawers/icon_grp_drawer.js"></script>
                    <script src="../cary/usr_obj/gen_obj.js"></script>
                    <script src="../cary/usr_obj/multi_pt_obj.js"></script>
                    <script src="../cary/usr_obj/usr_pln.js"></script>
                    <script src="../cary/usr_obj/usr_plg.js"></script>
                    <script src="../cary/usr_obj/usr_icn.js"></script>
                    <script src="../cary/usr_obj/usr_icn_grp.js"></script>
                    <script src="../cary/usr_obj/usr_circle.js"></script>
                    <script src="../cary/ui/generic/wnd.js"></script>
                    <script src="../cary/ui/generic/gen_ctl.js"></script>
                    <script src="../cary/ui/generic/buttons.js"></script>
                    <script src="../cary/ui/generic/editbox.js"></script>
                    <script src="../cary/ui/generic/treeview.js"></script>
                    <script src="../cary/ui/generic/listview.js"></script>
                    <script src="../cary/ui/generic/listbox.js"></script>
                    <script src="../cary/ui/generic/browser.js"></script>
                    <script src="../cary/ui/generic/browsebox.js"></script>
                    <script src="../cary/ui/generic/checkbox.js"></script>
                    <script src="../cary/ui/generic/details.js"></script>
                    <script src="../cary/ui/generic/calendar.js"></script>
                    <script src="../cary/ui/generic/datehourbox2.js"></script>
                    <script src="../cary/ui/dlg/coord_edit.js"></script>
                    <script src="../cary/ui/dlg/pos_edit.js"></script>
                    <script src="../cary/ui/dlg/usr_pln_props.js"></script>
                    <script src="../cary/ui/dlg/usr_plg_props.js"></script>
                    <script src="../cary/ui/dlg/msg_box.js"></script>
                    <script src="../cary/ui/dlg/browser_wnd.js "></script>
                
                <script src="custom_maps.js?a=1"></script>
                <script src="border.js"></script>
                <script src="main.js"></script>
                <script src="side_pane.js"></script>
                <script src="panel.js"></script>
                <script src="pos_indicator.js"></script>

                <link rel="stylesheet" href="cary.min.css"/>
            </head>
            <body onload="init ();" onresize="onResize ();">
                <div id="mapDiv" class="map">
                </div>
                <div id="lpanel" class="lpanel">
                </div>
                <div id="bpanel" class="bpanel">
                </div>
            </body>
        </html>
        <?php
    }
