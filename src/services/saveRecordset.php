<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $username = $_SESSION['userid'];
  $recordset = $_REQUEST['recordset'];
  $desc = $_REQUEST['description'];
  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $f_gpids_from = $dirpath . "/.temp";
  $f_gpids_to = $dirpath . "/" . $recordset;
  rename($f_gpids_from, $f_gpids_to);

  $f_def_from = $dirpath . "/.temp.def";
  $f_def_to = $dirpath . "/" . $recordset . ".def";
  rename($f_def_from, $f_def_to);

  $f_desc = $dirpath . "/" . $recordset . ".desc";
  file_put_contents($f_desc, $desc);
?>
