<?php
  require("dbconnect.php");
  $rc = $_REQUEST['rc'];
  $gpid = $_REQUEST['gpid'];
  $result = pg_query("select * from geno.admixture where rc='$rc' and gpid='$gpid' and popid > 2100 and popid <2120 order by popid;");
  echo json_encode(pg_fetch_all($result));
  pg_free_result($result);
?>
