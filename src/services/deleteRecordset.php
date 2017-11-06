<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $username = $_SESSION['userid'];
  $recordset = $_REQUEST['recordset'];
  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  @unlink($dirpath . "/" . $recordset);
  @unlink($dirpath . "/" . $recordset . ".desc");
  @unlink($dirpath . "/" . $recordset . ".def");
?>
