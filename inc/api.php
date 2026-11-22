<?php

$app = 'digiscreen';
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
$path = rtrim(dirname(dirname($_SERVER['PHP_SELF'])), '/') . '/';

$methode = $_SERVER['REQUEST_METHOD'];

if ($methode !== 'POST' && $methode !== 'OPTIONS') {
	header('Location: ' . $path);
	exit();
}

require 'env.php';
require 'fonctions.php';

header('Content-Type: text/plain; charset=utf-8');
$listeDomainesAutorises = traiterRequeteCors($domainesAutorisesEnv, $environnement, 'erreur');

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

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$contentTypeJson = strpos($contentType, 'application/json') !== false;
$contentTypeMultipart = strpos($contentType, 'multipart/form-data') !== false;
if (!$contentTypeJson && !$contentTypeMultipart) {
	http_response_code(415);
	echo 'erreur';
	exit();
}

if ($contentTypeJson) {
	$_POST = json_decode(file_get_contents('php://input'), true) ?? [];
}

if (validerChaine($_POST['token'] ?? null) && validerChaine($_POST['lien'] ?? null, 2048)) {
	$token = $_POST['token'];
	$domaine = $_SERVER['SERVER_NAME'];
	$originesLien = $environnement === 'dev' && $domainesAutorisesEnv === '*' ? ['*'] : $listeDomainesAutorises;
	$lien = empty($originesLien) ? '' : normaliserLien($_POST['lien'], $originesLien);
	if ($lien === '') {
		if (empty($originesLien) && ($domainesAutorisesEnv === '' || $domainesAutorisesEnv === '*')) {
			error_log('API désactivée : la variable d\'environnement AUTHORIZED_DOMAINS doit contenir la liste des domaines autorisés.');
		} elseif (empty($originesLien)) {
			error_log('API désactivée : aucun domaine valide dans AUTHORIZED_DOMAINS (les domaines en http sont ignorés si APP_ENV n\'est pas dev).');
		}
		http_response_code(403);
		echo 'erreur';
		exit();
	}
	$donnees = array(
		'token' => $token,
		'domaine' => $domaine
	);
	$donnees = http_build_query($donnees);
	$ch = curl_init($lien);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $donnees);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
	curl_setopt($ch, CURLOPT_TIMEOUT, 10);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $environnement === 'prod');
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $environnement === 'prod' ? 2 : 0);
	$resultat = curl_exec($ch);
	if (curl_errno($ch)) {
		http_response_code(502);
		echo 'erreur';
		exit();
	}
	if ($resultat === 'non_autorise' || $resultat === 'erreur') {
		http_response_code(401);
		echo 'erreur_token';
		exit();
	} elseif ($resultat === 'token_autorise' && validerChaine($_POST['action'] ?? null, 20)) {
		$action = $_POST['action'];
		$actionsProtegees = ['modifier', 'dupliquer', 'remplacer', 'supprimer'];
		$cleTentativesApi = '';
		if (in_array($action, $actionsProtegees)) {
			$cleTentativesApi = 'tentatives_mdp_' . $_POST['id'];
			if (verifierLimiteAtteinte('auteur', $cleTentativesApi)) {
				http_response_code(429);
				echo 'tentatives_trop_nombreuses';
				exit();
			}
		}
		if ($action === 'creer') {
			if (!consommerQuota('creation', 'creation')) {
				http_response_code(429);
				echo 'erreur';
				exit();
			}
		} elseif ($action === 'televerser') {
			if (!consommerQuota('creation', 'creation')) {
				http_response_code(429);
				echo 'erreur';
				exit();
			}
		}
		if ($action === 'televerser' && validerChaine($_POST['id'] ?? null) && validerChaine($_POST['motdepasse'] ?? null) && !empty($_FILES['fichier']) && $_FILES['fichier']['error'] === UPLOAD_ERR_OK) {
			require 'db.php';
			$id = $_POST['id'];
			$motdepasse = password_hash($_POST['motdepasse'], PASSWORD_DEFAULT);
			$date = date('Y-m-d H:i:s');
			$digidrive = 1;
			$stmt = $db->prepare('INSERT INTO digiscreen_dgs (cle, motdepasse, date, digidrive) VALUES (:cle, :motdepasse, :date, :digidrive)');
			try {
				$stmt->execute(array('cle' => $id, 'motdepasse' => $motdepasse, 'date' => $date, 'digidrive' => $digidrive));
				$ext = pathinfo($_FILES['fichier']['name'], PATHINFO_EXTENSION);
				$finfo = new finfo(FILEINFO_MIME_TYPE);
				$mime = $finfo->file($_FILES['fichier']['tmp_name']);
				if ($ext === 'dgs' && in_array($mime, ['application/json', 'text/plain', 'text/json'])) {
					$fichier = null;
					try {
						$fichier = fopen($_FILES['fichier']['tmp_name'], 'rb');
						$s3Client->putObject([
							'Bucket' => $s3Bucket,
							'Key' => $id . '.dgs',
							'Body' => $fichier,
							'ACL' => 'public-read'
						]);
						echo 'fichier_televerse';
					} catch (Aws\S3\Exception\S3Exception $e) {
						http_response_code(500);
						echo 'erreur';
					} finally {
						if (is_resource($fichier)) {
							fclose($fichier);
						}
					}
				} else {
					http_response_code(400);
					echo 'erreur';
				}
			} catch (Exception $e) {
				error_log($e->getMessage());
				http_response_code(500);
				echo 'erreur';
			}
			$db = null;
		} elseif ($action === 'creer' && validerChaine($_POST['id'] ?? null) && validerChaine($_POST['motdepasse'] ?? null)) {
			require 'db.php';
			$id = $_POST['id'];
			$motdepasse = password_hash($_POST['motdepasse'], PASSWORD_DEFAULT);
			$date = date('Y-m-d H:i:s');
			$digidrive = 1;
			$stmt = $db->prepare('INSERT INTO digiscreen_dgs (cle, motdepasse, date, digidrive) VALUES (:cle, :motdepasse, :date, :digidrive)');
			try {
				$stmt->execute(array('cle' => $id, 'motdepasse' => $motdepasse, 'date' => $date, 'digidrive' => $digidrive));
				$fichier = null;
				try {
					$fichier = fopen('modele.dgs', 'rb');
					$s3Client->putObject([
						'Bucket' => $s3Bucket,
						'Key' => $id . '.dgs',
						'Body' => $fichier,
						'ACL' => 'public-read'
					]);
					echo 'fichier_televerse';
				} catch (Aws\S3\Exception\S3Exception $e) {
					http_response_code(500);
					echo 'erreur';
				} finally {
					if (is_resource($fichier)) {
						fclose($fichier);
					}
				}
			} catch (Exception $e) {
				error_log($e->getMessage());
				http_response_code(500);
				echo 'erreur';
			}
			$db = null;
		} elseif ($action === 'modifier' && validerChaine($_POST['id'] ?? null) && validerChaine($_POST['motdepasse'] ?? null) && validerChaine($_POST['ancienmotdepasse'] ?? null)) {
			require 'db.php';
			$id = $_POST['id'];
			$motdepasse = password_hash($_POST['motdepasse'], PASSWORD_DEFAULT);
			$ancienmotdepasse = $_POST['ancienmotdepasse'];
			$stmt = $db->prepare('SELECT motdepasse FROM digiscreen_dgs WHERE cle = :cle');
			try {
				$stmt->execute(array('cle' => $id));
				$resultat = $stmt->fetchAll();
				if (!$resultat) {
					http_response_code(404);
					echo 'contenu_inexistant';
				} elseif (password_verify($ancienmotdepasse, $resultat[0]['motdepasse'])) {
					$stmt = $db->prepare('UPDATE digiscreen_dgs SET motdepasse = :motdepasse WHERE cle = :cle');
					$stmt->execute(array('motdepasse' => $motdepasse, 'cle' => $id));
					echo 'informations_modifiees';
				} else {
					if ($cleTentativesApi !== '') compterEchec('auteur', $cleTentativesApi);
					http_response_code(401);
					echo 'non_autorise';
				}
			} catch (Exception $e) {
				error_log($e->getMessage());
				http_response_code(500);
				echo 'erreur';
			}
			$db = null;
		} elseif ($action === 'dupliquer' && validerChaine($_POST['id'] ?? null) && validerChaine($_POST['cle'] ?? null) && validerChaine($_POST['motdepasse'] ?? null) && validerChaine($_POST['nouveaumotdepasse'] ?? null)) {
			require 'db.php';
			$id = $_POST['id'];
			$motdepasse = $_POST['motdepasse'];
			$stmt = $db->prepare('SELECT motdepasse FROM digiscreen_dgs WHERE cle = :cle');
			try {
				$stmt->execute(array('cle' => $id));
				$resultat = $stmt->fetchAll();
				if (!$resultat) {
					http_response_code(404);
					echo 'contenu_inexistant';
				} elseif (password_verify($motdepasse, $resultat[0]['motdepasse'])) {
					$cle = $_POST['cle'];
					$nmotdepasse = password_hash($_POST['nouveaumotdepasse'], PASSWORD_DEFAULT);
					$date = date('Y-m-d H:i:s');
					$digidrive = 1;
					$stmt = $db->prepare('INSERT INTO digiscreen_dgs (cle, motdepasse, date, digidrive) VALUES (:cle, :motdepasse, :date, :digidrive)');
					$stmt->execute(array('cle' => $cle, 'motdepasse' => $nmotdepasse, 'date' => $date, 'digidrive' => $digidrive));
					$dgs = $id . '.dgs';
					$source = $s3Bucket . '/' . $dgs;
					try {
						$s3Client->copyObject([
							'Bucket' => $s3Bucket,
							'Key' => $cle . '.dgs',
							'CopySource' => $source,
							'ACL' => 'public-read'
						]);
						echo $cle;
					} catch (Aws\S3\Exception\S3Exception $e) {
						http_response_code(500);
						echo 'erreur';
					}
				} else {
					if ($cleTentativesApi !== '') compterEchec('auteur', $cleTentativesApi);
					http_response_code(401);
					echo 'non_autorise';
				}
			} catch (Exception $e) {
				error_log($e->getMessage());
				http_response_code(500);
				echo 'erreur';
			}
			$db = null;
		} elseif ($action === 'supprimer' && validerChaine($_POST['id'] ?? null) && validerChaine($_POST['motdepasse'] ?? null)) {
			require 'db.php';
			$id = $_POST['id'];
			$motdepasse = $_POST['motdepasse'];
			$stmt = $db->prepare('SELECT motdepasse FROM digiscreen_dgs WHERE cle = :cle');
			try {
				$stmt->execute(array('cle' => $id));
				$resultat = $stmt->fetchAll();
				if (!$resultat) {
					echo 'contenu_supprime';
				} elseif (password_verify($motdepasse, $resultat[0]['motdepasse'])) {
					$stmt = $db->prepare('DELETE FROM digiscreen_dgs WHERE cle = :cle');
					$stmt->execute(array('cle' => $id));
					$dgs = $id . '.dgs';
					try {
						$s3Client->deleteObject([
							'Bucket' => $s3Bucket,
							'Key' => $dgs
						]);
						echo 'contenu_supprime';
					} catch (Aws\S3\Exception\S3Exception $e) {
						http_response_code(500);
						echo 'erreur';
					}
				} else {
					if ($cleTentativesApi !== '') compterEchec('auteur', $cleTentativesApi);
					http_response_code(401);
					echo 'non_autorise';
				}
			} catch (Exception $e) {
				error_log($e->getMessage());
				http_response_code(500);
				echo 'erreur';
			}
			$db = null;
		} elseif ($action === 'remplacer' && validerChaine($_POST['id'] ?? null) && validerChaine($_POST['motdepasse'] ?? null) && !empty($_FILES['fichier']) && $_FILES['fichier']['error'] === UPLOAD_ERR_OK) {
			require 'db.php';
			$id = $_POST['id'];
			$motdepasse = $_POST['motdepasse'];
			$stmt = $db->prepare('SELECT motdepasse FROM digiscreen_dgs WHERE cle = :cle');
			try {
				$stmt->execute(array('cle' => $id));
				$resultat = $stmt->fetchAll();
				if (!$resultat) {
					http_response_code(404);
					echo 'contenu_inexistant';
				} elseif (password_verify($motdepasse, $resultat[0]['motdepasse'])) {
					$ext = strtolower(pathinfo($_FILES['fichier']['name'], PATHINFO_EXTENSION));
					$finfo = new finfo(FILEINFO_MIME_TYPE);
					$mime = $finfo->file($_FILES['fichier']['tmp_name']);
					if ($ext === 'dgs' && in_array($mime, ['application/json', 'text/plain', 'text/json']) && $_FILES['fichier']['size'] <= TAILLE_MAX_TELECHARGEMENT) {
						$fichier = null;
						try {
							$fichier = fopen($_FILES['fichier']['tmp_name'], 'rb');
							$s3Client->putObject([
								'Bucket' => $s3Bucket,
								'Key' => $id . '.dgs',
								'Body' => $fichier,
								'ACL' => 'public-read'
							]);
							echo 'fichier_televerse';
						} catch (Aws\S3\Exception\S3Exception $e) {
							http_response_code(500);
							echo 'erreur';
						} finally {
							if (is_resource($fichier)) {
								fclose($fichier);
							}
						}
					} else {
						http_response_code(400);
						echo 'erreur_dgs';
					}
				} else {
					if ($cleTentativesApi !== '') compterEchec('auteur', $cleTentativesApi);
					http_response_code(401);
					echo 'non_autorise';
				}
			} catch (Exception $e) {
				error_log($e->getMessage());
				http_response_code(500);
				echo 'erreur';
			}
			$db = null;
		} elseif (($action === 'televerser' || $action === 'remplacer') && !empty($_FILES['fichier']) && $_FILES['fichier']['error'] !== UPLOAD_ERR_OK) {
			http_response_code(400);
			echo 'erreur';
		} else {
			if ($cleTentativesApi !== '') compterEchec('auteur', $cleTentativesApi);
			http_response_code(400);
			echo 'erreur';
		}
	} else {
		http_response_code(401);
		echo 'erreur';
	}
	exit();
} else {
	http_response_code(400);
	echo 'erreur';
	exit();
}
