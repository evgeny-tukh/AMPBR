#!/usr/bin/perl
#
# @File main.pl
# @Author jecat
# @Created 20.11.2018 0:54:53
#

use strict;
use LWP::UserAgent;
use JSON;
use Data::Dumper;
use IO::File;
use Cwd;

my $userAgent = new LWP::UserAgent;

$userAgent->timeout (120);

#my $url      = 'http://maps.kosmosnimki.ru/rest/ver1/layers/AF64ECA6B32F437CB6AC72B5E6F85B97/search?&apikey=4WYFYJC5X0&query=[acqdate]=%272018-11-18%27';
#my $request  = new HTTP::Request ('GET', $url);
#my $response = $userAgent->request ($request);
#my $content  = $response->content ();

my $time      = time () - 3600 * 4;
my $today     = getDateTimeString ($time, 1);
my $yesterday = getDateTimeString ($time - 3600 * 24, 1);
my $tomorrow  = getDateTimeString ($time + 3600 * 24, 1);
my @queries   = ( "[acqdate]='$today'", "[DateTime]>'$today' and [DateTime]<'$tomorrow'", "[acqdatetime]>'$today' and [acqdatetime]<'$tomorrow'" );
my @layers    = ( 'AF64ECA6B32F437CB6AC72B5E6F85B97', 'EB271FC4D2AD425A9BAA78ADEA041AB9', '579E4AEE477F4C8595B4E21DAF505631' );
my %area      = ( 'west' => 26.275, 'east' => 31.33334, 'north' => 61, 'south' => 59.3333 );
my @data      = [];
my @indexes   = (0, 2);
my @dnldParam = [];

my %param7  = ( minX => 71,   maxX => 77,   minY => 35,  maxY => 38 );
my %param8  = ( minX => 145,  maxX => 151,  minY => 71,  maxY => 74 );
my %param9  = ( minX => 293,  maxX => 299,  minY => 145, maxY => 148 );
my %param10 = ( minX => 588,  maxX => 594,  minY => 292, maxY => 295 );
my %param11 = ( minX => 1181, maxX => 1186, minY => 586, maxY => 589 );

$dnldParam [7]  = \%param7; #\( minX => 71,   maxX => 77,   minY => 35,  maxY => 38 );
$dnldParam [8]  = \%param8; #\( minX => 145,  maxX => 151,  minY => 71,  maxY => 74 );
$dnldParam [9]  = \%param9; #\( minX => 293,  maxX => 299,  minY => 145, maxY => 148 );
$dnldParam [10] = \%param10; #\( minX => 588,  maxX => 594,  minY => 292, maxY => 295 );
$dnldParam [11] = \%param11; #\( minX => 1181, maxX => 1186, minY => 586, maxY => 589 );

foreach my $i (0..2)
{
    my $content  = requestSceneList ($layers [$i], $queries [$i]);
    my $features = $content->{'features'};
    my @scenes   = [];
    my $key;

    foreach my $feature (@$features)
    {
        my $north    = -90.0;
        my $south    = 90.0;
        my $west     = 180.0;
        my $east     = -180.0;
        my $vertices = $feature->{'geometry'}{'coordinates'}[0];

        foreach my $vertex (@$vertices)
        {
            my $lat = @$vertex [1];
            my $lon = @$vertex [0];

            $north = $lat if ($lat > $north);
            $south = $lat if ($lat < $south);
            $east  = $lon if ($lon > $east);
            $west  = $lon  if ($lon < $west);
        }

        if ((between ($west, $area {'west'}, $area {'east'}) || between ($east, $area {'west'}, $area {'east'})) && 
            (between ($north, $area {'south'}, $area {'north'}) ||  between ($south, $area {'south'}, $area {'north'})) ||

            (between ($area {'west'}, $west, $east) || between ($area {'east'}, $west, $east)) &&
            (between ($area {'south'}, $south, $north) || between ($area {'north'}, $south, $north)))
        {
            $feature->{'bounds'} = ( 'west' => $west, 'east' => $east, 'north' => $north, 'south' => $south );

            my $properties = $feature->{'properties'};

            push (@scenes, $properties->{'GMX_RasterCatalogID'}) if (exists ($properties->{'GMX_RasterCatalogID'}));
        }
    }

    push (@data, \@scenes);
}

foreach my $zoom (keys (@dnldParam))
{
    if (exists ($dnldParam [$zoom]))
    {
        if ($zoom > 0)
        {
            my $params = $dnldParam [$zoom];
            my $minX   = %$params {'minX'};
            my $maxX   = %$params {'maxX'};
            my $minY   = %$params {'minY'};
            my $maxY   = %$params {'maxY'};

            for my $x ($minX..$maxX)
            {
                for my $y ($minY..$maxY)
                {
                    for my $i (0..1)
                    {
                        my $scenes = $data [$i+1];

                        for my $scene (@$scenes)
                        {
                            if (ref ($scene) ne 'ARRAY')
                            {
                                checkSaveTile ($scene, $x, $y, $zoom, 1 - $i);
                            }
                        }
                    }
                }
            }
        }
    }
}

#for my $i (1..2)
#{
#    my $scenesRef = $data [$i];
#    my @scenes    = @$scenesRef;
#
#    print "***$i: ", $#scenes, "\n\n=============\n";
#    print Dumper ($scenesRef), "\n==============\n";
#
#}

sub checkSaveTile
{
    my ($scene, $x, $y, $zoom, $grayScale) = @_;
    
    my $sceneFolder = $scene;

    $sceneFolder =~ tr/:/--/;

    my $path = cwd."/prefetch/$sceneFolder";

    checkCreateFolder ($path);

    $path .= "/$zoom";

    checkCreateFolder ($path);

    $path .= "/$x";

    checkCreateFolder ($path);

    $path .= "/$y.png";

    if (!(-e $path))
    {
        my $url      = "http://jecat.ru/AMPBR/gettile.php?x=$x&y=$y&z=$zoom&l=$scene&g=$grayScale";
        my $request  = new HTTP::Request ('GET', $url);
        my $response = $userAgent->request ($request);
        my $handle   = IO::File->new ("> $path") or die "Unable to create $path";
#print "$url\n";
        binmode ($handle);

        print $handle $response->content () or die "Unable to save $path";

        close ($handle);
    }
}

sub checkCreateFolder
{
    my ($folder) = @_;

    if (!(-e $folder))
    {
        mkdir $folder, 0755;
    }
}

sub getDateTimeString
{
    my ($dateTime, $dateOnly) = @_;
    my $result;

    my ($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst) = localtime ($dateTime);

    $year += 1900;
    $mon ++;

    if ($dateOnly)
    {
        $result = sprintf ("%02d-%02d-%02d", $year, $mon, $mday);
    }
    else
    {
        $result = sprintf ("%02d-%02d-%02d %02d:%02d:%02d", $year, $mon, $mday, $hour, $min, $sec);
    }

    return $result;
}

sub requestSceneList
{
    my ($layer, $query) = @_;

    my $url      = "http://maps.kosmosnimki.ru/rest/ver1/layers/$layer/search?&apikey=4WYFYJC5X0&query=$query";
    my $request  = new HTTP::Request ('GET', $url);
    my $response = $userAgent->request ($request);
    my $json     = decode_json ($response->content ());

    return $json;
}

sub between
{
    my ($value, $minValue, $maxValue) = @_;

    return $value >= $minValue && $value <= $maxValue;
}
