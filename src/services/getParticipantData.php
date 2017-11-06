<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  require("dbconnect.php");
  $response = array();
  $tables = array('gprecord', 'haplosnps', 'haplotype', 'msnps', 'mranges', 'phenotype', 'admixture', 'email');
  $rc = $_REQUEST['rc'];
  $gpid = $_REQUEST['gpid'];

  foreach($tables as $table)
  {
    $sorting = "";
    if($table == "msnps") $sorting = " order by position ";
    $query = "select * from geno.$table where rc='$rc' and gpid='$gpid' $sorting;";
    if($table == "admixture") $query = "select a.popid, a.share, b.name from geno.admixture a left outer join geno.populations b on(a.popid = b.id) where a.gpid = '$gpid' and a.rc = '$rc' order by a.popid;";
    if($table == "haplotype") $query = "select a.locus, a.value, b.dys from geno.haplotype a left outer join geno.loci b on(a.locus = b.locus) where a.rc='$rc' and a.gpid='$gpid' order by a.locus;";
    $result = pg_query($query);
    $response[$table] = pg_fetch_all($result);
    pg_free_result($result);
  }

  echo json_encode($response);
?>
