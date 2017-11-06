<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $username = $_SESSION['userid'];
//   $username = 'vilshans';
  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $recordsets = scandir($dirpath);
  $recordsets1 = array();
  foreach($recordsets as $n=>$v)
  {
    if($v == '.' || $v == '..') continue;
    @unlink($dirpath . "/" . $v);
  }
?>
