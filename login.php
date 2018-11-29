<?php

    require_once 'session/session_mgr.php';
    
    $sessionMgr = new SessionManager ();
    $users      = [['un' => 'jecat', 'pw' => 'karina', 'id' => 1, 'west' => 26.275, 'east' => 31.33334, 'north' => 61, 'south' => 59.3333, 'zoom' => 7,
                    'l_enabled' => true, 'l_west' => 26.985348, 'l_east' => 30.227091, 'l_north' => 60.633875, 'l_south' => 59.409239, 'l_text' => "'Port of SPB area'", 'l_zoom' => 9],
                   ['un' => 'apbm', 'pw' => 'spb', 'id' => 2, 'west' => 26.275, 'east' => 31.33334, 'north' => 61, 'south' => 59.3333, 'zoom' => 7,
                    'l_enabled' => true, 'l_west' => 26.985348, 'l_east' => 30.227091, 'l_north' => 60.633875, 'l_south' => 59.409239, 'l_text' => "'Port of SPB area'", 'l_zoom' => 9],
                   //['un' => 'rostov', 'pw' => 'demo2018', 'id' => 3, 'west' => 39.453303, 'east' => 39.997126, 'north' => 47.262883, 'south' => 47.112155]];
                   ['un' => 'rostov', 'pw' => 'demo2018', 'id' => 3, 'west' => 39, 'east' => 40, 'north' => 48, 'south' => 47, 'zoom' => 7,
                    'l_enabled' => false, 'l_west' => 39, 'l_east' => 40, 'l_north' => 48, 'l_south' => 47, 'l_text' => "'Port of Rostov area'", 'l_zoom' => 9]];
    $authorized = FALSE;
    $message    = 'Invalid user name.';
    $userID     = NULL;
    $isAdmin    = FALSE;
    $features   = 0;
    $userName   = getParam ('un');
    $password   = getParam ('pw');

    foreach ($users as $userData)
    {
        if ($userData ['un'] === $userName && $userData ['pw'] === $password)
        {
            $authorized = TRUE; 
            $userID     = $userData ['id'];

            foreach (['north', 'south', 'west', 'east', 'l_north', 'l_south', 'l_west', 'l_east', 'l_enabled', 'l_text', 'zoom', 'l_zoom'] as $key)
                SessionManager::setVariable ($key, $userData [$key]);

            /*$boxNorth   = $userData ['north'];
            $boxSouth   = $userData ['south'];
            $boxWest    = $userData ['west'];
            $boxEast    = $userData ['east'];*/

            break;
        }
    }

    if ($authorized)
    {
        $sessionMgr->setAuthenticationStatus (TRUE);
        $sessionMgr->setUserID ($userID);
        $sessionMgr->setAccessTime ();

        header ('Location: index.php');
    }
    else
    {
        $sessionMgr->setAuthenticationStatus (FALSE);
        
        header ('Location: login.html');
    }

    function getParam ($paramName)
    {
        return array_key_exists ($paramName, $_REQUEST) ? $_REQUEST [$paramName] : NULL;
    }
?>
