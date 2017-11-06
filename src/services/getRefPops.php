<?php
  require("dbconnect.php");
  $result = pg_query("select * from geno.ref_populations a left outer join geno.populations b on(a.refpop = b.id) order by (a.refpop, a.shareof);");
  echo json_encode(pg_fetch_all($result));
  pg_free_result($result);
?>
