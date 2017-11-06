<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $recordset = $_SESSION['recordset'];
  $username = $_SESSION['userid'];
  $pkzipping = $_REQUEST['pkzipping'];
  header('Content-Disposition: attachment; filename="' . $recordset . '.txt"');
  echo "GPID\tyhg\tshorthand yhg\tmhg\tY SNPs\tMtDNA SNPs\r\n";
  require("dbconnect.php");
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

    $query = "select position, what, value from geno.msnps where rc='$rc' and gpid='$gpid' order by position desc;";
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
    printf("%s\r\n", $out);
  }
  fclose($f);
?>
