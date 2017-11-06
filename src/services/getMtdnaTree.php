<?php
  $download = $_REQUEST['download'];
  if($download == 1)
  {
    header('Content-Disposition: attachment; filename="mtdnatree.json"');
  }
  require("dbconnect.php");
  $query = "select a.nodeid as id, a.haplogroup as name, a.haplogroup as hgname, a.parentid as parent, a.mutations as mutations, b.id as storyid, b.intro is not null as intro, b.body_text is not null as story, b.heatmap_image is not null as heatmap, b.age_text is not null as age from geno.mt_haplotree2014aug a left outer join geno.assets b on (a.haplogroup = b.snp_name and b.is_ydna = 0) order by a.nodeid;";
  $result = pg_query($query);
  $response = pg_fetch_all($result);
  pg_free_result($result);

  $firstelement = array();
  $firstelement['age'] = 'f';
  $firstelement['heatmap'] = 'f';
  $firstelement['hgname'] = 'root';
  $firstelement['id'] = '0';
  $firstelement['intro'] = 'f';
  $firstelement['mutations'] = 'f';
  $firstelement['name'] = 'root';
  $firstelement['parent'] = '-1';
  $firstelement['story'] = 'f';
  $firstelement['storyid'] = NULL;
  array_unshift($response, $firstelement);
  foreach($response as $n=>$v)
  {
    if($v['storyid'] != NULL && $download != 1)
    {
      $response[$n]['name'] = '<b><font color=PaleVioletRed>' . $v['name'] . '</font></b>';
    }
    if($v['name'] == "NoLabel")
    {
      $response[$n]['name'] = $v['name'] . "-" . $v['id'];
      $response[$n]['hgname'] = $v['hgname'] . "_" . $v['id'];
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
