<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $recordset = $_SESSION['recordset'];
  $username = $_SESSION['userid'];
  require("dbconnect.php");
  
  header('Content-Disposition: attachment; filename="' . $recordset . '.txt"');
  echo "GPID\tyhg\tshorthand yhg\tmhg\tY SNPs\tMtDNA SNPs\t";
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
    $query = "select yhg, dar_yhg, mhg from geno.gprecord where rc='$rc' and gpid='$gpid';";
    $res = pg_query($query);
    $row = pg_fetch_array($res, NULL, PGSQL_NUM);
    $yhg = $row[0];
    $dar_yhg = $row[1];
    $mhg = $row[2];
    pg_free_result($res);
    $query = "select snp, val from geno.haplosnps where rc='$rc' and gpid='$gpid';";
    $res = pg_query($query);
    $ysnps = array();
    while($row = pg_fetch_array($res, NULL, PGSQL_NUM))
    {
      array_push($ysnps, $row[0]);
    }
    pg_free_result($res);
    $query = "select position, what, value from geno.msnps where rc='$rc' and gpid='$gpid';";
    $res = pg_query($query);
    $msnps = array();
    while($row = pg_fetch_array($res, NULL, PGSQL_NUM))
    {
      if($row[1] == "R")
        array_push($msnps, $row[0] . $row[2]);
      else
        array_push($msnps, $row[0] . $row[1] . $row[2]);
    }
    pg_free_result($res);
    $ysnps_string = implode(" ", $ysnps);
    $msnps_string = implode(" ", $msnps);
    $out = $rc . $gpid . "\t" . $yhg . "\t" . $dar_yhg . "\t" . $mhg . "\t" . $ysnps_string . "\t" . $msnps_string . '';
    /* $out = '"' . $rc . $gpid . '", "' . $yhg . '", "' . $dar_yhg . '", "' . $mhg . '", "' . $ysnps_string . '", "' . $msnps_string . '"'; */
    printf("%s\t", $out);
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
