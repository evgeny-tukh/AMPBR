<?php

    $x             = $_REQUEST ['x'];
    $y             = $_REQUEST ['y'];
    $z             = $_REQUEST ['z'];
    $l             = $_REQUEST ['l'];
    $smooth        = array_key_exists ('s', $_REQUEST) ? intval ($_REQUEST ['s']) : 0;
    $usePrefetch   = array_key_exists ('p', $_REQUEST) ? intval ($_REQUEST ['p']) : 0;
    $grayScaleOnly = array_key_exists ('g', $_REQUEST) ? intval ($_REQUEST ['g']) : 0;

    error_reporting (0);

    $sceneFolder = str_replace (':', '-', $l);

    $prefetchedPath = "prefetch/$sceneFolder/$z/$x/$y.png";

    if ($usePrefetch && file_exists ($prefetchedPath))
    {
        header ('Content-Type: image/png');
        
        $img = imagecreatefrompng ($prefetchedPath);

        if ($smooth)
        {
            imagefilter ($img, IMG_FILTER_SMOOTH, 1);
            imagefilter ($img, IMG_FILTER_PIXELATE, 2);
        }
        
        imagepng ($img);
        imagedestroy ($img);
    }
    else
    {
        $url = "http://geomixer.scanex.ru/TileSender.ashx?ModeKey=tile&ftc=osm&x=$x&y=$y&z=$z&srs=3857&LayerName=$l&key=mm6UnkKa4BVxRa6YxDVxyYch5SeuT0VlGi82zJr9MhZ4XUGSOORqzgozbX5uByvl61AInDA4N0znBdLMEBmwF0d%2BsFJjK4smGIU8Xn5Dlfw%3D";
        $img = imagecreatefromjpeg ($url);

        if ($img)
        {
            // Is a grayscale? if not, we have no permission for this tile and must return an empty
            $tlCol = imagecolorat ($img, 0, 0);
            $trCol = imagecolorat ($img, 255, 0);
            $blCol = imagecolorat ($img, 0, 255);
            $brCol = imagecolorat ($img, 255, 255);
            $red   = $tlCol >> 16;
            $green = ($tlCol & 0xFF00) >> 8;
            $blue  = $tlCol & 255;

            if ($tlCol === 9619822 && /*$trCol === 9488236 &&*/ $blCol === 9619822 && $brCol === 9619822)
            {
                imagedestroy ($img);

                $img = NULL;
            }
            else if ($grayScaleOnly && ($red !== $green || $red !== $blue || $green !== $blue))
            {
                imagedestroy ($img);

                $img = NULL;
            }
            else if ($tlCol === 0 || $trCol === 0 || $blCol === 0 || $brCol === 0)
            {
                $bg = imagecolorallocate/*alpha*/ ($img, 255, 0, 0, 0/*127*/);

                /*if ($tlCol === 0)
                    imagefill ($img, 0, 0, $bg);

                if ($trCol === 0)
                    imagefill ($img, 255, 0, $bg);

                if ($blCol === 0)
                    imagefill ($img, 0, 255, $bg);

                if ($brCol === 0)
                    imagefill ($img, 255, 255, $bg);*/
            }
            else
            {
                $bg = NULL;
            }
        }

        if (!$img)
        {
            $img = imagecreatetruecolor (256, 256);
            $bg  = imagecolorallocate ($img, 0, 0, 0);

            imagefilledrectangle  ($img, 0, 0, 255, 255, $bg);
        }
        
        imagecolortransparent ($img, $bg);
        
        if ($smooth)
        {
            imagefilter ($img, IMG_FILTER_SMOOTH, 1);
            imagefilter ($img, IMG_FILTER_PIXELATE, 2);
        }
        
        header ('Content-Type: image/png');

        imagepng ($img);
        imagecolordeallocate ($img, $bg);
        imagedestroy ($img);
    }
