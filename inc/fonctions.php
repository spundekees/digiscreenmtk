<?php

require_once __DIR__ . '/limites.php';

define('TAILLE_MAX_TELECHARGEMENT', 200 * 1024 * 1024);
define('TAILLE_MAX_PAGE', 2 * 1024 * 1024);

function recuperer_donnees(string $url): string|false {
	global $app;
	$dgs = charger(convertirLienPartage($url), TAILLE_MAX_TELECHARGEMENT, 5);
	$admin = false;
	$bloque = false;
	$pos = strrpos($url, '/');
	$id = substr($url, $pos + 1);
	$id = str_replace('.dgs', '', $id);
	if (validerChaine($_POST['dgt'] ?? null)) {
		$baseDigidrive = getenv('DIGIDRIVE_BASE');
		if (verifierLimiteAtteinte('ticket', 'ticket')) {
			$bloque = true;
		} else if (preg_match('/^[0-9a-f]{64}$/', $_POST['dgt']) !== 1) {
			compterEchec('ticket', 'ticket');
		} else if ($baseDigidrive !== false && $baseDigidrive !== '') {
			$environnement = getenv('APP_ENV') === 'dev' ? 'dev' : 'prod';
			$ch = curl_init(rtrim($baseDigidrive, '/') . '/inc/echanger_ticket.php');
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(array('ticket' => $_POST['dgt'], 'outil' => 'digiscreen', 'contenu' => $id)));
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
			curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
			curl_setopt($ch, CURLOPT_TIMEOUT, 10);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $environnement === 'prod');
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $environnement === 'prod' ? 2 : 0);
			$corpsAssertion = curl_exec($ch);
			$erreurCurl = curl_errno($ch);
			$assertion = $erreurCurl === 0 && is_string($corpsAssertion) ? json_decode($corpsAssertion, true) : null;
			$secretValide = false;
			if (is_array($assertion) && ($assertion['statut'] ?? '') === 'ticket_valide' && ($assertion['contenu'] ?? '') === $id && is_string($assertion['secret'] ?? null) && $assertion['secret'] !== '') {
				require 'db.php';
				try {
					$stmt = $db->prepare('SELECT motdepasse FROM digiscreen_dgs WHERE cle = :cle');
					$stmt->execute(array('cle' => $id));
					$resultat = $stmt->fetchAll();
					$secretValide = $resultat && password_verify($assertion['secret'], $resultat[0]['motdepasse']);
				} catch (Exception $e) {
					error_log($e->getMessage());
				}
				$db = null;
			}
			if ($secretValide) {
				$admin = true;
				$_SESSION[$app][$id]['admin'] = true;
				session_regenerate_id(true);
			} else {
				compterEchec('ticket', 'ticket');
			}
		}
	} elseif (validerChaine($_POST['mdp'] ?? null)) {
		$motdepasse = $_POST['mdp'];
		$cleTentatives = 'tentatives_mdp_' . $id;
		if (verifierLimiteAtteinte('auteur', $cleTentatives)) {
			$bloque = true;
		} else {
			require 'db.php';
			$stmt = $db->prepare('SELECT motdepasse FROM digiscreen_dgs WHERE cle = :cle');
			try {
				$stmt->execute(array('cle' => $id));
				$resultat = $stmt->fetchAll();
				if ($resultat && password_verify($motdepasse, $resultat[0]['motdepasse'])) {
					$admin = true;
					$_SESSION[$app][$id]['admin'] = true;
					session_regenerate_id(true);
				} elseif ($resultat) {
					compterEchec('auteur', $cleTentatives);
				}
			} catch (Exception $e) {
				error_log($e->getMessage());
			}
			$db = null;
		}
	} elseif (isset($_SESSION[$app][$id]['admin'])) {
		$admin = $_SESSION[$app][$id]['admin'];
	}
	return json_encode(array('dgs' => $dgs, 'admin' => $admin, 'id' => $id, 'bloque' => $bloque));
}

