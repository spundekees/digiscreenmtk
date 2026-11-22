<?php

try {
	$cheminDb = __DIR__ . '/digiscreen.db';
	$nouvelleDb = !file_exists($cheminDb);
	$db = new PDO('sqlite:' . $cheminDb);
	$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	if ($nouvelleDb) {
		$db->exec("CREATE TABLE digiscreen_dgs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			cle TEXT NOT NULL,
			motdepasse TEXT NOT NULL,
			date TEXT NOT NULL,
			digidrive INTEGER NOT NULL
		)");
	}
} catch (Exception $e) {
	error_log($e->getMessage());
	http_response_code(500);
	echo 'Erreur de chargement de la base de données';
	exit();
}
