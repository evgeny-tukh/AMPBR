<?php

require_once 'session_cfg.php';

const LAST_ACCESS     = "lac";
const USER_ID         = "uid";
const AUTHENTIFICATED = "auth";
const USER_FEATURES   = "feat";

const F_NO_TRACKING   = 1;
const F_MAN_POS_SET   = 2;
const F_ADMIN         = 4;
const F_ERBL          = 8;
const F_SIMULATION    = 16;
const F_ALL_GRANTED   = 32;

class SessionManager
{
    function SessionManager ()
    {
        session_start ();
    }
    
    function destroy ()
    {
        session_destroy ();
        
        $_SESSION = array ();
    }

    static function getVariable ($varName)
    {
        return isset ($_SESSION [$varName]) ? $_SESSION [$varName] : NULL;
    }

    static function setVariable ($varName, $varValue)
    {
        if (isset ($_SESSION))
        {
            $_SESSION [$varName] = $varValue;
        }
    }
    
    static function isAuthenticated ()
    {
        return SessionManager::getVariable (AUTHENTIFICATED);
    }
    
    static function setAuthenticationStatus ($status)
    {
        SessionManager::setVariable (AUTHENTIFICATED, $status);
    }

    static function setAccessTime ()
    {
        SessionManager::setVariable (LAST_ACCESS, time ());
    }

    static function isSessionExpired ()
    {
        global $sessionTimeout;
        
        $lastAccess = SessionManager::getVariable (LAST_ACCESS);

        return ($lastAccess == NULL) || ((time () - $lastAccess) > $sessionTimeout);
    }
    
    static function getUserID ()
    {
        return SessionManager::getVariable (USER_ID);
    }
    
    static function setUserID ($userID)
    {
        SessionManager::setVariable (USER_ID, $userID);
    }
    
    static function getUserFeatures ()
    {
        return SessionManager::getVariable (USER_FEATURES);
    }

    static function isAdmin ()
    {
        return (SessionManager::getVariable (USER_FEATURES) & F_ADMIN) !== 0;
    }

    static function isAllGranted ()
    {
        return (SessionManager::getVariable (USER_FEATURES) & F_ALL_GRANTED) !== 0;
    }

    static function setUserFeatures ($userFeatures)
    {
        SessionManager::setVariable (USER_FEATURES, $userFeatures);
    }
}
