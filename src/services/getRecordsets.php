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
    if(strpos($v, '.') !== FALSE) continue;
    $o = new stdClass();
    $o->name = $v;
    $o->created = @date("Y-m-d H:i:s", filemtime($dirpath . "/" . $v));
    $o->description = @file_get_contents($dirpath . "/" . $v . ".desc");
    $o->definition = @file_get_contents($dirpath . "/" . $v . ".def");
    $o->gpidcount = filesize($dirpath . "/" . $v) / 11;

    array_push($recordsets1, $o);
  }
  echo json_encode($recordsets1);
?>
