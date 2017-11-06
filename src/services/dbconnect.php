<?php
if($_SESSION['admin'] == 'admin')
{
  $db = "host=geno-part-dev.ciqqtoeigc0s.us-east-1.rds.amazonaws.com user=genop_dev dbname=postgres password=ouhjTEdrHaL3";
  $dbconn = @pg_connect($db)
    or die('Could not connect: ' . pg_last_error());
}
else
{
  $db = "host=geno-res-dev.ciqqtoeigc0s.us-east-1.rds.amazonaws.com dbname=postgres user=genor_dev password=ouhjTEdrHaL3"
  $dbconn = @pg_connect($db)
    or die('Could not connect: ' . pg_last_error());
}
?>
