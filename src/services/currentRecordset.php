<?php
  session_start();
  $recordset = $_REQUEST['recordset'];
  $_SESSION['recordset'] = $recordset;
?>
