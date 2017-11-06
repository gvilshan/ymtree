<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  file_put_contents("/tmp/aa.txt", serialize($_SESSION));
  $afd = array();
  $rc = $_REQUEST['rc'];
  $gpid = $_REQUEST['gpid'];
  $org_gpid = $gpid;
  $a1 = substr($gpid, 0, 1);
  $a2 = substr($gpid, 1, 1);
  $a3 = substr($gpid, 2, 1);
  if($_SESSION['admin'] != 'admin')
  {
    require("dbconnect.php");
    $query = "select gpid from geno.rgpids where rgpid='$gpid';";
    $res = pg_query($query);
    $row = pg_fetch_array($res, NULL, PGSQL_NUM);
    $gpid = $row[0];
  }
  $context = stream_context_create(array(
    'http' => array(
        'header'  => "Authorization: Basic " . base64_encode("user:password")
    )
  ));
  $data = file_get_contents("http://10.11.143.62/datafeed/getAutosomalFileInfo.php?rc=$rc&gpid=$gpid", false, $context);
  $afd = json_decode($data);
  $afd->file = "/autosomal_data/data/$a1/$a2/$a3/$rc$org_gpid.csv.gz";
  $afd->admin = $_SESSION['admin'];
  echo json_encode($afd);
?>
