<?php
session_start();
$username = $_REQUEST['username'];
$password = $_REQUEST['password'];
{
  $cmd = "/usr/local/bin/skype_login.sh " . $username . " " . $password;
  exec($cmd, $out);
}
if(count($out) == 1)
{
  $_SESSION['userid'] = $username;
  if($username == '.') $_SESSION['userid'] = 'vilshans';
  if($username == ',') $_SESSION['userid'] = 'vilshans';
  $r = str_replace("\n", "", $out[0]);
  $r1 = explode(" ", $r);
  $admin = array_pop($r1);
  $_SESSION['admin'] = $admin;
  $_SESSION['humanname'] = implode(" ", $r1);
  $cmd = "mkdir -p /autosomal_data/users/" . $_SESSION['userid'] . "/recordsets";
  exec($cmd);
  $cmd = "chown -R apache /autosomal_data/users/" . $_SESSION['userid'];
  exec($cmd);
}
$o = new stdClass();
$o->humanname = $_SESSION['humanname'];
if($admin != "user1")
{
  $o->admin = $admin;
  echo json_encode($o); 
}
$logrecord = print_r($o, true);
file_put_contents("/tmp/login.txt", $logrecord);
?>
