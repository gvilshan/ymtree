<?php
  require("dbconnect.php");
  $tree = $_REQUEST['tree'];
  $hg = $_REQUEST['hg'];
  if($tree == 'm') $is_ydna = 0;
  else $is_ydna = 1;
  $hg = str_replace("'", "~", $hg);
  $query = "select intro from geno.assets where snp_name = '$hg' and is_ydna = $is_ydna order by version desc fetch first 1 row only;";
  $result = pg_query($query);
  $response = pg_fetch_all($result);
  pg_free_result($result);
  echo $response[0]['intro'];
  // echo json_encode($response);
?>
