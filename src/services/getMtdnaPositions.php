<?php
  require("dbconnect.php");
  $query = "select mhg, position from geno.mhg_map order by position, mhg;";
  $result = pg_query($query);
  $r = array();
  $n = 0;
  $prev_pos = "";
  $mhg_list = array();
  while($row = pg_fetch_array($result, NULL, PGSQL_ASSOC))
  {
    $pos = $row['position'];
    $mhg = $row['mhg'];
    if($prev_pos != $pos && $prev_pos != "")
    {
      $o = new stdClass();
      $o->id = $n;
      $o->name = $prev_pos;
      $o->mhgs = implode(" ", $mhg_list);
      array_push($r, $o);
      $n++;
      $mhg_list = array();
    }
    array_push($mhg_list, $mhg);
    $prev_pos = $pos;
  }
  $o = new stdClass();
  $o->id = $n;
  $o->name = $prev_pos; 
  $o->mhgs = implode(" ", $mhg_list);
  array_push($r, $o);

  pg_free_result($result);
  echo json_encode($r);
?>
