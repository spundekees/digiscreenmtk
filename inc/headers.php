<?php

$app = 'digiscreen';
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
$path = rtrim(dirname(dirname($_SERVER['PHP_SELF'])), '/') . '/';

$methode = $_SERVER['REQUEST_METHOD'];

if ($methode !== 'POST' && $methode !== 'OPTIONS') {
	header('Location: ' . ($secure ? 'https://' : 'http://') . $_SERVER['SERVER_NAME'] . $path);
	exit();
}

require 'env.php';
require 'fonctions.php';

traiterRequeteCors($domainesAutorisesEnv, $environnement, 'Requête non autorisée');

ini_set('session.use_strict_mode', '1');
session_set_cookie_params([
	'lifetime' => 0,
	'path' => $path,
	'secure' => $secure,
	'httponly' => true,
	'samesite' => 'Strict'
]);
session_start();
