<?php
  $f = fopen("/var/www/cgi-bin/datafeed/c_ytree2014a.txt", "rt");
  if($f == NULL) return;
  $r = array();
  $r1 = array();
  while($node = fgets($f))
  {
    $node = str_replace("\n", "", $node);
    $fields = explode(" ", $node);
    array_shift($fields);
    array_shift($fields);
    $yhg = array_shift($fields);
    for($i=0; $i<count($fields); $i++)
    {
      $marker = $fields[$i];
      if(array_key_exists($marker, $r))
      {
        array_push($r[$marker]->yhgs, $yhg);
      }
      else
      {
        $r[$marker] = new stdClass();
        $r[$marker]->yhgs = array($yhg);
      }
    }
  }
  fclose($f); 
  ksort($r);
  $i=0;
  foreach($r as $name=>$value)
  {
    $o = new stdClass();
    $o->id = $i;
    $o->name = $name;
    $o->yhgs = $value->yhgs;
    array_push($r1, $o);
    $i++;
  }
  echo json_encode($r1);
?>
