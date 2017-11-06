<?php
  session_start();
  $f = fopen("/tmp/log1.txt", "wt");
  if(!isset($_SESSION['userid'])) return;
  require("dbconnect.php");
  $rc = $_REQUEST['rc'];
  $gpid = $_REQUEST['gpid'];
  $query = "select * from geno.gprecord where rc='$rc' and gpid='$gpid';";
  fprintf($f, "%s\n", $_SESSION['admin']);
  fprintf($f, "%s\n", $query);
  $result = pg_query($query);
  $response = pg_fetch_all($result);
  fprintf($f, "%d\n", pg_num_rows($result));
  if($_SESSION['admin'] == 'admin')
  {
    $_SESSION['admin'] = 'user';
    require("dbconnect.php");
    $dbconn_research = $dbconn;
    $_SESSION['admin'] = 'admin';

    $query = "select * from geno.rgpids where rc='$rc' and gpid='$gpid';";
    fprintf($f, "%s\n", $query);
    $result = pg_query($dbconn_research, $query);
    $response1 = pg_fetch_all($result);
    if(pg_num_rows($result) == 1) $response[0]['rid'] = $response1[0]['rgpid'];
//    else $response[0]['rid'] = NULL;
  }
  fclose($f);
  echo json_encode($response);
?>
