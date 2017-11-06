<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $username = $_SESSION['userid'];
  
  $sql = str_replace("\\", "", $_REQUEST['sql']);
  require("dbconnect.php");
  require("doValidateSql.php");

  $response = new stdClass();
  $response->result = $validity;
  $response->errmsg = $errmsg;
  echo json_encode($response);
?>
