<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $username = $_SESSION['userid'];
  $recordset = $_REQUEST['recordset'];
  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $fn = $dirpath . "/" . $recordset;
  $f = fopen($fn, "rt");
  $res = array();
  while($gpid = fgets($f))
  {
    $o = new stdClass();
    $o->gpid = str_replace("\n", "", $gpid);
    array_push($res, $o);
  }
  fclose($f);
  echo json_encode($res);
?>
