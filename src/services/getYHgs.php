<?php
  require("dbconnect.php");
  $query = "select nodeid as id, haplogroup as name from geno.y_haplotree2014 where haplogroup = 'root' order by haplogroup;";
  $result = pg_query($query);
  $response1 = pg_fetch_all($result);
  pg_free_result($result);
  $query = "select nodeid as id, haplogroup as name, mutations, terminal_marker, shorthand from geno.y_haplotree2014 where haplogroup <> 'root' order by haplogroup;";
  $result = pg_query($query);
  $response2 = pg_fetch_all($result);
  pg_free_result($result);
  // $response = $response1 + $response2;
  echo json_encode(array_merge($response1, $response2));
?>
