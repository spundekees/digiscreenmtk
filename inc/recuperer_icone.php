<?php

require 'headers.php';

if (!consommerQuota('reseau', 'reseau')) {
	http_response_code(429);
	echo '';
	exit();
}

if (validerChaine($_POST['lien'] ?? null, 2048) && validerUrl($_POST['lien'])) {
	echo recuperer_icone($_POST['lien']);
} else {
	echo '';
}
