<?php
  require("dbconnect.php");
  $result = pg_query("select * from geno.errorcodes;");
  echo json_encode(pg_fetch_all($result));
  pg_free_result($result);
?>
