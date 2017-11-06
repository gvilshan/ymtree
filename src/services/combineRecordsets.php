<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $username = $_SESSION['userid'];
  
  $list = $_REQUEST['list'];
  $combination = $_REQUEST['combination'];
  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $recordset = ".temp";

  $list = substr($list, 1);
  $recordsets = explode("/", $list);
 
  if($combination == "union")
  {
    $files = "";
    for($i = 0; $i < count($recordsets); $i++)
    { 
      $files = $files . $dirpath . "/" . $recordsets[$i] . " ";
    }
    $command = "cat $files | sort -u >$dirpath/$recordset";
    exec($command);
  }
  if($combination == "intersect")
  {
    $files = "";
    for($i = 0; $i < count($recordsets); $i++)
    { 
      $files = $files . $dirpath . "/" . $recordsets[$i] . " ";
    }
    $command = "cat $files | sort | uniq -c | grep " . '" ' . count($recordsets) . '" ' . " | awk '{print $2;}' >$dirpath/$recordset";
    exec($command);
  }
  if($combination == "complement")
  {
    $files_other = "";
    for($i = 1; $i < count($recordsets); $i++)
    { 
      $files_other = $files_other . $dirpath . "/" . $recordsets[$i] . " ";
    }
    $command = "cat $files_other | sort | uniq >$dirpath/.temp1";
    exec($command);
    $first_file = $dirpath . "/" . $recordsets[0];
    $command = "sort $first_file >$dirpath/.temp0";
    exec($command);
    $command = "comm -23 $dirpath/.temp0 $dirpath/.temp1 >$dirpath/.temp";
    exec($command);
  }
    
  $fn = "$dirpath/$recordset";
  $f = fopen($fn . ".def", "wt");
  fprintf($f, "#!/bin/bash\n");
  fprintf($f, "%s\n", $command, $list);
  fclose($f);

  $fn = "$dirpath/$recordset";
  $f = fopen($fn, "rt");
  $gpids = 0;
  while($s = fgets($f)) $gpids++;
  fclose($f);
  $res = new stdClass();
  $res->sql = $query;
  $res->gpids = $gpids;
  echo json_encode($res);
?>
