<?php

require 'headers.php';

use Aws\S3\S3Client;

require_once '../vendor/autoload.php';

$s3Endpoint = getenv('S3_ENDPOINT');
$s3AccessKey = getenv('S3_ACCESS_KEY');
$s3SecretKey = getenv('S3_SECRET_KEY');
$s3Region = getenv('S3_REGION');
$s3Bucket = getenv('S3_BUCKET');
if (!$s3Endpoint || !$s3AccessKey || !$s3SecretKey || !$s3Region || !$s3Bucket) {
    error_log('Toutes les variables d\'environnement S3 n\'ont pas été définies.');
    http_response_code(500);
    echo 'erreur';
    exit();
}
$s3Client = new S3Client([
	'version' => 'latest',
	'endpoint' => $s3Endpoint,
	'region'  => $s3Region,
	'credentials' => [
		'key' => $s3AccessKey,
		'secret' => $s3SecretKey
	]
]);

if (!empty($_FILES['fichier']) && $_FILES['fichier']['error'] === UPLOAD_ERR_OK && validerChaine($_POST['id'] ?? null)) {
	require 'db.php';
	$id = $_POST['id'];
	$motdepasse = $_POST['motdepasse'] ?? '';
	$sessionAdmin = isset($_SESSION[$app][$id]['admin']) && $_SESSION[$app][$id]['admin'] === true;
	$cleTentatives = 'tentatives_mdp_' . $id;
	$stmt = $db->prepare('SELECT motdepasse FROM digiscreen_dgs WHERE cle = :cle');
	try {
		$stmt->execute(array('cle' => $id));
		$resultat = $stmt->fetchAll();
		if (!$resultat) {
			http_response_code(404);
			echo 'contenu_inexistant';
		} else if (!$sessionAdmin && verifierLimiteAtteinte('auteur', $cleTentatives)) {
			http_response_code(429);
			echo 'tentatives_trop_nombreuses';
		} else if ($sessionAdmin || (is_string($motdepasse) && $motdepasse !== '' && password_verify($motdepasse, $resultat[0]['motdepasse']))) {
			$fichier = null;
			try {
				$fichier = fopen($_FILES['fichier']['tmp_name'], 'rb');
				$s3Client->putObject([
					'Bucket' => $s3Bucket,
					'Key' => $id . '.dgs',
					'Body' => $fichier,
					'ACL' => 'public-read'
				]);
				echo 'donnees_enregistrees';
			} catch (Aws\S3\Exception\S3Exception $e) {
				http_response_code(500);
				echo 'erreur';
			} finally {
				if (is_resource($fichier)) {
					fclose($fichier);
				}
			}
		} else {
			compterEchec('auteur', $cleTentatives);
			http_response_code(401);
			echo 'non_autorise';
		}
	} catch (Exception $e) {
		error_log($e->getMessage());
		http_response_code(500);
		echo 'erreur';
	}
	$db = null;
	exit();
} else {
	http_response_code(400);
	exit('Requête invalide');
}
