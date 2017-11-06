<?php
  require("dbconnect.php");
  $query = "select snp_name, heatmap_image from geno.assets where is_ydna = 1;";
  $result = pg_query($query);
  $response = pg_fetch_all($result);
  pg_free_result($result);
  echo json_encode($response);
?>
