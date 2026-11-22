<?php

require 'headers.php';

if (!consommerQuota('ouverture', 'ouverture')) {
	http_response_code(429);
	echo '';
	exit();
}

if (validerChaine($_POST['dgs'] ?? null, 2048) && validerUrl($_POST['dgs'])) {
	echo recuperer_donnees($_POST['dgs']);
} else {
	echo '';
}
