<?php
// This file controls where to go for participant data (gprecord, haplosnps, msnps...)
// $dbconn = @pg_connect("host=10.10.14.152 dbname=replica user=genodar password=genodar")
$dbconn = @pg_connect("host=10.11.143.63 dbname=postgres user=genodar password=genodar")
    or die('Could not connect: ' . pg_last_error());
?>
