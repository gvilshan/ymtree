<?php
  if($argc == 3)
  {
    $username = $argv[1];
    $recordset = $argv[2];
    require("dbconnect.php");
  }
  else
  {
    session_start();
    if(!isset($_SESSION['userid'])) return;
    $recordset = $_SESSION['recordset'];
    $username = $_SESSION['userid'];
    header('Content-Disposition: attachment; filename="' . $recordset . '.zip"');
    require("dbconnect.php");
  }
  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $fn = $dirpath . "/" . $recordset;
  $f = fopen($fn, "rt");

  $rcs = array();
  $all_pos = array();
  $recordset_gpids = array();
  while($g = fgets($f))
  {
    $gpid = substr($g, 2, 8);
    $rc = substr($g, 0, 2);

    if(!isset($recordset_gpids[$rc]))
    {
      $recordset_gpids[$rc] = array();
      array_push($rcs, $rc);
    }

    $query = "select mhg from geno.gprecord where rc='$rc' and gpid='$gpid';";
    $res = pg_query($query);
    $row = pg_fetch_array($res, NULL, PGSQL_ASSOC);
    $mhg = $row['mhg'];
    pg_free_result($res);

    if(isset($mhg))
    {
      if(strlen($mhg) != 0)
      {
        array_push($recordset_gpids[$rc], $g);
        $query = "select position from geno.msnps where rc='$rc' and gpid='$gpid';";
        $res = pg_query($query);
        while($row = pg_fetch_array($res, NULL, PGSQL_ASSOC))
        {
          $pos = $row['position'] + 0;
          if(!isset($all_pos[$rc])) $all_pos[$rc] = array();
          $all_pos[$rc][$pos] = 1;
        }
        pg_free_result($res);
      }
    }
  }
  fclose($f);
/*
  echo "all_pos:\n";
  print_r($all_pos);
  echo "recordset_gpids:\n";
  print_r($recordset_gpids);
  exit(0);
*/

  $filelist = array();
  chdir($dirpath);

  $command = "zip -q $recordset.zip README.txt";
  $command1 = "rm -f";
  foreach($rcs as $rc_value)
  {
    $f = fopen("$recordset.$rc_value.rdf", "wt");
    $command = $command . " " . "$recordset.$rc_value.rdf";
    $command1 = $command1 . " " . "$recordset.$rc_value.rdf";
    fprintf($f, "  ;1.0\n");
    $secondline = "";
    $all_pos1 = $all_pos[$rc_value];
    foreach($all_pos1 as $pos=>$num)
    {
      $pos1 = sprintf("%05d ;", $pos);
      fprintf($f, "$pos1");
      $secondline = $secondline . "10;";
    }
    fprintf($f, "\n");
    fprintf($f, "$secondline\n");


    $rgpids = $recordset_gpids[$rc_value];
    foreach($rgpids as $i=>$g)
    {
      $gpid = substr($g, 2, 8);
      $rc = substr($g, 0, 2);

      fprintf($f, ">$rc$gpid ;1;;;;;;;\n");

      foreach($all_pos1 as $pos=>$num)
      {
        $query = "select count(*) from geno.msnps where rc='$rc' and gpid='$gpid' and position = $pos;";
        $res = pg_query($query);
        $row = pg_fetch_array($res, NULL, PGSQL_NUM);
        $isthere = $row[0];
        fprintf($f, "$isthere");
        pg_free_result($res);
      }
      fprintf($f, "\n");
    }
    fclose($f);
  }
  system($command);
  $s = file_get_contents("$recordset.zip");
  echo $s;
  unlink("$recordset.zip");

?>
