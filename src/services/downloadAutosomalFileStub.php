<?php
  $afd = array();
  $rc = $_REQUEST['rc1'];
  $gpid = $_REQUEST['gpid1'];
  $afd['rc'] = $rc;
  $afd['gpid'] = $gpid;
  $org_gpid = $gpid;
  $a1 = substr($gpid, 0, 1);
  $a2 = substr($gpid, 1, 1);
  $a3 = substr($gpid, 2, 1);
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
  $data = file_get_contents("http://127.0.0.1/cgi-bin/downloadAutosomalFile_rgpid?gpids=$gpid$org_gpid", false, $context);
  header('Content-Disposition: attachment; filename=NG' . $org_gpid . '.zip');
  echo $data;
?>
