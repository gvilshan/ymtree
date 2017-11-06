<?php
  session_start();
  if(!isset($_SESSION['userid'])) return;
  $username = $_SESSION['userid'];
  $c = explode(".", $_REQUEST['column']);
  $table = $c[0];
  $column = $c[1];
  
  $operator = $_REQUEST['operator'];
  $attribute = strtolower($_REQUEST['attribute']);
  $scope = $_REQUEST['scope'];
  $dirpath = "/autosomal_data/users/" . $username . "/recordsets";
  $recordset = ".temp";
  $fn = $dirpath . "/" . $recordset;
  $f = fopen($fn, "wt");

  if($column == "all")
  {
    if($operator == "equals")
    {
      $query = "select rc||gpid from geno.phenotype where (LOWER(ethnicity) = $attribute or LOWER(languages) = $attribute or LOWER(mother_place_of_birth) = $attribute or LOWER(father_place_of_birth) = $attribute or LOWER(mat_grandfather_place_of_birth) = $attribute or LOWER(mat_grandmother_place_of_birth) = $attribute or LOWER(pat_grandfather_place_of_birth) = $attribute or LOWER(pat_grandmother_place_of_birth) = $attribute or LOWER(mother_ethnicity) = $attribute or LOWER(father_ethnicity) = $attribute or LOWER(mat_grandfather_ethnicity) = $attribute or LOWER(mat_grandmother_ethnicity) = $attribute or LOWER(pat_grandfather_ethnicity) = $attribute or LOWER(pat_grandmother_ethnicity) = $attribute or LOWER(place_of_birth) = $attribute or LOWER(mother_languages) = $attribute or LOWER(father_languages) = $attribute or LOWER(country) = $attribute or LOWER(earliest_mat_ancestor_ethnicity) = $attribute or LOWER(earliest_pat_ancestor_ethnicity) = $attribute or LOWER(earliest_mat_ancestor_language) = $attribute or LOWER(earliest_pat_ancestor_language) = $attribute or LOWER(earliest_mat_ancestor_place_of_birth) = $attribute or LOWER(earliest_pat_ancestor_place_of_birth) = $attribute)";
    }
    if($operator == "contains")
    {
      $query = "select rc||gpid from geno.phenotype where (LOWER(ethnicity) like '%" . $attribute . "%' or LOWER(languages) like '%" . $attribute . "%' or LOWER(mother_place_of_birth) like '%" . $attribute . "%' or LOWER(father_place_of_birth) like '%" . $attribute . "%' or LOWER(mat_grandfather_place_of_birth) like '%" . $attribute . "%' or LOWER(mat_grandmother_place_of_birth) like '%" . $attribute . "%' or LOWER(pat_grandfather_place_of_birth) like '%" . $attribute . "%' or LOWER(pat_grandmother_place_of_birth) like '%" . $attribute . "%' or LOWER(mother_ethnicity) like '%" . $attribute . "%' or LOWER(father_ethnicity) like '%" . $attribute . "%' or LOWER(mat_grandfather_ethnicity) like '%" . $attribute . "%' or LOWER(mat_grandmother_ethnicity) like '%" . $attribute . "%' or LOWER(pat_grandfather_ethnicity) like '%" . $attribute . "%' or LOWER(pat_grandmother_ethnicity) like '%" . $attribute . "%' or LOWER(place_of_birth) like '%" . $attribute . "%' or LOWER(mother_languages) like '%" . $attribute . "%' or LOWER(father_languages) like '%" . $attribute . "%' or LOWER(country) like '%" . $attribute . "%' or LOWER(earliest_mat_ancestor_ethnicity) like '%" . $attribute . "%' or LOWER(earliest_pat_ancestor_ethnicity) like '%" . $attribute . "%' or LOWER(earliest_mat_ancestor_language) like '%" . $attribute . "%' or LOWER(earliest_pat_ancestor_language) like '%" . $attribute . "%' or LOWER(earliest_mat_ancestor_place_of_birth) like '%" . $attribute . "%' or LOWER(earliest_pat_ancestor_place_of_birth) like '%" . $attribute . "%')";
    }
    if($operator == "begins_with")
    {
      $query = "select rc||gpid from geno.phenotype where (LOWER(ethnicity) like '" . $attribute . "%' or LOWER(languages) like '" . $attribute . "%' or LOWER(mother_place_of_birth) like '" . $attribute . "%' or LOWER(father_place_of_birth) like '" . $attribute . "%' or LOWER(mat_grandfather_place_of_birth) like '" . $attribute . "%' or LOWER(mat_grandmother_place_of_birth) like '" . $attribute . "%' or LOWER(pat_grandfather_place_of_birth) like '" . $attribute . "%' or LOWER(pat_grandmother_place_of_birth) like '" . $attribute . "%' or LOWER(mother_ethnicity) like '" . $attribute . "%' or LOWER(father_ethnicity) like '" . $attribute . "%' or LOWER(mat_grandfather_ethnicity) like '" . $attribute . "%' or LOWER(mat_grandmother_ethnicity) like '" . $attribute . "%' or LOWER(pat_grandfather_ethnicity) like '" . $attribute . "%' or LOWER(pat_grandmother_ethnicity) like '" . $attribute . "%' or LOWER(place_of_birth) like '" . $attribute . "%' or LOWER(mother_languages) like '" . $attribute . "%' or LOWER(father_languages) like '" . $attribute . "%' or LOWER(country) like '" . $attribute . "%' or LOWER(earliest_mat_ancestor_ethnicity) like '" . $attribute . "%' or LOWER(earliest_pat_ancestor_ethnicity) like '" . $attribute . "%' or LOWER(earliest_mat_ancestor_language) like '" . $attribute . "%' or LOWER(earliest_pat_ancestor_language) like '" . $attribute . "%' or LOWER(earliest_mat_ancestor_place_of_birth) like '" . $attribute . "%' or LOWER(earliest_pat_ancestor_place_of_birth) like '" . $attribute . "%')";
    }
  }
  else
  {
    if($column == 'age' || $column=='position')
    {
      if($operator == "equals")
      {
        $query = "select rc||gpid from geno.$table where $column = $attribute";
      }
      if($operator == "greater_than")
      {
        $query = "select rc||gpid from geno.$table where $column > $attribute";
      }
      if($operator == "less_than")
      {
        $query = "select rc||gpid from geno.$table where $column < $attribute";
      }
    }
    else
    {
      // fprintf($f, "column: [%s], operator: [%s], attribute: [%s].\n", $column, $operator, $attribute);
      if($operator == "begins_with")
      {
        $query = "select rc||gpid from geno.$table where LOWER($column) like '" . $attribute . "%'";
      }
      if($operator == "contains")
      {
        $query = "select rc||gpid from geno.$table where LOWER($column) like '%" . $attribute . "%'";
      }
      if($operator == "equals")
      {
        $query = "select rc||gpid from geno.$table where LOWER($column) = '$attribute'";
      }
      if($operator == "greater_than")
      {
        $query = "select rc||gpid from geno.$table where LOWER($column) > '$attribute'";
      }
      if($operator == "less_than")
      {
        $query = "select rc||gpid from geno.$table where LOWER($column) < '$attribute'";
      }
    }
  }

  if($scope == "all") $query = $query . ";";
  if($scope == "ftdna") $query = $query . " and rc in('FW', 'NG');";
  if($scope == "FW") $query = $query . " and rc = 'FW';";
  if($scope == "NG") $query = $query . " and rc = 'NG';";
  if($scope == "XT") $query = $query . " and rc in ('XT', 'GE', 'NG');";
  if($scope == "RC") $query = $query . " and rc not in('FW', 'NG');";
 
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
