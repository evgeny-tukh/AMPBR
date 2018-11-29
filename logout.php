<?php
    require_once 'session/session_mgr.php';
    
    $manager = new SessionManager ();
    
    $manager->setAuthenticationStatus (FALSE);

    header ("Location: index.php");
?>