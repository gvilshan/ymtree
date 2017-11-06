<?php
  require("dbconnect.php");
  $hg_path1 = $_REQUEST['hg_path'];
  $hg_path = json_decode(stripslashes($hg_path1));
  $path = $_REQUEST['path'];
  if($path == 'm') $is_ydna = 0;
  else $is_ydna = 1;
  $response = array();
  for($i=0; $i < count($hg_path); $i++)
  {
    $hg = str_replace("'", "~", $hg_path[$i]);
    $query = "select snp_name, path_coords from geno.assets where snp_name = '$hg' and is_ydna = $is_ydna order by version desc fetch first 1 row only;";
    $result = pg_query($query);
    if(pg_num_rows($result) > 0)
    {
      $resp = pg_fetch_array($result, 0, PGSQL_NUM);
      $o = new stdClass();
      $o->label = $resp[0];
      $o->geometry = json_decode($resp[1]);
      array_push($response, $o);
    }
    else
    {
      $o = new stdClass();
      $o->label = $hg;
      $o->geometry = NULL;
      array_push($response, $o);
    }
    pg_free_result($result);
  }
  echo json_encode($response);
?>
