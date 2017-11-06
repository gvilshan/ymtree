<?php
  require("dbc.php");
  $filename = "/autosomal_data/users/gregory/recordsets/mhg_C4a";
  // READ GPIDS TO USE IN DIAGRAM
  $f = fopen($filename, "rt");
  $gpids = array();
  while($s = fgets($f))
  {
    array_push($gpids, substr($s, 2, 8));
    $rc = substr($s, 0, 2);
  }
  fclose($f);

  // FETCH GPIDS' POSITIONS FROM DB
  $gpidlist = implode("','", $gpids);
  $query = "select gpid, position from geno.msnps where rc='$rc' and gpid in('$gpidlist') order by(gpid, position);";
  echo $query . "\n";
  $result = pg_query($query);
  $response = pg_fetch_all($result);
  pg_free_result($result);

  $all_pos = array();
  $genetics = array();
  $gpid_count = count($gpids);
  
  foreach($response as $n=>$v)
  {
    $gpid = $v['gpid'];
    $pos = $v['position'];
    if(array_key_exists($pos, $all_pos))
    {
      $all_pos[$pos]++;
    }
    else
    {
      $all_pos[$pos] = 1;
    }
    $i = array_search($gpid, $gpids);
    if(!array_key_exists($i, $genetics)) $genetics[$i] = array();
    array_push($genetics[$i], $pos);
  }

  // BUILD CORE POSITION SET
  $coreset = array();
  foreach($all_pos as $pos => $cnt)
  {
    if($cnt == $gpid_count) array_push($coreset, $pos);
  }

  // FIND THE GPID CLOSEST TO CORE

  $mv = 100000;
  $mk = -1;
  foreach($genetics as $n=>$v)
  {
    if(count($v) < $mv)
    {
      $mk = $n;
      $mv = count($v);
    }
  }
  
  $ap = $all_pos;
  asort($ap);
  print_r($ap);
  print_r($genetics);
  print_r($coreset);

  echo "Closest GPID: $mk\n";
  print_r($genetics[$mk]);

  // LET'S SEE THE NEXT CLOSEST...
  foreach($genetics as $n=>$v)
  {
    if($n == $mk) continue;
    $u_mine = array_diff($genetics[$mk], $genetics[$n]);
    $u_his = array_diff($genetics[$n], $genetics[$mk]);
    echo "Sample $n:\n";
    echo "added:\n";
    print_r($u_his);
    echo "lost:\n";
    print_r($u_mine);
  }
?>
