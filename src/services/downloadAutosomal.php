<?php
  ini_set('max_execution_time', 300);
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $recordset = $_SESSION['recordset'];
  $username = $_SESSION['userid'];
  require("dbconnect.php");
 
  header('Content-Disposition: attachment; filename="' . $recordset . '.zip"');
  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $fn = $dirpath . "/" . $recordset;
  $f = fopen($fn, "rt");

  $tempdir = "/tmp/$username/$recordset";
  mkdir($tempdir, 0777, true);
  chdir($tempdir);
  $maxcount = 2000;
  while($g = fgets($f))
  {
    $gpid = substr($g, 2, 8);
    $rc = substr($g, 0, 2);
    $org_gpid = $gpid;

    $query = "select gpid from geno.rgpids where rgpid='$gpid';";
    $res = pg_query($query);
    $row = pg_fetch_array($res, NULL, PGSQL_NUM);
    $gpid = $row[0];
    pg_free_result($res);

    $a1 = substr($gpid, 0, 1);
    $a2 = substr($gpid, 1, 1);
    $a3 = substr($gpid, 2, 1);

    $org_fname = "/autosomal_data/data/$a1/$a2/$a3/$rc" . $gpid . ".csv.gz";
    system("gzip -d -c $org_fname > $rc$org_gpid.csv");
    $maxcount--;
    if($maxcount == 0)
    {
      file_put_contents("_readme.txt", "ZIP Archive cannot include more than 2000 files. First 2000 files of the recordset are included.\n");
      break;
    }

  }
  passthru("zip -j -m -9 -q - *");
  chdir("/tmp/");
  rmdir($tempdir);
  $tempdir = "/tmp/$username/";
  rmdir($tempdir);
?>
