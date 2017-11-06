<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $username = $_SESSION['userid'];
  $recordset = $_REQUEST['recordset'];
  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $fn = $dirpath . "/" . $recordset;
  require("dbconnect.php");
  $query = file_get_contents($fn . ".def");
  $res = pg_query($query);
  $f = fopen($fn, "wt");
  while($row = pg_fetch_array($res, NULL, PGSQL_NUM))
  {
    $line = $row[0];
    fprintf($f, "%s\n", $line);
  }
  pg_free_result($res);
  fclose($f);
?>