function convertirLienPartage(string $url): string {
	$elements = parse_url($url);
	if ($elements === false || !isset($elements['host'])) {
		return $url;
	}
	$hote = strtolower($elements['host']);
	$chemin = $elements['path'] ?? '';
	parse_str($elements['query'] ?? '', $parametres);
	if ($hote === 'drive.google.com' || $hote === 'docs.google.com') {
		$id = '';
		if (preg_match('#/file/d/([A-Za-z0-9_-]+)#', $chemin, $correspondance)) {
			$id = $correspondance[1];
		} elseif (is_string($parametres['id'] ?? null) && preg_match('/^[A-Za-z0-9_-]+$/', $parametres['id'])) {
			$id = $parametres['id'];
		}
		return $id !== '' ? 'https://drive.google.com/uc?export=download&id=' . $id : $url;
	}
	if ($hote === 'dropbox.com' || $hote === 'www.dropbox.com') {
		unset($parametres['dl'], $parametres['raw']);
		$parametres['dl'] = '1';
		return 'https://www.dropbox.com' . $chemin . '?' . http_build_query($parametres);
	}
	$base = $elements['scheme'] . '://' . $elements['host'] . (isset($elements['port']) ? ':' . $elements['port'] : '');
	if (preg_match('#^/app/share/(\d+)/([0-9a-f-]{36})(?:/.*?/(\d+))?/?$#i', $chemin, $correspondance)) {
		$api = $base . '/2/app/' . $correspondance[1] . '/share/' . $correspondance[2];
		$fichier = $correspondance[3] ?? '';
		if ($fichier === '') {
			$reponse = charger($api . '/init', TAILLE_MAX_PAGE);
			$infos = is_string($reponse) ? json_decode($reponse, true) : null;
			$fichier = (string) ($infos['data']['file_id'] ?? '');
		}
		return ctype_digit($fichier) ? $api . '/files/' . $fichier . '/download' : $url;
	}
	if (preg_match('#^(.*/s/[A-Za-z0-9]+)/?$#', $chemin, $correspondance)) {
		return $base . $correspondance[1] . '/download';
	}
	return $url;
}

function validerUrl(string $url): bool {
	return resoudreHotePublic($url) !== null;
}

function recuperer_icone(string $url): string {
	$favicon = '';
	$urlFinale = $url;
	$html = charger($url, TAILLE_MAX_PAGE, 3, $urlFinale);
	if ($html === false) {
		return $favicon;
	}
	$regExPattern = '/((<link[^>]+rel=.(apple-touch-icon|fluid-icon)[^>]+>))/i';
	if (preg_match($regExPattern, $html, $matchTag)) {
		$regExPattern = '/href=(\'|\")(.*?)\1/i';
		if (isset($matchTag[1]) && preg_match($regExPattern, $matchTag[1], $matchUrl)) {
			if (isset($matchUrl[2])) {
				$favicon = trim($matchUrl[2]);
			}
		}
	} else {
		$regExPattern = '/((<link[^>]+rel=.(icon|shortcut icon|alternate icon)[^>]+>))/i';
		if (preg_match($regExPattern, $html, $matchTag)) {
			$regExPattern = '/href=(\'|\")(.*?)\1/i';
			if (isset($matchTag[1]) && preg_match($regExPattern, $matchTag[1], $matchUrl)) {
				if (isset($matchUrl[2])) {
					$favicon = trim($matchUrl[2]);
				}
			}
		}
	}
	if ($favicon !== '') {
		$favicon = resoudreUrlRelative($urlFinale, html_entity_decode($favicon, ENT_QUOTES | ENT_HTML5));
	}
	if ($favicon === '') {
		$favicon = resoudreUrlRelative($urlFinale, '/favicon.ico');
		$image = charger($favicon, 1048576, 3);
		set_error_handler(static fn() => true);
		$imageInfo = $image !== false ? getimagesizefromstring($image) : false;
		restore_error_handler();
		if (!$imageInfo) {
			$favicon = '';
		}
	}
	return $favicon;
}

