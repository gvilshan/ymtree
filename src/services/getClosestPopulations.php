<?php
  require("dbconnect.php");
  $rc = $_REQUEST['rc'];
  $gpid = $_REQUEST['gpid'];
  $query = "select * from geno.ref_populations where refpop >= 200 order by (refpop, shareof);";
  $result = pg_query($query);
  $prevpop = "0";
  $s1 = array();
  $a = array();
  while($row = pg_fetch_array($result, NULL, PGSQL_ASSOC))
  {
    $refpop = $row['refpop'];
    $shareof = $row['shareof'];
    $share = $row['share'];
    if($prevpop != $refpop)
    {
      array_push($s1, $a);
      $a = array();
      $a[0] = $refpop;
      $a[1] = "name_" . $refpop;
      $a[2] = $share;
      $prevpop = $refpop;
    }
    else
    {
      $a[$shareof - 2099] = $share;
    }
  }
  array_push($s1, $a);
  pg_free_result($result);

  $query = "select * from geno.admixture where rc='$rc' and gpid='$gpid' and popid > 2100 and popid < 2130 order by popid;";
  $result = pg_query($query);

  $u1 = array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
 
  while($row = pg_fetch_array($result, NULL, PGSQL_ASSOC))
  {
    $shareof = $row['popid'];
    $share = $row['share'];
    $u1[$shareof - 2101] = $share;
  }
  pg_free_result($result);

  $cl_pop_count = count($s1);
  $dist = array();
  for($i=1; $i<$cl_pop_count; $i++)
  {
    $current_pop = $s1[$i];
    $id = array_shift($current_pop);
    $pop_name = array_shift($current_pop);
    $dist[$i] = 0.0;
    $reg_count = count($current_pop);
    for($j=0; $j<$reg_count; $j++)
    {
      // echo "s1[$j]:" . $s1[$j];
      // echo "current_pop[$j]:" . $current_pop[$j];
      $dist[$i] = $dist[$i] + pow($u1[$j] - $current_pop[$j], 2);
    }
  }
  $resp = array();
  $d = min($dist);
  
  asort($dist);
  $query = "delete from geno.admixture where rc='$rc' and gpid='$gpid' and popid >= 100 and popid < 300;";
  $result = pg_query($query);
  pg_free_result($result);
  $i=0;
  foreach($dist as $n=>$v)
  {
    // echo $n . ":" . $v . " " . $s1[$n][0] . " " . $s1[$n][1] . "\n";
    $query = "insert into geno.admixture(rc, gpid, popid, share) values('$rc', '$gpid', " . $s1[$n][0] . ", " . $v . ");"; 
    $result = pg_query($query);
    pg_free_result($result);
    $i++;
    if($i > 1) break;
  }
?>
