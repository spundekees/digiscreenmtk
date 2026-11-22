<?php

$env = '../.env';
$domainesAutorisesEnv = '';

if (file_exists($env)) {
	$contenuEnv = file_get_contents($env);
	$donneesEnv = $contenuEnv !== false ? explode("\n", $contenuEnv) : [];
	foreach ($donneesEnv as $ligne) {
		$ligne = trim($ligne);
		if ($ligne === '' || $ligne[0] === '#') continue;
		if (preg_match('/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/', $ligne, $matches)) {
			$valeur = $matches[2];
			if (preg_match('/^"(.*)"$/', $valeur, $m)) {
				$valeur = $m[1];
			} elseif (preg_match("/^'(.*)'$/", $valeur, $m)) {
				$valeur = $m[1];
			} else {
				if (($pos = strpos($valeur, ' #')) !== false) {
					$valeur = rtrim(substr($valeur, 0, $pos));
				}
			}
			putenv($matches[1] . '=' . $valeur);
		}
	}
	if (getenv('AUTHORIZED_DOMAINS') !== false && getenv('AUTHORIZED_DOMAINS') !== '') {
		$domainesAutorisesEnv = getenv('AUTHORIZED_DOMAINS');
	}
}

$environnement = getenv('APP_ENV') === 'dev' ? 'dev' : 'prod';