function resoudreUrlRelative(string $base, string $relatif): string {
	$relatif = trim($relatif);
	if ($relatif === '') {
		return '';
	}
	if (preg_match('/^data:image\//i', $relatif)) {
		return $relatif;
	}
	$elements = parse_url($base);
	if ($elements === false || !isset($elements['scheme'], $elements['host'])) {
		return '';
	}
	$schema = strtolower($elements['scheme']);
	if (str_starts_with($relatif, '//')) {
		$relatif = $schema . ':' . $relatif;
	}
	if (preg_match('/^[a-z][a-z0-9+.-]*:/i', $relatif)) {
		$schemaRelatif = strtolower((string) parse_url($relatif, PHP_URL_SCHEME));
		return $schemaRelatif === 'http' || $schemaRelatif === 'https' ? $relatif : '';
	}
	$hote = str_contains($elements['host'], ':') ? '[' . $elements['host'] . ']' : $elements['host'];
	$origine = $schema . '://' . $hote . (isset($elements['port']) ? ':' . $elements['port'] : '');
	$chemin = $elements['path'] ?? '/';
	if ($relatif[0] === '?' || $relatif[0] === '#') {
		return $origine . $chemin . $relatif;
	}
	if ($relatif[0] !== '/') {
		$relatif = substr($chemin, 0, strrpos($chemin, '/') + 1) . $relatif;
	}
	$suffixe = '';
	if (preg_match('/[?#]/', $relatif, $correspondance, PREG_OFFSET_CAPTURE)) {
		$suffixe = substr($relatif, $correspondance[0][1]);
		$relatif = substr($relatif, 0, $correspondance[0][1]);
	}
	$segments = [];
	foreach (explode('/', $relatif) as $segment) {
		if ($segment === '..') {
			array_pop($segments);
		} elseif ($segment !== '.') {
			$segments[] = $segment;
		}
	}
	$relatif = implode('/', $segments);
	if (!str_starts_with($relatif, '/')) {
		$relatif = '/' . $relatif;
	}
	return $origine . $relatif . $suffixe;
}

function charger(string $url, int $tailleMax = TAILLE_MAX_TELECHARGEMENT, int $redirectionsMax = 0, ?string &$urlFinale = null): string|false {
	$urlFinale = $url;
	if (resoudreHotePublic($url) === null) {
		return false;
	}
	if (function_exists('curl_version')) {
		$content = chargerUrlPublique($url, $tailleMax, $redirectionsMax, [
			CURLOPT_USERAGENT => 'Mozilla/5.0',
			CURLOPT_CONNECTTIMEOUT => 10,
			CURLOPT_TIMEOUT => 30,
			CURLOPT_SSL_VERIFYPEER => true
		], $urlFinale);
	} else {
		$context = array('http' => array('user_agent' => 'Mozilla/5.0', 'follow_location' => 0, 'max_redirects' => 1, 'timeout' => 30));
		$context = stream_context_create($context);
		set_error_handler(static fn() => true);
		$content = file_get_contents($url, false, $context, 0, $tailleMax);
		restore_error_handler();
	}
	return $content;
}

function validerChaine(mixed $v, int $max = 255): bool {
	return is_string($v) && strlen($v) > 0 && strlen($v) <= $max;
}

function normaliserOrigine(string $url, string $schemeDefaut): string {
	if ($url === '') {
		return '';
	}
	if (strpos($url, '//') !== 0 && parse_url($url, PHP_URL_SCHEME) === null) {
		$url = '//' . $url;
	}
	$elements = parse_url($url);
	if ($elements === false || !isset($elements['host']) || $elements['host'] === '') {
		return '';
	}
	$scheme = strtolower($elements['scheme'] ?? $schemeDefaut);
	if ($scheme !== 'http' && $scheme !== 'https') {
		return '';
	}
	$origine = $scheme . '://' . strtolower($elements['host']);
	$portDefaut = $scheme === 'https' ? 443 : 80;
	if (isset($elements['port']) && $elements['port'] !== $portDefaut) {
		$origine .= ':' . $elements['port'];
	}
	return $origine;
}

function listerOriginesApplication(): array {
	$hote = $_SERVER['HTTP_HOST'] ?? '';
	$origines = [normaliserOrigine($hote, 'https'), normaliserOrigine($hote, 'http')];
	return array_values(array_filter($origines, fn($o) => $o !== ''));
}

