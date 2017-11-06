<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $username = $_SESSION['userid'];

  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $recordset = ".temp";
  $fn = $dirpath . "/" . $recordset;
  $f = fopen($fn, "wt");
  
  $sql = str_replace("\\", "", $_REQUEST['sql']);
  $response = new stdClass();
  $response->result = "success";
 
  require("dbconnect.php");
  require("doValidateSql.php");
  if($validity == "success")
  {
    $query = $sql;
  
    $res = pg_query($dbconn, $query);
  
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
  }
  else
  {
    $res = new stdClass();
    $res->sql = $query;
    $res->gpids = 0;
    echo json_encode($res);
  }
?>
