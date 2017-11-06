<?php
  session_start();
  $f = fopen("/tmp/log1.txt", "wt");
  if(!isset($_SESSION['userid'])) return;
  if($_SESSION['admin'] == 'admin')
  {
    require("dbconnect.php");
    $dbconn_replica = $dbconn;
    $_SESSION['admin'] = 'user';
    require("dbconnect.php");
    $dbconn_research = $dbconn;
    $_SESSION['admin'] = 'admin';

    $rc = $_REQUEST['rc'];
    $rid = $_REQUEST['rid'];
    $query = "select * from geno.rgpids where rc='$rc' and rgpid='$rid';";
    fprintf($f, "%s\n", $query);
    fclose($f);
    $result = pg_query($dbconn_research, $query);
    $response = pg_fetch_all($result);
  }
  echo json_encode($response);
?>
