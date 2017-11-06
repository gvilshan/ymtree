<?php
  require("dbconnect.php");
  $result = pg_query("select * from geno.populations where id > 2100 and id < 2120 order by id;");
  echo json_encode(pg_fetch_all($result));
  pg_free_result($result);
?>