function normaliserLien(string $lien, array $originesAutorisees): string {
	if (preg_match('/[\x00-\x20\x7f\\\\]/', $lien) === 1) {
		return '';
	}
	$elements = parse_url($lien);
	if ($elements === false || !isset($elements['scheme'], $elements['host']) || isset($elements['user']) || isset($elements['pass']) || isset($elements['fragment'])) {
		return '';
	}
	$origine = normaliserOrigine($lien, '');
	if ($origine === '' || ($originesAutorisees !== ['*'] && !in_array($origine, $originesAutorisees, true))) {
		return '';
	}
	return $origine . ($elements['path'] ?? '') . (isset($elements['query']) ? '?' . $elements['query'] : '');
}

function listerOriginesAutorisees(string $domainesAutorises, string $environnement): array {
	$origines = [];
	foreach (explode(',', $domainesAutorises) as $domaine) {
		$domaine = trim($domaine);
		if ($domaine === '') {
			continue;
		}
		$origines[] = normaliserOrigine($domaine, 'https');
		if ($environnement === 'dev' && preg_match('#^[a-z][a-z0-9+.-]*://#i', $domaine) !== 1) {
			$origines[] = normaliserOrigine($domaine, 'http');
		}
	}
	$origines = array_filter($origines, fn($o) => $o !== '' && ($environnement === 'dev' || str_starts_with($o, 'https://')));
	return array_values(array_unique($origines));
}

function analyserOrigine(string $domainesAutorises, string $environnement): array {
	if ($domainesAutorises === '*' || $domainesAutorises === '') {
		return ['autorisee' => true, 'origine' => '*', 'domaines' => []];
	}
	$listeOriginesAutorisees = listerOriginesAutorisees($domainesAutorises, $environnement);
	$origineRequete = $_SERVER['HTTP_ORIGIN'] ?? '';
	$origineNormalisee = normaliserOrigine($origineRequete, '');
	$contexteRequete = $_SERVER['HTTP_SEC_FETCH_SITE'] ?? '';
	$originesApplication = listerOriginesApplication();
	$requeteInterne = in_array($origineNormalisee, $originesApplication, true);
	if ($requeteInterne || $contexteRequete === 'same-origin') {
		// Requête interne à l'application : aucun en-tête CORS nécessaire
		return ['autorisee' => true, 'origine' => '', 'domaines' => $listeOriginesAutorisees];
	}
	if ($origineRequete === '' && $contexteRequete === '') {
		// Client sans Origin ni Sec-Fetch-Site : repli sur le Referer
		$origineReferent = normaliserOrigine((string) ($_SERVER['HTTP_REFERER'] ?? ''), '');
		$requeteInterne = in_array($origineReferent, $originesApplication, true);
		return ['autorisee' => $requeteInterne, 'origine' => '', 'domaines' => $listeOriginesAutorisees];
	}
	// Requête externe : seules les origines autorisées passent
	if (in_array($origineNormalisee, $listeOriginesAutorisees, true)) {
		return ['autorisee' => true, 'origine' => $origineNormalisee, 'domaines' => $listeOriginesAutorisees];
	}
	return ['autorisee' => false, 'origine' => '', 'domaines' => $listeOriginesAutorisees];
}

function envoyerEnTetesOrigine(string $origine): void {
	header('X-Content-Type-Options: nosniff');
	header('Vary: Origin');
	if ($origine !== '') {
		header('Access-Control-Allow-Origin: ' . $origine);
		header('Access-Control-Allow-Methods: POST, OPTIONS');
		header('Access-Control-Max-Age: 86400');
		header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
	}
}

function traiterRequeteCors(string $domainesAutorises, string $environnement, string $messageRefus): array {
	$analyse = analyserOrigine($domainesAutorises, $environnement);
	envoyerEnTetesOrigine($analyse['origine']);
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		http_response_code($analyse['autorisee'] ? 204 : 403);
		exit();
	}
	if (!$analyse['autorisee']) {
		http_response_code(403);
		exit($messageRefus);
	}
	return $analyse['domaines'];
}

