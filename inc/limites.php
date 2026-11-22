<?php

function lireLimiteEnv(string $nom, int $defaut): int {
	$valeur = getenv($nom);
	return is_string($valeur) && ctype_digit($valeur) && (int) $valeur > 0 ? (int) $valeur : $defaut;
}

function lireConfigurationLimite(string $categorie): array {
	static $configurations = null;
	if ($configurations === null) {
		$configurations = [
			'auteur' => ['max' => lireLimiteEnv('RATE_LIMIT_AUTHOR_FAILURES', 20), 'duree' => lireLimiteEnv('RATE_LIMIT_AUTHOR_WINDOW', 900), 'ouvert' => true, 'adresse' => true],
			'activite' => ['max' => lireLimiteEnv('RATE_LIMIT_ACTIVITY_FAILURES', 1000), 'duree' => lireLimiteEnv('RATE_LIMIT_ACTIVITY_WINDOW', 3600), 'ouvert' => true, 'adresse' => true],
			'creation' => ['max' => lireLimiteEnv('RATE_LIMIT_CREATIONS', 600), 'duree' => 3600, 'ouvert' => true, 'adresse' => true],
			'depot' => ['max' => lireLimiteEnv('RATE_LIMIT_SUBMISSIONS', 1000), 'duree' => 3600, 'ouvert' => true, 'adresse' => true],
			'api' => ['max' => lireLimiteEnv('RATE_LIMIT_API', 600), 'duree' => 3600, 'ouvert' => true, 'adresse' => true],
			'ouverture' => ['max' => lireLimiteEnv('RATE_LIMIT_OPENINGS', 600), 'duree' => 600, 'ouvert' => true, 'adresse' => true],
			'echange_ticket' => ['max' => lireLimiteEnv('RATE_LIMIT_TICKET_EXCHANGE_FAILURES', 1200), 'duree' => 600, 'ouvert' => true, 'adresse' => true],
			'ticket' => ['max' => lireLimiteEnv('RATE_LIMIT_TICKET_FAILURES', 30), 'duree' => 600, 'ouvert' => true, 'adresse' => true],
			'reseau' => ['max' => lireLimiteEnv('RATE_LIMIT_NETWORK', 150), 'duree' => 600, 'ouvert' => true, 'adresse' => true],
			'google' => ['max' => lireLimiteEnv('RATE_LIMIT_GOOGLE', 40), 'duree' => 600, 'ouvert' => false, 'adresse' => true],
			'emails' => ['max' => lireLimiteEnv('RATE_LIMIT_EMAILS', 200), 'duree' => 3600, 'ouvert' => false, 'adresse' => true],
			'emails_destinataire' => ['max' => lireLimiteEnv('RATE_LIMIT_EMAILS_PER_RECIPIENT', 3), 'duree' => 3600, 'ouvert' => false, 'adresse' => false],
			'reinitialisation' => ['max' => lireLimiteEnv('RATE_LIMIT_PASSWORD_RESETS', 20), 'duree' => 3600, 'ouvert' => false, 'adresse' => true],
			'reinitialisation_email' => ['max' => lireLimiteEnv('RATE_LIMIT_PASSWORD_RESETS_PER_EMAIL', 3), 'duree' => 3600, 'ouvert' => false, 'adresse' => false]
		];
	}
	if (!isset($configurations[$categorie])) {
		throw new InvalidArgumentException('Catégorie de limite inconnue : ' . $categorie);
	}
	return $configurations[$categorie];
}

