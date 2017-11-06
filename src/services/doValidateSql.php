<?php
  $validity = "success";
  $errmsg = "";
 
  $query = "explain " . $sql;

  $res = @pg_query($dbconn, $query);

  if($res == FALSE)
  {
    pg_send_query($dbconn, $query);

    $res = pg_get_result($dbconn);
    $validity = "failure";
    $from = array("\n", "explain ");
    $to = array("<br>", "");
    $errmsg = pg_result_error($res);
    $errmsg = str_replace($from, $to, $errmsg);
    pg_free_result($res);
  }
  else
  {
    $r = pg_fetch_all($res);
    $r0 = $r[0]['QUERY PLAN'];
    $w = strpos($r0, " width=");
    $s = substr($r0, $w);
    if($s != " width=12)")
    {
      $validity = "failure";
      $errmsg = "SQL statement must select rc||gpid!";
    }
    else
    {
      // Make sure the search will return rc||gpid
      $sql1 = strtolower($sql);
      $sql2 = $sql1;
      //echo $sql1 . "\n";
      $p = strpos($sql1, "gpid ");
      if($p === FALSE)
      {
        $validity = "failure";
        $errmsg = "SQL statement must select rc||gpid.";
      }
      else
      {
        $spacelen = strspn($sql1, " \n\t\r");
        $sql1 = substr($sql1, $spacelen);
        if(substr($sql1, 0, 7) != "select ")
        {
          $validity = "failure";
          $errmsg = "Only <strong>select</strong> statements are allowed.";
        }
        else
        {
          $sql1 = substr($sql1, 7);
          $spacelen = strspn($sql1, " \n\t\r");
          $sql1 = substr($sql1, $spacelen);
          $p = strpos($sql1, "gpid ");
          $sql1 = substr($sql1, 0, $p);
          $p = strpos($sql1, ".");
          if($p !== FALSE)
          {
            $prefix = substr($sql1, 0, $p+1);
            $sql1 = str_replace(array($prefix), array(""), $sql1);
          }
          if($sql1 != 'rc||') 
          {
            $validity = "failure";
            $errmsg = "SQL statement must select rc||gpid";
          }
        }
      }
    }
    // Are there any attempts to modify?
    $p = strpos($sql2, "update ");
    if($p !== FALSE)
    {
      $validity = "failure";
      $errmsg = "Modifying the data is not allowed.";
    }
    $p = strpos($sql2, "delete ");
    if($p !== FALSE)
    {
      $validity = "failure";
      $errmsg = "Modifying the data is not allowed.";
    }
    $p = strpos($sql2, "insert ");
    if($p !== FALSE)
    {
      $validity = "failure";
      $errmsg = "Modifying the data is not allowed.";
    }
    $p = strpos($sql2, "set ");
    if($p !== FALSE)
    {
      $validity = "failure";
      $errmsg = "Modifying the data is not allowed.";
    }
  }
?>
