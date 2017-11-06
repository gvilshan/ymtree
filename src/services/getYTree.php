<?php
  $download = $_REQUEST['download'];
  if($download == 1)
  {
    header('Content-Disposition: attachment; filename="ytree.json"');
  }
  require("dbconnect.php");
  $query = "select snp_name from geno.assets where is_ydna=1;";
  $result = pg_query($query);
  $yassets0 = pg_fetch_all($result);
  $yassets = array();
  foreach($yassets0 as $n=>$v)
  {
    array_push($yassets, $v['snp_name']);
  }
//  print_r($yassets);
  pg_free_result($result);
  $query = "select a.nodeid as id, a.terminal_marker as marker, a.haplogroup as name, a.haplogroup as hgname, a.parentid as parent, a.mutations as mutations, b.id as storyid, b.intro is not null as intro, b.body_text is not null as story, b.heatmap_image is not null as heatmap, b.age_text is not null as age from geno.y_haplotree2014 a left outer join geno.assets b on (a.terminal_marker = b.snp_name and b.is_ydna = 1) order by a.nodeid;";
  $result = pg_query($query);
  $response = pg_fetch_all($result);
  pg_free_result($result);

  foreach($response as $n=>$v)
  {
    $mutations = explode(",", $v['mutations']);
    $a = array_intersect($mutations, $yassets);
    // echo $v['name'] . "\n";
    // print_r($a);
    if(count($a) > 0 && $download != 1)
    {
      $response[$n]['name'] = '<b><font color=PaleVioletRed>' . $v['name'] . '</font></b>';
    }
    if($download == 1)
    {
      unset($response[$n]['storyid']);
      unset($response[$n]['intro']);
      unset($response[$n]['story']);
      unset($response[$n]['heatmap']);
      unset($response[$n]['age']);
    }
  }
  $encoded = json_encode($response);
  if($download == 1)
  {
    $from = array("},");
    $to = array("},\n");
    $encoded = str_replace($from, $to, $encoded);
  }
  echo $encoded;
?>