function verifierAdresseReseau(string $adresse, string $reseau): bool {
	$parties = explode('/', trim($reseau), 2);
	$binaireAdresse = @inet_pton($adresse);
	$binaireReseau = @inet_pton($parties[0]);
	if ($binaireAdresse === false || $binaireReseau === false || strlen($binaireAdresse) !== strlen($binaireReseau)) {
		return false;
	}
	$bits = isset($parties[1]) && ctype_digit($parties[1]) ? min((int) $parties[1], strlen($binaireAdresse) * 8) : strlen($binaireAdresse) * 8;
	$octets = intdiv($bits, 8);
	if (substr($binaireAdresse, 0, $octets) !== substr($binaireReseau, 0, $octets)) {
		return false;
	}
	$bitsRestants = $bits % 8;
	if ($bitsRestants === 0) {
		return true;
	}
	$masqueOctet = (0xff << (8 - $bitsRestants)) & 0xff;
	return (ord($binaireAdresse[$octets]) & $masqueOctet) === (ord($binaireReseau[$octets]) & $masqueOctet);
}

function determinerAdresseClient(): string {
	$adresse = trim((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
	$proxys = array_filter(array_map('trim', explode(',', (string) getenv('TRUSTED_PROXIES'))));
	$verifierProxy = function (string $candidat) use ($proxys): bool {
		foreach ($proxys as $proxy) {
			if (verifierAdresseReseau($candidat, $proxy)) {
				return true;
			}
		}
		return false;
	};
	if ($adresse !== '' && $proxys && $verifierProxy($adresse) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
		$chaine = array_reverse(array_map('trim', explode(',', (string) $_SERVER['HTTP_X_FORWARDED_FOR'])));
		foreach ($chaine as $candidat) {
			if (@inet_pton($candidat) === false) {
				break;
			}
			$adresse = $candidat;
			if (!$verifierProxy($candidat)) {
				break;
			}
		}
	}
	$binaire = @inet_pton($adresse);
	if ($binaire === false) {
		return '';
	}
	if (strlen($binaire) === 16) {
		if (substr($binaire, 0, 12) === str_repeat("\0", 10) . "\xff\xff") {
			return inet_ntop(substr($binaire, 12));
		}
		return inet_ntop(substr($binaire, 0, 8) . str_repeat("\0", 8)) . '/64';
	}
	return inet_ntop($binaire);
}

function preparerDossierLimites(): string {
	static $dossier = null;
	if ($dossier !== null) {
		return $dossier;
	}
	foreach ([__DIR__ . '/cache', sys_get_temp_dir() . '/' . basename(dirname(__DIR__)) . '-' . sha1(__DIR__)] as $index => $candidat) {
		if (!is_dir($candidat) && !@mkdir($candidat, 0700, true) && !is_dir($candidat)) {
			continue;
		}
		if (!is_writable($candidat)) {
			continue;
		}
		if ($index === 0 && !file_exists($candidat . '/.htaccess')) {
			@file_put_contents($candidat . '/.htaccess', "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
		}
		return $dossier = $candidat;
	}
	return $dossier = '';
}

function signalerLimitesIndisponibles(string $motif): void {
	static $signalementEffectue = false;
	if (!$signalementEffectue) {
		$signalementEffectue = true;
		error_log('Limites de débit indisponibles : ' . $motif);
	}
}

function envoyerRetryAfter(int $secondes): void {
	if (!headers_sent()) {
		header('Retry-After: ' . max(1, $secondes));
	}
}

function purgerLimites(string $dossier): void {
	$marqueur = $dossier . '/.purge';
	$date = @filemtime($marqueur);
	if ($date !== false && time() - $date < 600) {
		return;
	}
	@touch($marqueur);
	$limite = time() - max(3600, lireLimiteEnv('RATE_LIMIT_AUTHOR_WINDOW', 900), lireLimiteEnv('RATE_LIMIT_ACTIVITY_WINDOW', 3600));
	foreach (['limite-', 'echecs-', 'ip-'] as $prefixe) {
		foreach (glob($dossier . '/' . $prefixe . '*.json', GLOB_NOSORT) ?: [] as $fichier) {
			$modification = @filemtime($fichier);
			if ($modification !== false && $modification < $limite) {
				@unlink($fichier);
			}
		}
	}
}

function accederCompteur(string $categorie, string $cle, string $mode): ?array {
	$configuration = lireConfigurationLimite($categorie);
	$dossier = preparerDossierLimites();
	if ($dossier === '') {
		signalerLimitesIndisponibles('aucun dossier de cache accessible en écriture');
		return null;
	}
	$adresse = '';
	if ($configuration['adresse']) {
		$adresse = determinerAdresseClient();
		if ($adresse === '') {
			signalerLimitesIndisponibles('adresse du client inconnue');
			return null;
		}
	}
	$chemin = $dossier . '/limite-' . sha1($categorie . '|' . $adresse . '|' . $cle) . '.json';
	$flux = @fopen($chemin, 'c+');
	if ($flux === false) {
		signalerLimitesIndisponibles('compteur inaccessible en écriture');
		return null;
	}
	if (!flock($flux, LOCK_EX)) {
		fclose($flux);
		signalerLimitesIndisponibles('verrou impossible sur un compteur');
		return null;
	}
	$etat = json_decode((string) stream_get_contents($flux), true);
	if (!is_array($etat) || !isset($etat['compteur'], $etat['debut']) || time() - (int) $etat['debut'] >= $configuration['duree']) {
		$etat = ['compteur' => 0, 'debut' => time()];
	}
	$etat = ['compteur' => (int) $etat['compteur'], 'debut' => (int) $etat['debut']];
	$quotaDisponible = $etat['compteur'] < $configuration['max'];
	$compteur = $etat['compteur'];
	if ($mode === 'compter' || ($mode === 'consommer' && $quotaDisponible)) {
		$compteur++;
	} else if ($mode === 'restituer' && $compteur > 0) {
		$compteur--;
	}
	if ($compteur !== $etat['compteur']) {
		$etat['compteur'] = $compteur;
		ftruncate($flux, 0);
		rewind($flux);
		fwrite($flux, json_encode($etat));
		fflush($flux);
	}
	flock($flux, LOCK_UN);
	fclose($flux);
	purgerLimites($dossier);
	$etat['autorise'] = $quotaDisponible;
	return $etat;
}

function &listerReservationsLimites(): array {
	static $reservations = [];
	return $reservations;
}

function restituerReservationsLimites(): void {
	foreach (listerReservationsLimites() as $identifiant => $nombre) {
		[$categorie, $cle] = explode('|', $identifiant, 2);
		for ($i = 0; $i < $nombre; $i++) {
			accederCompteur($categorie, $cle, 'restituer');
		}
	}
}

function verifierLimiteAtteinte(string $categorie, string $cle): bool {
	static $remboursementPrevu = false;
	$configuration = lireConfigurationLimite($categorie);
	$etat = accederCompteur($categorie, $cle, 'consommer');
	if ($etat === null) {
		return !$configuration['ouvert'];
	}
	if (!$etat['autorise']) {
		envoyerRetryAfter($etat['debut'] + $configuration['duree'] - time());
		return true;
	}
	if (!$remboursementPrevu) {
		register_shutdown_function('restituerReservationsLimites');
		$remboursementPrevu = true;
	}
	$reservations = &listerReservationsLimites();
	$identifiant = $categorie . '|' . $cle;
	$reservations[$identifiant] = ($reservations[$identifiant] ?? 0) + 1;
	return false;
}

function compterEchec(string $categorie, string $cle): void {
	$reservations = &listerReservationsLimites();
	$identifiant = $categorie . '|' . $cle;
	if (($reservations[$identifiant] ?? 0) > 0) {
		$reservations[$identifiant]--;
		return;
	}
	accederCompteur($categorie, $cle, 'compter');
}

function consommerQuota(string $categorie, string $cle): bool {
	$configuration = lireConfigurationLimite($categorie);
	$etat = accederCompteur($categorie, $cle, 'consommer');
	if ($etat === null) {
		return $configuration['ouvert'];
	}
	if ($etat['autorise']) {
		return true;
	}
	envoyerRetryAfter($etat['debut'] + $configuration['duree'] - time());
	return false;
}
