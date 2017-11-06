<?php
  require("dbconnect.php");
  $query = "select snp_name, heatmap_image, is_ydna from geno.assets;";
  $result = pg_query($query);
  $response = pg_fetch_all($result);
  foreach($response as $n=>$v)
  {
    if($v['is_ydna'] == "0") $p='m';
    else $p='y';
    $savedir = "/usr/local/apache2/htdocs/ymtree/src/app/maps/heatmaps/" . $p . "/" . str_replace("'", "~", $v['snp_name']) . ".png";

    $cmd = "wget --no-check-certificate -O " . $savedir . " https://genographic.nationalgeographic.com" . $v['heatmap_image'];
    print_r($cmd);
    echo "\n";
  }
  pg_free_result($result);
?>
