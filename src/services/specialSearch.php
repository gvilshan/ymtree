<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $username = $_SESSION['userid'];
  
  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $recordset = ".temp";
  $fn = $dirpath . "/" . $recordset;
  $f = fopen($fn, "wt");
  $ctr = 0;
  $query = "select a1.rc||a1.gpid from geno.haplotype a1 where ";
  foreach($_REQUEST as $n=>$v)
  {
    if(substr($n, 0, 6) == "locus_")
    {
      $ctr++;
      $locus = substr($n, 6);
      if($v != "")
      {
        if($ctr == 1)
        {
          $query = $query . "a1.locus = $locus and a1.value = $v ";
        }
        else
        {
          $query = $query . "and exists(select * from geno.haplotype a$ctr where a$ctr.locus = $locus and a$ctr.value = $v and a1.gpid = a$ctr.gpid and a1.rc = a$ctr.rc) ";
        }
      }
    }
  }
  $query = $query . ";";
 
  require("dbconnect.php");
  $res = pg_query($query);
  $gpids = 0;
  while($row = pg_fetch_array($res, NULL, PGSQL_NUM))
  {
    $line = $row[0];
    $gpids++;
    fprintf($f, "%s\n", $line);
  }
  fclose($f);
  pg_free_result($res);
  $f = fopen($fn . ".def", "wt");
  fprintf($f, "%s\n", $query);
  fclose($f);

  $res = new stdClass();
  $res->sql = $query;
  $res->gpids = $gpids;
  echo json_encode($res);
?>