function verifierIpPublique(string $ip): bool {
	if (filter_var($ip, FILTER_VALIDATE_IP) === false) {
		return false;
	}
	if (stripos($ip, '::ffff:') === 0 && filter_var(substr($ip, 7), FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false) {
		return verifierIpPublique(substr($ip, 7));
	}
	if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
		return false;
	}
	if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false) {
		$valeur = ip2long($ip);
		foreach ([['100.64.0.0', 10], ['192.0.0.0', 24], ['198.18.0.0', 15]] as [$reseau, $masque]) {
			if (($valeur >> (32 - $masque)) === (ip2long($reseau) >> (32 - $masque))) {
				return false;
			}
		}
	}
	return true;
}

function resoudreHotePublic(string $url): ?array {
	$elements = parse_url($url);
	if ($elements === false || !isset($elements['scheme'], $elements['host']) || isset($elements['user']) || isset($elements['pass'])) {
		return null;
	}
	$schema = strtolower($elements['scheme']);
	if ($schema !== 'http' && $schema !== 'https') {
		return null;
	}
	$hote = trim($elements['host'], '[]');
	$port = isset($elements['port']) ? (int)$elements['port'] : ($schema === 'https' ? 443 : 80);
	if (filter_var($hote, FILTER_VALIDATE_IP) !== false) {
		$adresses = [$hote];
	} else {
		$adresses = [];
		set_error_handler(static fn() => true);
		$enregistrements = dns_get_record($hote, DNS_A | DNS_AAAA);
		restore_error_handler();
		foreach (is_array($enregistrements) ? $enregistrements : [] as $enregistrement) {
			if (isset($enregistrement['ip'])) {
				$adresses[] = $enregistrement['ip'];
			}
			if (isset($enregistrement['ipv6'])) {
				$adresses[] = $enregistrement['ipv6'];
			}
		}
		$ipv4 = gethostbynamel($hote);
		$adresses = array_values(array_unique(array_merge($adresses, is_array($ipv4) ? $ipv4 : [])));
	}
	if ($adresses === []) {
		return null;
	}
	foreach ($adresses as $adresse) {
		if (!verifierIpPublique($adresse)) {
			return null;
		}
	}
	$ipv4 = array_values(array_filter($adresses, static fn($adresse) => filter_var($adresse, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false));
	return ['hote' => $hote, 'port' => $port, 'ip' => $ipv4[0] ?? $adresses[0]];
}

function chargerUrlPublique(string $url, int $tailleMax, int $redirectionsMax = 5, array $options = [], ?string &$urlFinale = null): string|false {
	for ($etape = 0; $etape <= $redirectionsMax; $etape++) {
		$cible = resoudreHotePublic($url);
		if ($cible === null) {
			return false;
		}
		$ip = str_contains($cible['ip'], ':') ? '[' . $cible['ip'] . ']' : $cible['ip'];
		$ch = curl_init($url);
		curl_setopt_array($ch, $options + [
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_HEADER => false,
			CURLOPT_FOLLOWLOCATION => false,
			CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
			CURLOPT_CONNECTTIMEOUT => 5,
			CURLOPT_TIMEOUT => 10,
			CURLOPT_NOPROXY => '*',
			CURLOPT_RESOLVE => [$cible['hote'] . ':' . $cible['port'] . ':' . $ip],
			CURLOPT_MAXFILESIZE => $tailleMax,
			CURLOPT_NOPROGRESS => false,
			CURLOPT_PROGRESSFUNCTION => static fn($ressource, $taille, $telecharge) => ($taille > $tailleMax || $telecharge > $tailleMax) ? 1 : 0
		]);
		$corps = curl_exec($ch);
		if (curl_errno($ch) || !is_string($corps)) {
			return false;
		}
		$code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
		$suivante = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
		if ($code >= 300 && $code < 400 && is_string($suivante) && $suivante !== '') {
			$url = $suivante;
			continue;
		}
		$urlFinale = $url;
		return $corps;
	}
	return false;
}

