<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $recordset = $_SESSION['recordset'];
  $username = $_SESSION['userid'];
  $pkzipping = $_REQUEST['pkzipping'];
  header('Content-Disposition: attachment; filename="' . $recordset . '.txt"');
  // header('Content-Disposition: attachment; filename="' . $recordset . '.csv"');
  require("dbconnect.php");
  $query = "select column_name from INFORMATION_SCHEMA.COLUMNS where table_name = 'phenotype' and table_schema = 'geno' order by ordinal_position;";
  $res = pg_query($query);
  while($row = pg_fetch_array($res, NULL, PGSQL_NUM))
  {
    $cn = $row[0];
    echo $cn . "\t";
  }
  echo "\r\n";
  pg_free_result($res);

  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $fn = $dirpath . "/" . $recordset;
  $f = fopen($fn, "rt");
  while($g = fgets($f))
  {
    $gpid = substr($g, 2, 8);
    $rc = substr($g, 0, 2);

    $query = "select * from geno.phenotype where rc='$rc' and gpid='$gpid';";
    $res = pg_query($query);
    $row = pg_fetch_array($res, NULL, PGSQL_NUM);
    for($i=0; $i<count($row); $i++)
    {
      echo $row[$i] . "\t"; 
    }
    echo "\r\n";
    pg_free_result($res);
  }
  fclose($f);
?>
