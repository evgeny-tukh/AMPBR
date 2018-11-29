<?php

    $x = $_REQUEST ['x'];
    $y = $_REQUEST ['y'];
    $z = $_REQUEST ['z'];
    $l = $_REQUEST ['l'];

    $sceneFolder = str_replace (':', '-', $l);

    error_reporting (0);

    $prefetchedPath = "prefetch/$sceneFolder/$z/$x/$y.png";

    if (file_exists ($prefetchedPath))
    {
        header ('Content-Type: image/png');

        $img = imagecreatefrompng ($prefetchedPath);

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

            if ($red !== $green || $red !== $blue || $green !== $blue)
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

        header ('Content-Type: image/png');

        imagepng ($img);
        imagecolordeallocate ($img, $bg);
        imagedestroy ($img);
    }
