<?php
  require("dbconnect.php");
  $postdata = file_get_contents("php://input");
  $tree = $_REQUEST['tree'];
  $story = $_REQUEST['story'];
  $hg = $_REQUEST['hg'];
  $author = $_REQUEST['author'];

  $is_ydna = '1';
  if($tree == 'm') $is_ydna = '0';

  $snp = str_replace("\\'", "~", $hg);
  print_r($snp);
  
  $asset = array();
  $query = "select * from geno.assets where snp_name = '$snp' and is_ydna = $is_ydna order by version desc fetch first 1 row only;";
  $res = pg_query($dbconn, $query);
  if(pg_num_rows($res) > 0)
  {
    $asset = pg_fetch_array($res, 0, PGSQL_ASSOC);
  }
  pg_free_result($res);

  $query = "select max(id) from geno.assets;";
  $res = pg_query($dbconn, $query);
  $row = pg_fetch_row($res);
  pg_free_result($res);
  $maxid = $row[0];
  $maxid++;

  if(count($asset) == 0)
  {
    // New story
    $asset['id'] = $maxid;
    $asset['snp_name'] = $snp;
    $asset['is_primary'] = 1;
    if($story == 'intro')
    {
      $asset['intro'] = $postdata;
      $asset['body_text'] = "";
    }
    if($story == 'detailed')
    {
      $asset['intro'] = "";
      $asset['body_text'] = $postdata;
    }
    $asset['path_coords'] = "";
    $asset['heatmap_image'] = "";
    $asset['heatmap_zoom'] = 0;
    $asset['heatmap_xcoord'] = 0;
    $asset['heatmap_ycoord'] = 0;
    $asset['heatmap_path'] = "";
    $asset['is_ydna'] = $is_ydna;
    $asset['snp_zoom'] = 100;
    $asset['snp_xcoord'] = 0;
    $asset['snp_ycoord'] = 0;
    $asset['age_text'] = "To Be Determined";
    $asset['origin_text'] = "To Be Determined";
    $asset['heatmap_title'] = 0;
    $asset['heatmap_text'] = 0;
    $asset['lead_image'] = 0;
    $asset['display_name'] = "";
    $asset['notable_people'] = "";
    $asset['related_links'] = "";
    $asset['points_of_interest'] = "";
    $asset['post_id'] = 0;
    $asset['editor'] = $author;
    $asset['version'] = 0;

  }
  else
  {
    $old_id = $asset['id'];
    $new_is_ydna = $is_ydna + 2;
    $query = "update geno.assets set is_ydna = $new_is_ydna where id = $old_id;";
    $res = pg_query($dbconn, $query);
    pg_free_result($res);

    $asset['id'] = $maxid;
    $asset['version'] = $asset['version'] + 1;
    $asset['editor'] = $author;
    if($story == 'intro')
      $asset['intro'] = $postdata;
    if($story == 'detailed')
      $asset['body_text'] = $postdata;
  }
  
  pg_insert($dbconn, "geno.assets", $asset, PGSQL_DML_EXEC);
  // print_r($asset);
  echo "Thank you!\n";
?>
