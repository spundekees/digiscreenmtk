<template>
	<main :style="styleFond" :class="{ 'sans-logo': fondBeschreibbar && page !== 1, 'logo-bas': fondEcriture && !lectureSeule }">
		<h1 class="lecteur-ecran">Digiscreen by La Digitale</h1>
		<div id="alerte" v-if="alerte">
			<div class="conteneur">
				<span class="marque">Digiscreen by La Digitale</span>
				<span class="message">{{ $t('alerte') }}</span>
			</div>
		</div>

		<div id="chargement" v-if="chargement">Digiscreen by La Digitale<span class="lecteur-ecran"> - {{ $t('chargementEnCours') }}</span></div>

		<div id="import" :class="{'termine': importTermine}" v-if="importDonnees">
			<div class="chargement"><div aria-hidden="true" /><div aria-hidden="true" /><div aria-hidden="true" /><div aria-hidden="true" /><div aria-hidden="true" /><div aria-hidden="true" /><div aria-hidden="true" /><div aria-hidden="true" /><div aria-hidden="true" /><span class="lecteur-ecran">{{ $t('chargementEnCours') }}</span></div>
		</div>

		<Chargement :chargementPage="chargementPage" v-if="chargementPage" />

		<div id="pages" v-if="pages.length > 1" :data-html2canvas-ignore="true">
			<div>
				<button type="button" :disabled="disabled" :title="$t('page') + ' ' + index" :aria-label="$t('page') + ' ' + index" :aria-current="page === index ? 'page' : null" :class="{'selectionne': page === index}" @click="afficherPage(index)" v-for="index in pages.length" :key="'page_' + index" ></button>
			</div>
		</div>

		<Annotation :panneaux="panneaux" :annotations="annotations" :largeur="largeur" :hauteur="hauteur" :nav="nav" @fermer="arreterAnnoter" @outilDeplacer="definirOutilDeplacer" v-if="annotation" />

		<div id="grille" :class="grille.couleur + ' grille-' + grille.colonnes" v-if="Object.keys(grille).length > 0">
			<span v-for="element in (grille.colonnes * grille.lignes)" :key="'element_' + element" />
		</div>

		<div id="panneaux" @click="verifierPanneauAffiche">
			<template v-for="panneau in panneauxPage">
				<PCodeqr :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-if="panneau.type === 'codeqr'" :key="'codeqr_' + panneau.id" />
				<PTexte :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'texte'" :key="'texte_' + panneau.id" />
				<PSeyes :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'seyes'" :key="'seyes_' + panneau.id" />
				<PTableau :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'tableau'" :key="'tableau_' + panneau.id" />
				<PImage :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'image'" :key="'image_' + panneau.id" />
				<PGalerie :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'galerie'" :key="'galerie_' + panneau.id" />
				<PDessin :panneau="panneau" :pages="pages" :nav="nav" :largeurPage="largeur" :hauteurPage="hauteur" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'dessin'" :key="'dessin_' + panneau.id" />
				<PDocument :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'document'" :key="'document_' + panneau.id" />
				<PAudio :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'audio'" :key="'audio_' + panneau.id" />
				<PEnregistrement :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'enregistrement'" :key="'enregistrement_' + panneau.id" />
				<PSynthese :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" :listeVoix="listeVoix" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'synthese'" :key="'synthese_' + panneau.id" />
				<PVideo :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'video'" :key="'video_' + panneau.id" />
				<PWebcam :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'webcam'" :key="'webcam_' + panneau.id" />
				<PPartage :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'partage-ecran'" :key="'partage-ecran_' + panneau.id" />
				<PLien :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'lien'" :key="'lien_' + panneau.id" />
				<PIframe :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'iframe'" :key="'iframe_' + panneau.id" />
				<PHtml :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'html'" :key="'html_' + panneau.id" />
				<PListe :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'liste'" :key="'liste_' + panneau.id" />
				<PNuage :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'nuage'" :key="'nuage_' + panneau.id" />
				<POrdre :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'ordre'" :key="'ordre_' + panneau.id" />
				<PImagesSequentielles :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'images-sequentielles'" :key="'images-sequentielles_' + panneau.id" />
				<PTrous :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'trous'" :key="'trous_' + panneau.id" />
				<PSurlignage :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'surlignage'" :key="'surlignage_' + panneau.id" />
				<PMotMystere :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'mot-mystere'" :key="'mot-mystere_' + panneau.id" />
				<PCartes :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'cartes'" :key="'cartes_' + panneau.id" />
				<PAppariement :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'appariement'" :key="'appariement_' + panneau.id" />
				<PCategories :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'categories'" :key="'categories_' + panneau.id" />
				<PTirageTexte :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'tirage' || panneau.type === 'tirage-texte'" :key="'tirage-texte_' + panneau.id" />
				<PTirageNombre :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'tirage-nombre'" :key="'tirage-nombre_' + panneau.id" />
				<PTirageImage :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'tirage-image'" :key="'tirage-image_' + panneau.id" />
				<PTirageAudio :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'tirage-audio'" :key="'tirage-audio_' + panneau.id" />
				<PRoue :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'roue'" :key="'roue_' + panneau.id" />
				<PHistoire :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'histoire'" :key="'histoire_' + panneau.id" />
				<PPlateau :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'plateau'" :key="'plateau_' + panneau.id" />
				<PDes :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'des'" :key="'des_' + panneau.id" />
				<PClassement :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'classement'" :key="'classement_' + panneau.id" />
				<PFeu :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'feu'" :key="'feu_' + panneau.id" />
				<PModalites :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'modalites'" :key="'modalites_' + panneau.id" />
				<PGroupes :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'groupes'" :key="'groupes_' + panneau.id" />
				<PHumeur :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'humeur'" :key="'humeur_' + panneau.id" />
				<PChrono :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'chrono'" :key="'chrono_' + panneau.id" />
				<PRebours :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'rebours'" :key="'rebours_' + panneau.id" />
				<PSablier :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'sablier'" :key="'sablier_' + panneau.id" />
				<PHorlogeModulable :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'horloge-modulable'" :key="'horloge-modulable_' + panneau.id" />
				<PHorloge :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" :langue="langue" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'horloge'" :key="'horloge_' + panneau.id" />
				<PCalendrier :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'calendrier'" :key="'calendrier_' + panneau.id" />
				<PRetroaction :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'retroaction'" :key="'retroaction_' + panneau.id" />
				<PSonometre :panneau="panneau" :pages="pages" :nav="nav" :export="exportDonnees" :evenementClavier="evenementClavier" @afficher="afficherPanneau" @fermer="fermerPanneau" @export="modifierPanneau" v-else-if="panneau.type === 'sonometre'" :key="'sonometre_' + panneau.id" />
			</template>
		</div>

		<nav v-if="!alerte" :class="{'masque': !nav}" :data-html2canvas-ignore="true" :inert="!nav || null">
			<button type="button" :disabled="disabledNav" :title="$t('codeqr')" :aria-label="$t('codeqr')" @click="creerPanneau('codeqr')" v-if="modules.includes('codeqr')">
				<span class="icone"><i class="material-icons" aria-hidden="true">qr_code</i></span>
				<span class="titre">{{ $t('codeqr') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('texte')" :aria-label="$t('texte')" @click="creerPanneau('texte')" v-if="modules.includes('texte')">
				<span class="icone"><i class="material-icons" aria-hidden="true">title</i></span>
				<span class="titre">{{ $t('texte') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" title="Seyes" aria-label="Seyes" @click="creerPanneau('seyes')" v-if="modules.includes('seyes')">
				<span class="icone"><i class="material-icons" aria-hidden="true">grid_on</i></span>
				<span class="titre">Seyes</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('tableau')" :aria-label="$t('tableau')" @click="creerPanneau('tableau')" v-if="modules.includes('tableau')">
				<span class="icone"><i class="material-icons" aria-hidden="true">table_chart</i></span>
				<span class="titre">{{ $t('tableau') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('image')" :aria-label="$t('image')" @click="creerPanneau('image')" v-if="modules.includes('image')">
				<span class="icone"><i class="material-icons" aria-hidden="true">insert_photo</i></span>
				<span class="titre">{{ $t('image') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('galerieImages')" :aria-label="definirLibelleModule($t('galerie'), $t('galerieImages'))" @click="creerPanneau('galerie')" v-if="modules.includes('galerie')">
				<span class="icone"><i class="material-icons" aria-hidden="true">view_carousel</i></span>
				<span class="titre">{{ $t('galerie') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('dessin')" :aria-label="$t('dessin')" @click="creerPanneau('dessin')" v-if="modules.includes('dessin')">
				<span class="icone"><i class="material-icons" aria-hidden="true">gesture</i></span>
				<span class="titre">{{ $t('dessin') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('document')" :aria-label="$t('document')" @click="creerPanneau('document')" v-if="modules.includes('document')">
				<span class="icone"><i class="material-icons" aria-hidden="true">description</i></span>
				<span class="titre">{{ $t('document') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('audio')" :aria-label="$t('audio')" @click="creerPanneau('audio')" v-if="modules.includes('audio')">
				<span class="icone"><i class="material-icons" aria-hidden="true">volume_up</i></span>
				<span class="titre">{{ $t('audio') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('enregistrementAudio')" :aria-label="definirLibelleModule($t('enregistrement'), $t('enregistrementAudio'))" @click="creerPanneau('enregistrement')" v-if="modules.includes('enregistrement')">
				<span class="icone"><i class="material-icons" aria-hidden="true">fiber_manual_record</i></span>
				<span class="titre">{{ $t('enregistrement') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('syntheseVocale')" :aria-label="definirLibelleModule($t('synthese'), $t('syntheseVocale'))" @click="creerPanneau('synthese')" v-if="modules.includes('synthese')">
				<span class="icone"><i class="material-icons" aria-hidden="true">record_voice_over</i></span>
				<span class="titre">{{ $t('synthese') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('video')" :aria-label="$t('video')" @click="creerPanneau('video')" v-if="modules.includes('video')">
				<span class="icone"><i class="material-icons" aria-hidden="true">movie_creation</i></span>
				<span class="titre">{{ $t('video') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('webcam')" :aria-label="$t('webcam')" @click="creerPanneau('webcam')" v-if="modules.includes('webcam')">
				<span class="icone"><i class="material-icons" aria-hidden="true">photo_camera</i></span>
				<span class="titre">{{ $t('webcam') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('partageEcran')" :aria-label="definirLibelleModule($t('partage'), $t('partageEcran'))" @click="creerPanneau('partage-ecran')" v-if="modules.includes('partage-ecran')">
				<span class="icone"><i class="material-icons" aria-hidden="true">screen_share</i></span>
				<span class="titre">{{ $t('partage') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('lien')" :aria-label="$t('lien')" @click="creerPanneau('lien')" v-if="modules.includes('lien')">
				<span class="icone"><i class="material-icons" aria-hidden="true">link</i></span>
				<span class="titre">{{ $t('lien') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('contenuIntegre')" :aria-label="definirLibelleModule($t('iframe'), $t('contenuIntegre'))" @click="creerPanneau('iframe')" v-if="modules.includes('iframe')">
				<span class="icone"><i class="material-icons" aria-hidden="true">code</i></span>
				<span class="titre">{{ $t('iframe') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('html')" :aria-label="$t('html')" @click="creerPanneau('html')" v-if="modules.includes('html')">
				<span class="icone"><i class="material-icons" aria-hidden="true">html</i></span>
				<span class="titre">{{ $t('html') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('liste')" :aria-label="$t('liste')" @click="creerPanneau('liste')" v-if="modules.includes('liste')">
				<span class="icone"><i class="material-icons" aria-hidden="true">checklist</i></span>
				<span class="titre">{{ $t('liste') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('nuageMots')" :aria-label="definirLibelleModule($t('nuage'), $t('nuageMots'))" @click="creerPanneau('nuage')" v-if="modules.includes('nuage')">
				<span class="icone"><i class="material-icons" aria-hidden="true">cloud</i></span>
				<span class="titre">{{ $t('nuage') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('remiseOrdre')" :aria-label="definirLibelleModule($t('ordre'), $t('remiseOrdre'))" @click="creerPanneau('ordre')" v-if="modules.includes('ordre')">
				<span class="icone"><i class="material-icons" aria-hidden="true">sort_by_alpha</i></span>
				<span class="titre">{{ $t('ordre') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('imagesSequentielles')" :aria-label="definirLibelleModule($t('ordreImage'), $t('imagesSequentielles'))" @click="creerPanneau('images-sequentielles')" v-if="modules.includes('images-sequentielles')">
				<span class="icone"><i class="material-icons" aria-hidden="true">category</i></span>
				<span class="titre">{{ $t('ordreImage') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('texteATrous')" :aria-label="definirLibelleModule($t('trous'), $t('texteATrous'))" @click="creerPanneau('trous')" v-if="modules.includes('trous')">
				<span class="icone"><i class="material-icons" aria-hidden="true">wysiwyg</i></span>
				<span class="titre">{{ $t('trous') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('surlignage')" :aria-label="$t('surlignage')" @click="creerPanneau('surlignage')" v-if="modules.includes('surlignage')">
				<span class="icone"><i class="material-icons" aria-hidden="true">hdr_strong</i></span>
				<span class="titre">{{ $t('surlignage') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('motMystere')" :aria-label="$t('motMystere')" @click="creerPanneau('mot-mystere')" v-if="modules.includes('mot-mystere')">
				<span class="icone"><i class="material-icons" aria-hidden="true">spellcheck</i></span>
				<span class="titre">{{ $t('motMystere') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('cartes')" :aria-label="$t('cartes')" @click="creerPanneau('cartes')" v-if="modules.includes('cartes')">
				<span class="icone"><i class="material-icons" aria-hidden="true">style</i></span>
				<span class="titre">{{ $t('cartes') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('appariement')" :aria-label="$t('appariement')" @click="creerPanneau('appariement')" v-if="modules.includes('appariement')">
				<span class="icone"><i class="material-icons" aria-hidden="true">compare_arrows</i></span>
				<span class="titre">{{ $t('appariement') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('categories')" :aria-label="$t('categories')" @click="creerPanneau('categories')" v-if="modules.includes('categories')">
				<span class="icone"><i class="material-icons" aria-hidden="true">view_week</i></span>
				<span class="titre">{{ $t('categories') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('tirageSortTexte')" :aria-label="definirLibelleModule($t('tirageTexte'), $t('tirageSortTexte'))" @click="creerPanneau('tirage-texte')" v-if="modules.includes('tirage-texte')">
				<span class="icone"><i class="material-icons" aria-hidden="true">shuffle</i></span>
				<span class="titre">{{ $t('tirageTexte') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('tirageSortNombre')" :aria-label="definirLibelleModule($t('tirageNombre'), $t('tirageSortNombre'))" @click="creerPanneau('tirage-nombre')" v-if="modules.includes('tirage-nombre')">
				<span class="icone"><i class="material-icons" aria-hidden="true">123</i></span>
				<span class="titre">{{ $t('tirageNombre') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('tirageSortImage')" :aria-label="definirLibelleModule($t('tirageImage'), $t('tirageSortImage'))" @click="creerPanneau('tirage-image')" v-if="modules.includes('tirage-image')">
				<span class="icone"><i class="material-icons" aria-hidden="true">collections</i></span>
				<span class="titre">{{ $t('tirageImage') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('tirageSortAudio')" :aria-label="definirLibelleModule($t('tirageAudio'), $t('tirageSortAudio'))" @click="creerPanneau('tirage-audio')" v-if="modules.includes('tirage-audio')">
				<span class="icone"><i class="material-icons" aria-hidden="true">subscriptions</i></span>
				<span class="titre">{{ $t('tirageAudio') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('roue')" :aria-label="$t('roue')" @click="creerPanneau('roue')" v-if="modules.includes('roue')">
				<span class="icone"><i class="material-icons" aria-hidden="true">pending</i></span>
				<span class="titre">{{ $t('roue') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('histoire')" :aria-label="$t('histoire')" @click="creerPanneau('histoire')" v-if="modules.includes('histoire')">
				<span class="icone"><i class="material-icons" aria-hidden="true">history_edu</i></span>
				<span class="titre">{{ $t('histoire') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('plateau')" :aria-label="$t('plateau')" @click="creerPanneau('plateau')" v-if="modules.includes('plateau')">
				<span class="icone" style="font-size: 0"><svg xmlns="http://www.w3.org/2000/svg" width="2.4rem"  height="2.4rem" viewBox="0 -960 960 960" fill="#000" aria-hidden="true"><path d="M160-80v-200q88-60 129-125t56-115H240v-80h90q-14-22-22-47t-8-53q0-75 52.5-127.5T480-880q75 0 127.5 52.5T660-700q0 28-8 53t-22 47h90v80H615q15 50 56 115t129 125v200H160Zm80-80h480v-80q-92-72-133-148.5T532-520H428q-14 55-55 131.5T240-240v80Zm240-440q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm0 440Zm0-540Z"/></svg></span>
				<span class="titre">{{ $t('plateau') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('des')" :aria-label="$t('des')" @click="creerPanneau('des')" v-if="modules.includes('des')">
				<span class="icone"><i class="material-icons" aria-hidden="true">casino</i></span>
				<span class="titre">{{ $t('des') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('classement')" :aria-label="$t('classement')" @click="creerPanneau('classement')" v-if="modules.includes('classement')">
				<span class="icone"><i class="material-icons" aria-hidden="true">emoji_events</i></span>
				<span class="titre">{{ $t('classement') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('feuQuadricolore')" :aria-label="definirLibelleModule($t('feu'), $t('feuQuadricolore'))" @click="creerPanneau('feu')" v-if="modules.includes('feu')">
				<span class="icone"><i class="material-icons" aria-hidden="true">traffic</i></span>
				<span class="titre">{{ $t('feu') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('modalitesTravail')" :aria-label="definirLibelleModule($t('modalites'), $t('modalitesTravail'))" @click="creerPanneau('modalites')" v-if="modules.includes('modalites')" :class="{'actif': modalites}">
				<span class="icone"><i class="material-icons" aria-hidden="true">group_work</i></span>
				<span class="titre">{{ $t('modalites') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('groupes')" :aria-label="$t('groupes')" @click="creerPanneau('groupes')" v-if="modules.includes('groupes')">
				<span class="icone"><i class="material-icons" aria-hidden="true">group</i></span>
				<span class="titre">{{ $t('groupes') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('meteoHumeur')" :aria-label="definirLibelleModule($t('humeur'), $t('meteoHumeur'))" @click="creerPanneau('humeur')" v-if="modules.includes('humeur')">
				<span class="icone"><i class="material-icons" aria-hidden="true">mood</i></span>
				<span class="titre">{{ $t('humeur') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('chronometre')" :aria-label="definirLibelleModule($t('chrono'), $t('chronometre'))" @click="creerPanneau('chrono')" v-if="modules.includes('chrono')">
				<span class="icone"><i class="material-icons" aria-hidden="true">timer</i></span>
				<span class="titre">{{ $t('chrono') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('compteRebours')" :aria-label="definirLibelleModule($t('rebours'), $t('compteRebours'))" @click="creerPanneau('rebours')" v-if="modules.includes('rebours')">
				<span class="icone"><i class="material-icons" aria-hidden="true">timelapse</i></span>
				<span class="titre">{{ $t('rebours') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('sablier')" :aria-label="$t('sablier')" @click="creerPanneau('sablier')" v-if="modules.includes('sablier')">
				<span class="icone"><i class="material-icons" aria-hidden="true">hourglass_empty</i></span>
				<span class="titre">{{ $t('sablier') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('horlogeModulable')" :aria-label="definirLibelleModule($t('horlogeM'), $t('horlogeModulable'))" @click="creerPanneau('horloge-modulable')" v-if="modules.includes('horloge-modulable')">
				<span class="icone"><i class="material-icons" aria-hidden="true">update</i></span>
				<span class="titre">{{ $t('horlogeM') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('horloge')" :aria-label="$t('horloge')" @click="creerPanneau('horloge')" v-if="modules.includes('horloge')">
				<span class="icone"><i class="material-icons" aria-hidden="true">query_builder</i></span>
				<span class="titre">{{ $t('horloge') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('calendrier')" :aria-label="$t('calendrier')" @click="creerPanneau('calendrier')" v-if="modules.includes('calendrier')">
				<span class="icone"><i class="material-icons" aria-hidden="true">today</i></span>
				<span class="titre">{{ $t('calendrier') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('sonometre')" :aria-label="$t('sonometre')" @click="creerPanneau('sonometre')" v-if="modules.includes('sonometre')">
				<span class="icone"><i class="material-icons" aria-hidden="true">hearing</i></span>
				<span class="titre">{{ $t('sonometre') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('retroaction')" :aria-label="$t('retroaction')" @click="creerPanneau('retroaction')" v-if="modules.includes('retroaction')" :class="{'actif': retroaction}">
				<span class="icone"><i class="material-icons" aria-hidden="true">thumb_up</i></span>
				<span class="titre">{{ $t('retroaction') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('grille')" :aria-label="$t('grille')" @click="ouvrirModale('grille')" v-if="modules.includes('grille') && Object.keys(grille).length === 0">
				<span class="icone"><i class="material-icons" aria-hidden="true">view_module</i></span>
				<span class="titre">{{ $t('grille') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('grille')" :aria-label="$t('grille')" @click="reinitialiserGrille" class="actif" v-else-if="modules.includes('grille') && Object.keys(grille).length > 0">
				<span class="icone"><i class="material-icons" aria-hidden="true">view_module</i></span>
				<span class="titre">{{ $t('grille') }}</span>
			</button>
			<div class="separateur">
				<span>·</span>
			</div>
			<button type="button" id="bouton-fonds" :disabled="disabledNav" :title="$t('hintergruende')" :aria-label="$t('hintergruende')" @click="ouvrirMenuFonds">
				<span class="icone"><i class="material-icons" aria-hidden="true">wallpaper</i></span>
				<span class="titre">{{ $t('hintergruende') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('capturer')" :aria-label="definirLibelleModule($t('capture'), $t('capturer'))" @click="capturer">
				<span class="icone"><i class="material-icons" aria-hidden="true">camera</i></span>
				<span class="titre">{{ $t('capture') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('annoter')" :aria-label="$t('annoter')" @click="annoter" v-if="!annotation">
				<span class="icone"><i class="material-icons" aria-hidden="true">rate_review</i></span>
				<span class="titre">{{ $t('annoter') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('annoter')" :aria-label="$t('annoter')" @click="arreterAnnoter" class="actif" v-else>
				<span class="icone"><i class="material-icons" aria-hidden="true">rate_review</i></span>
				<span class="titre">{{ $t('annoter') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('mettrePleinEcran')" :aria-label="definirLibelleModule($t('ecran'), $t('mettrePleinEcran'))" @click="entrerPleinEcran" v-if="!pleinEcran">
				<span class="icone"><i class="material-icons" aria-hidden="true">open_in_full</i></span>
				<span class="titre">{{ $t('ecran') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('sortirPleinEcran')" :aria-label="definirLibelleModule($t('ecran'), $t('sortirPleinEcran'))" @click="sortirPleinEcran" v-else>
				<span class="icone"><i class="material-icons" aria-hidden="true">close_fullscreen</i></span>
				<span class="titre">{{ $t('ecran') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('corbeille')" :aria-label="$t('corbeille')" @click="ouvrirModale('corbeille')">
				<span class="icone"><i class="material-icons" aria-hidden="true">delete</i></span>
				<span class="titre">{{ $t('corbeille') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('options')" :aria-label="$t('options')" @click="ouvrirMenu">
				<span class="icone"><i class="material-icons" aria-hidden="true">settings</i></span>
				<span class="titre">{{ $t('options') }}</span>
			</button>
			<button type="button" :disabled="disabledNav" :title="$t('aPropos')" :aria-label="$t('aPropos')" @click="ouvrirModale('info')">
				<span class="icone"><i class="material-icons" aria-hidden="true">info</i></span>
				<span class="titre">{{ $t('aPropos') }}</span>
			</button>
		</nav>

		<button type="button" class="bouton-capture" :disabled="disabled" :title="$t('capturer')" :aria-label="$t('capturer')" v-if="lectureSeule" @click="capturer" :data-html2canvas-ignore="true"><i class="material-icons" aria-hidden="true">camera</i></button>

		<button type="button" class="bouton-annotation" :disabled="disabled" :title="$t('annoter')" :aria-label="$t('annoter')" v-if="!annotation && lectureSeule" @click="annoter" :data-html2canvas-ignore="true"><i class="material-icons" aria-hidden="true">rate_review</i></button>
		<button type="button" class="bouton-annotation vert" :disabled="disabled" :title="$t('annoter')" :aria-label="$t('annoter')" v-else-if="annotation && lectureSeule" @click="arreterAnnoter" :data-html2canvas-ignore="true"><i class="material-icons" aria-hidden="true">rate_review</i></button>

		<button type="button" class="bouton-plein-ecran" :disabled="disabled" :title="$t('mettrePleinEcran')" :aria-label="$t('mettrePleinEcran')" v-if="!pleinEcran && lectureSeule" @click="entrerPleinEcran" :data-html2canvas-ignore="true"><i class="material-icons" aria-hidden="true">open_in_full</i></button>
		<button type="button" class="bouton-plein-ecran" :disabled="disabled" :title="$t('sortirPleinEcran')" :aria-label="$t('sortirPleinEcran')" v-else-if="pleinEcran && lectureSeule" @click="sortirPleinEcran" :data-html2canvas-ignore="true"><i class="material-icons" aria-hidden="true">close_fullscreen</i></button>

		<button type="button" class="bouton-export" :disabled="disabled" :title="$t('exporterEcran')" :aria-label="$t('exporterEcran')" v-if="lectureSeule" @click="exporter('pages')" :data-html2canvas-ignore="true"><i class="material-icons" aria-hidden="true">save</i></button>

		<button type="button" class="nav" :disabled="disabled" :title="$t('masquerOutils')" :aria-label="$t('masquerOutils')" v-if="nav && !lectureSeule" @click="masquerOutils" :data-html2canvas-ignore="true"><i class="material-icons" aria-hidden="true">expand_more</i></button>
		<button type="button" class="nav" :disabled="disabled" :title="$t('afficherOutils')" :aria-label="$t('afficherOutils')" v-else-if="!nav && !lectureSeule" @click="afficherOutils" :data-html2canvas-ignore="true"><i class="material-icons" aria-hidden="true">expand_less</i></button>

		<button type="button" class="bouton-cadenas orange" :disabled="disabled" :title="$t('deverrouiller')" :aria-label="$t('deverrouiller')" v-if="lectureSeule" @click="deverrouillerOutils" :data-html2canvas-ignore="true"><i class="material-icons" aria-hidden="true">lock</i></button>
		<button type="button" class="bouton-cadenas" :disabled="disabled" :title="$t('verrouiller')" :aria-label="$t('verrouiller')" v-else @click="verrouillerOutils" :data-html2canvas-ignore="true"><i class="material-icons" aria-hidden="true">lock_open</i></button>

		<MGrille v-if="modale === 'grille'" />
		<MInfo v-else-if="modale === 'info'" />
		<MCorbeille :corbeille="corbeille" @retirer="retirerPanneauCorbeille" v-else-if="modale === 'corbeille'" />
		<MParametres :admin="admin" v-if="menu" />

		<div id="echelle-fond-direct" role="group" :aria-label="$t('echelleFond')" v-if="fondEcriture && !lectureSeule" :data-html2canvas-ignore="true">
			<button type="button" :title="$t('echelleFondMoins')" :aria-label="$t('echelleFondMoins')" :disabled="echelleFond <= etapesEchelleFond[0]" @click="modifierEchelleFond(-1)"><i class="material-icons" aria-hidden="true">remove</i></button>
			<button type="button" class="valeur" :title="$t('echelleFondReinitialiser')" :aria-label="$t('echelleFond') + ': ' + Math.round(echelleFond * 100) + ' %. ' + $t('echelleFondReinitialiser')" @click="modifierEchelleFond(0)">{{ Math.round(echelleFond * 100) }} %</button>
			<button type="button" :title="$t('echelleFondPlus')" :aria-label="$t('echelleFondPlus')" :disabled="echelleFond >= etapesEchelleFond[etapesEchelleFond.length - 1]" @click="modifierEchelleFond(1)"><i class="material-icons" aria-hidden="true">add</i></button>
			<span class="separateur" />
			<button type="button" id="bouton-main-fond" :class="{'actif': deplacementFond}" :title="$t('fondVerschieben')" :aria-label="$t('fondVerschieben')" :aria-pressed="deplacementFond ? 'true' : 'false'" @click="basculerDeplacementFond"><i class="material-icons" aria-hidden="true">pan_tool</i></button>
			<button type="button" id="bouton-centre-fond" :title="$t('fondZentrieren')" :aria-label="$t('fondZentrieren')" :disabled="decalageFond.x === 0 && decalageFond.y === 0" @click="recentrerFond"><i class="material-icons" aria-hidden="true">filter_center_focus</i></button>
		</div>

		<div id="surface-deplacement-fond" v-if="deplacementFond && fondEcriture && !lectureSeule" :data-html2canvas-ignore="true" @pointerdown="debutDeplacementFond" />

		<div id="statut" aria-live="polite" />
		<div id="notification" aria-live="polite" />

		<audio id="audio-bip" :src="$recupererRessource('./static/audio/bip.mp3')" tabindex="-1" preload style="display: none;" v-if="modules.includes('rebours')" />
		<audio id="audio-cartoon" :src="$recupererRessource('./static/audio/cartoon.mp3')" tabindex="-1" preload style="display: none;" v-if="modules.includes('rebours')" />
		<audio id="audio-clave" :src="$recupererRessource('./static/audio/clave.mp3')" tabindex="-1" preload style="display: none;" v-if="modules.includes('rebours')" />
		<audio id="audio-djembe" :src="$recupererRessource('./static/audio/djembe.mp3')" tabindex="-1" preload style="display: none;" v-if="modules.includes('rebours')" />
		<audio id="audio-goutte" :src="$recupererRessource('./static/audio/goutte.mp3')" tabindex="-1" preload style="display: none;" v-if="modules.includes('rebours')" />
		<audio id="audio-maraca" :src="$recupererRessource('./static/audio/maraca.mp3')" tabindex="-1" preload style="display: none;" v-if="modules.includes('rebours')" />
		<audio id="audio-mbira" :src="$recupererRessource('./static/audio/mbira.mp3')" tabindex="-1" preload style="display: none;" v-if="modules.includes('rebours')" />
		<audio id="audio-metronome" :src="$recupererRessource('./static/audio/metronome.mp3')" tabindex="-1" preload style="display: none;" v-if="modules.includes('rebours')" />
		<audio id="audio-triangle" :src="$recupererRessource('./static/audio/triangle.mp3')" tabindex="-1" preload style="display: none;" v-if="modules.includes('rebours')" />
	</main>
</template>

<script>
import echelonnerAnnotations, { deplacerAnnotations } from './echelleAnnotations.js'
import PCodeqr from '@/components/codeqr.vue'
import PTexte from '@/components/texte.vue'
import PSeyes from '@/components/seyes.vue'
import PTableau from '@/components/tableau.vue'
import PImage from '@/components/image.vue'
import PGalerie from '@/components/galerie.vue'
import PDessin from '@/components/dessin.vue'
import PDocument from '@/components/document.vue'
import PAudio from '@/components/audio.vue'
import PEnregistrement from '@/components/enregistrement.vue'
import PSynthese from '@/components/synthese.vue'
import PVideo from '@/components/video.vue'
import PWebcam from '@/components/webcam.vue'
import PPartage from '@/components/partage-ecran.vue'
import PLien from '@/components/lien.vue'
import PIframe from '@/components/iframe.vue'
import PHtml from '@/components/html.vue'
import PListe from '@/components/liste.vue'
import PNuage from '@/components/nuage.vue'
import POrdre from '@/components/ordre.vue'
import PImagesSequentielles from '@/components/images-sequentielles.vue'
import PTrous from '@/components/trous.vue'
import PSurlignage from '@/components/surlignage.vue'
import PMotMystere from '@/components/mot-mystere.vue'
import PCartes from '@/components/cartes.vue'
import PAppariement from '@/components/appariement.vue'
import PCategories from '@/components/categories.vue'
import PTirageTexte from '@/components/tirage-texte.vue'
import PTirageNombre from '@/components/tirage-nombre.vue'
import PTirageImage from '@/components/tirage-image.vue'
import PTirageAudio from '@/components/tirage-audio.vue'
import PRoue from '@/components/roue.vue'
import PHistoire from '@/components/histoire.vue'
import PPlateau from '@/components/plateau.vue'
import PDes from '@/components/des.vue'
import PClassement from '@/components/classement.vue'
import PFeu from '@/components/feu.vue'
import PModalites from '@/components/modalites.vue'
import PGroupes from '@/components/groupes.vue'
import PHumeur from '@/components/humeur.vue'
import PChrono from '@/components/chrono.vue'
import PRebours from '@/components/rebours.vue'
import PSablier from '@/components/sablier.vue'
import PHorlogeModulable from '@/components/horloge-modulable.vue'
import PHorloge from '@/components/horloge.vue'
import PCalendrier from '@/components/calendrier.vue'
import PRetroaction from '@/components/retroaction.vue'
import PSonometre from '@/components/sonometre.vue'
import MGrille from '@/components/grille.vue'
import MInfo from '@/components/info.vue'
import MCorbeille from '@/components/corbeille.vue'
import MParametres from '@/components/parametres.vue'
import Annotation from '@/components/annotation.vue'
import Chargement from '@/components/chargement.vue'
import html2canvas from 'html2canvas'
import fscreen from 'fscreen'
import { saveAs } from 'file-saver'
import imagesLoaded from 'imagesloaded'
import { lecteur, recupererDonneesLecteur, genererHtml, recupererRessource } from '@/lecteur'

export default {
	name: 'App',
	provide () {
		return {
			app: this
		}
	},
	components: {
		PCodeqr,
		PTexte,
		PSeyes,
		PTableau,
		PImage,
		PGalerie,
		PDessin,
		PDocument,
		PAudio,
		PEnregistrement,
		PSynthese,
		PVideo,
		PWebcam,
		PPartage,
		PLien,
		PIframe,
		PHtml,
		PListe,
		PNuage,
		POrdre,
		PImagesSequentielles,
		PTrous,
		PSurlignage,
		PMotMystere,
		PCartes,
		PAppariement,
		PCategories,
		PTirageTexte,
		PTirageImage,
		PTirageAudio,
		PTirageNombre,
		PRoue,
		PHistoire,
		PPlateau,
		PDes,
		PClassement,
		PFeu,
		PModalites,
		PGroupes,
		PHumeur,
		PChrono,
		PRebours,
		PSablier,
		PHorlogeModulable,
		PHorloge,
		PCalendrier,
		PRetroaction,
		PSonometre,
		MGrille,
		MInfo,
		MCorbeille,
		MParametres,
		Annotation,
		Chargement
	},
	data () {
		return {
			chargement: true,
			alerte: false,
			largeur: 0,
			hauteur: 0,
			pages: [{ fond: './static/img/quadrillage.png', grille: {}, annotations: {}, annotation: false }],
			page: 1,
			chargementPage: false,
			modules: ['codeqr', 'texte', 'image', 'galerie', 'document', 'audio', 'video', 'lien', 'iframe', 'nuage', 'tirage-texte', 'tirage-image', 'histoire', 'plateau', 'des', 'feu', 'modalites', 'groupes', 'chrono', 'rebours', 'horloge', 'calendrier', 'retroaction', 'grille'],
			panneaux: [],
			panneauxPage: [],
			langue: 'fr',
			fonte: 'Andika',
			pleinEcran: false,
			listeVoix: [],
			modale: '',
			menu: false,
			menuFonds: false,
			nav: true,
			export: {},
			panneauxExportes: 0,
			exportDonnees: false,
			exportTermine: false,
			importDonnees: false,
			importTermine: false,
			retroaction: false,
			modalites: false,
			annotation: false,
			defilement: false,
			depart: 0,
			distance: 0,
			audio: '',
			audioInitialise: false,
			evenementClavier: { touche: '', id: '' },
			outilDeplacer: false,
			panneauAffiche: '',
			lectureSeule: false,
			corbeille: [],
			admin: false,
			motdepasse: '',
			dgsId: '',
			notification: {},
			etapesEchelleFond: [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3],
			deplacementFond: false,
			gesteFond: null,
			encodeurCharge: false,
			suppressionComplete: false,
			elementPrecedent: null,
			elementPrecedentModalePanneau: null,
			fermetureModalePanneau: null,
			lecteur: lecteur
		}
	},
	computed: {
		disabled () {
			return this.modale === '' && !this.menu ? false : true
		},
		disabledNav () {
			return this.nav && !this.lectureSeule && this.modale === '' && !this.menu ? false : true
		},
		fond () {
			return this.pages[this.page - 1].fond
		},
		fondBeschreibbar () {
			const fond = this.fond || ''
			return fond.substring(0, 1) === '#' || (fond.includes('/static/img/') && /\.(png|svg)$/.test(fond))
		},
		fondEcriture () {
			// Beschreibbare Hintergründe (Linien, Karo, Punkte …) – diese lassen sich skalieren
			return this.fond.includes('/static/img/') && /\.(png|svg)$/.test(this.fond)
		},
		decalageFond () {
			// Verschiebung des beschreibbaren Hintergrunds in px
			const page = this.pages[this.page - 1]
			return this.fondEcriture && page && page.decalageFond ? page.decalageFond : { x: 0, y: 0 }
		},
		echelleFond () {
			// Skalierung des beschreibbaren Hintergrunds, 1 = Originalgröße
			const page = this.pages[this.page - 1]
			return this.fondEcriture && page && page.echelleFond > 0 ? page.echelleFond : 1
		},
		styleFond () {
			const image = 'url(' + recupererRessource(this.fond) + ')'
			const e = this.echelleFond
			// Höhe der Musterkachel in px (Originalgröße)
			const hauteurs = { 'lineatur-haeuschen.svg': 140, 'lineatur-haeuschen-gross.svg': 224, 'seyes.png': 80, 'quadrillage-grand.png': 60, 'quadrillage-gris-grand.png': 60 }
			const nom = this.fond.split('/').pop()
			const taille = e === 1 ? 'auto' : 'auto ' + ((hauteurs[nom] || 30) * e) + 'px'
			const d = this.decalageFond
			const centre = 'calc(50% + ' + d.x + 'px) calc(50% + ' + d.y + 'px)'
			if (this.fond.substring(0, 1) === '#') {
				return { 'background-color': this.fond }
			} else if (this.fond.includes('/img/partition.png')) {
				return { 'background-image': image, 'background-size': e === 1 ? 'contain' : 'auto ' + (100 * e) + '%', 'background-repeat': 'repeat', 'background-position': centre }
			} else if (this.fond.includes('/img/lineatur-haeuschen')) {
				return { 'background-color': '#ffffff', 'background-image': image, 'background-size': taille, 'background-repeat': 'repeat', 'background-position': d.x + 'px ' + d.y + 'px' }
			} else if (this.fond.includes('/img/seyes.png')) {
				return { 'background-color': '#ffffff', 'background-image': image, 'background-size': taille, 'background-repeat': 'repeat', 'background-position': centre }
			} else if (this.fond.split('.').pop() === 'png') {
				return { 'background-image': image, 'background-size': taille, 'background-repeat': 'repeat', 'background-position': centre }
			} else {
				return { 'background-image': image }
			}
		},
		grille () {
			return this.pages[this.page - 1].grille
		},
		annotations () {
			return this.pages[this.page - 1].annotations
		}
	},
	watch: {
		modules: {
			handler () {
				this.$nextTick(this.ajusterNav)
			},
			deep: true
		},
		chargement (valeur) {
			if (valeur) this.annoncer(this.$t('chargementEnCours'))
		},
		importDonnees (valeur) {
			if (valeur) this.annoncer(this.$t('chargementEnCours'))
		},
		fondEcriture (valeur) {
			if (!valeur) {
				this.deplacementFond = false
			}
		},
		page (page) {
			this.chargementPage = true
			this.annotation = false
			this.export = { type: 'page', page: page }
			this.exportDonnees = true
			if (this.panneauxPage.length === 0) {
				this.exportTermine = true
			}
		},
		nav (nav) {
			if (nav) {
				this.hauteur = document.body.clientHeight - this.convertirRem(7.5)
			} else {
				this.hauteur = document.body.clientHeight
			}
		},
		alerte (valeur) {
			if (!valeur) {
				this.$nextTick(() => {
					this.activerDefilementHorizontal()
					this.ajusterNav()
				})
			}
		},
		lectureSeule (lectureSeule) {
			const panneaux = document.querySelectorAll('.jsPanel')
			if (lectureSeule === true) {
				panneaux.forEach((panneau) => {
					if (panneau.querySelector('.jsPanel-btn-close')) {
						panneau.setControlStatus('close', 'hide')
					}
					if (panneau.querySelector('.jsPanel-btn-send')) {
						panneau.setControlStatus('send', 'hide')
					}
				})
				this.nav = false
			} else {
				panneaux.forEach((panneau) => {
					if (panneau.querySelector('.jsPanel-btn-close')) {
						panneau.setControlStatus('close', 'show')
					}
					if (panneau.querySelector('.jsPanel-btn-send')) {
						panneau.setControlStatus('send', 'show')
					}
				})
				this.nav = true
			}
		},
		panneauAffiche (id) {
			const panneaux = document.querySelectorAll('.jsPanel')
			panneaux.forEach((panneau) => {
				panneau.classList.remove('actif')
			})
			if (id !== '') {
				document.querySelector('#' + id)?.classList.add('actif')
			}
		},
		exportTermine (valeur) {
			if (valeur === false) return
			if (valeur === true && this.export.type === 'page') {
				const page = this.export.page
				this.panneauxPage.forEach((panneau) => {
					document.querySelector('#' + panneau.id)?.close()
				})
				const panneaux = this.panneaux.filter((element) => {
					return element.page === page
				})
				this.panneauxPage = []
				this.$nextTick(() => {
					if (this.pages[page - 1].hasOwnProperty('annotation')) {
						this.annotation = this.pages[page - 1].annotation
					} else {
						this.annotation = false
					}
					this.retroaction = false
					this.modalites = false
					setTimeout(() => {
						this.panneauxPage.push(...panneaux)
						for (let i = 0; i < this.panneauxPage.length; i++) {
							if (this.panneauxPage[i].type === 'retroaction') {
								this.retroaction = true
							}
							if (this.panneauxPage[i].type === 'modalites') {
								this.modalites = true
							}
						}
						this.$nextTick(() => {
							if (this.lectureSeule === true) {
								const panneaux = document.querySelectorAll('.jsPanel')
								panneaux.forEach((panneau) => {
									if (panneau.querySelector('.jsPanel-btn-close')) {
										panneau.setControlStatus('close', 'hide')
									}
									if (panneau.querySelector('.jsPanel-btn-send')) {
										panneau.setControlStatus('send', 'hide')
									}
								})
							}
						})
						imagesLoaded('main', { background: true }, () => {
							this.chargementPage = false
							this.exportDonnees = false
							this.export = {}
							this.exportTermine = false
							this.panneauxExportes = 0
							if (this.panneauxPage.length > 0) {
								document.querySelector('#' + this.panneauxPage[0].id)?.front()
								this.$nextTick(() => {
									document.querySelector('#' + this.panneauxPage[0].id)?.focus()
								})
							} else if (this.nav) {
								document.querySelector('nav button')?.focus()
							} else if (!this.nav && !this.lectureSeule) {
								document.querySelector('button.nav')?.focus()
							}
						})
					}, 150)
				})
			} else if (valeur === true && this.export.type === 'fichier') {
				const fichier = this.export.fichier
				let donnees = {}
				if (this.export.nombre === 'pages') {
					donnees.pages = this.pages
					donnees.page = this.page
					donnees.panneaux = this.panneaux
				} else {
					const panneaux = []
					const panneauxPage = JSON.parse(JSON.stringify(this.panneauxPage))
					panneauxPage.forEach((panneau) => {
						if (!this.corbeille.map(p => p.id).includes(panneau.id)) {
							panneau.page = 1
							panneaux.push(panneau)
						}
					})
					donnees.pages = [this.pages[this.page - 1]]
					donnees.page = 1
					donnees.panneaux = panneaux
				}
				donnees.modules = this.modules
				donnees.langue = this.langue
				donnees.nav = this.nav
				donnees.lectureSeule = this.lectureSeule
				donnees.ecran = { largeur: this.largeur, hauteur: this.hauteur }
				donnees.fonte = this.fonte
				let message = this.export.nombre === 'pages' ? this.$t('pagesExportees') : this.$t('pageExportee')
				if (this.export.format === 'html') {
					message = this.$t('exportHtmlTermine')
				}
				const terminer = (notification) => {
					this.chargementPage = false
					this.notification = notification
					this.exportDonnees = false
					this.export = {}
					this.exportTermine = false
					this.panneauxExportes = 0
					this.fermerModale()
				}
				if (this.export.format === 'html') {
					genererHtml(donnees).then((html) => {
						saveAs(new Blob([html], { type: 'text/html;charset=utf-8' }), fichier + '.html')
						terminer({ type: 'succes', message: message })
					}).catch(() => {
						terminer({ type: 'erreur', message: this.$t('erreurExportHtml') })
					})
				} else {
					const blob = new Blob([JSON.stringify(donnees)], { type: 'text/json;charset=utf-8' })
					saveAs(blob, fichier + '.dgs')
					terminer({ type: 'succes', message: message })
				}
			} else if (valeur === true && this.export.type === 'enregistrement') {
				let donnees = {}
				donnees.pages = this.pages
				donnees.page = this.page
				donnees.modules = this.modules
				donnees.panneaux = this.panneaux
				donnees.langue = this.langue
				donnees.nav = this.nav
				donnees.lectureSeule = this.lectureSeule
				donnees.ecran = { largeur: this.largeur, hauteur: this.hauteur }
				donnees.fonte = this.fonte
				const blob = new Blob([JSON.stringify(donnees)], { type: 'text/json;charset=utf-8' })
				const formData = new FormData()
				formData.append('fichier', blob)
				formData.append('motdepasse', this.motdepasse)
				formData.append('id', this.dgsId)
				const xhr = new XMLHttpRequest()
				xhr.onload = () => {
					if (xhr.status === 200 && xhr.responseText === 'donnees_enregistrees') {
						this.notification = { type: 'succes', message: this.$t('donneesEnregistrees') }
					} else if (xhr.status === 429) {
						this.notification = { type: 'erreur', message: this.$t('erreurTentativesNombreuses') }
					} else {
						this.notification = { type: 'erreur', message: this.$t('erreurEnregistrement') }
					}
					this.chargementPage = false
					this.exportDonnees = false
					this.export = {}
					this.exportTermine = false
					this.panneauxExportes = 0
					this.fermerModale()
				}
				xhr.onerror = () => {
					this.notification = { type: 'erreur', message: this.$t('erreurEnregistrement') }
					this.chargementPage = false
					this.exportDonnees = false
					this.export = {}
					this.exportTermine = false
					this.panneauxExportes = 0
					this.fermerModale()
				}
				xhr.open('POST', window.location.href.split('?')[0] + 'inc/enregistrer_donnees_dgs.php', true)
				xhr.send(formData)
			} else if (valeur === true && this.export.type === 'panneau') {
				const id = this.export.id
				const page = this.export.page
				const deplacerEl = document.querySelector('#modale-panneau #deplacer')
				const deplacer = deplacerEl ? deplacerEl.checked : true
				this.$nextTick(() => {
					const panneaux = JSON.parse(JSON.stringify(this.panneaux))
					panneaux.forEach((panneau) => {
						if (panneau.id === id && deplacer === true) {
							panneau.page = parseInt(page)
						} else if (panneau.id === id && deplacer === false) {
							const copiePanneau = JSON.parse(JSON.stringify(panneau))
							copiePanneau.page = parseInt(page)
							copiePanneau.id = 'panneau_' + Date.now() + '_' + Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 5)
							panneaux.push(copiePanneau)
						}
					})
					if (document.querySelector('#' + id) && deplacer === true) {
						document.querySelector('#' + id).close()
						this.suppressionComplete = true
					}
					this.exportDonnees = false
					this.export = {}
					this.exportTermine = false
					this.panneauxExportes = 0
					this.fermerModalePanneau(!deplacer)
					setTimeout(() => {
						this.panneaux = panneaux
					}, 150)
				})
			} else if (valeur === true && this.export.type === 'corbeille') {
				const id = this.export.id
				const module = this.export.module
				let panneaux = JSON.parse(JSON.stringify(this.panneaux))
				let corbeille = JSON.parse(JSON.stringify(this.corbeille))
				let indexPanneau
				panneaux.forEach((panneau, index) => {
					if (panneau.id === id) {
						corbeille.push(panneau)
						panneaux.splice(index, 1)
						indexPanneau = index
					}
				})
				this.panneaux = panneaux
				this.corbeille = corbeille
				document.querySelector('#' + id)?.close()
				if (panneaux.length === 1) {
					document.querySelector('#' + panneaux[0].id)?.focus()
				} else if (panneaux.length > 1 && panneaux[indexPanneau]) {
					document.querySelector('#' + panneaux[indexPanneau].id)?.focus()
				} else if (panneaux.length > 1 && panneaux[indexPanneau - 1]) {
					document.querySelector('#' + panneaux[indexPanneau - 1].id)?.focus()
				}
				if (module === 'retroaction') {
					this.retroaction = false
				} else if (module === 'modalites') {
					this.modalites = false
				}
				this.exportDonnees = false
				this.export = {}
				this.exportTermine = false
				this.panneauxExportes = 0
				this.chargementPage = false
			} else if (valeur === true && this.export.type === 'copie') {
				const pages = JSON.parse(JSON.stringify(this.pages))
				const page = this.page
				const donneesPage = pages[page - 1]
				const donneesPanneauxPage = []
				const panneauxPage = JSON.parse(JSON.stringify(this.panneauxPage))
				panneauxPage.forEach((panneau) => {
					if (!this.corbeille.map(p => p.id).includes(panneau.id)) {
						panneau.id = 'panneau_' + Date.now() + '_' + Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 5)
						panneau.page = page + 1
						donneesPanneauxPage.push(panneau)
					}
				})
				this.pages.splice(page, 0, donneesPage)
				this.panneaux.forEach((panneau) => {
					if (panneau.page >= page + 1) {
						panneau.page = panneau.page + 1
					}
				})
				this.panneaux.push(...donneesPanneauxPage)
				this.exportDonnees = false
				this.export = {}
				this.exportTermine = false
				this.panneauxExportes = 0
				this.notification = { type: 'succes', message: this.$t('pageDupliquee', { index: page + 1 }) }
			}
		},
		notification (notification) {
			if (!notification.hasOwnProperty('message') || notification.message === '') return
			const conteneur = document.querySelector('#notification')
			conteneur?.querySelectorAll('.notification').forEach((notificationPrecedente) => {
				if (notificationPrecedente.textContent === notification.message && this.chronos.has(notificationPrecedente)) {
					clearTimeout(this.chronos.get(notificationPrecedente))
					this.chronos.delete(notificationPrecedente)
					notificationPrecedente.remove()
				}
			})
			const element = document.createElement('div')
			element.textContent = notification.message
			element.classList.add('notification')
			element.classList.add(notification.type)
			conteneur?.appendChild(element)
			const demarrer = () => {
				clearTimeout(this.chronos.get(element))
				this.chronos.set(element, setTimeout(() => {
					this.chronos.delete(element)
					element.remove()
				}, 5000))
			}
			element.addEventListener('pointerenter', (event) => {
				if (event.pointerType === 'mouse') clearTimeout(this.chronos.get(element))
			})
			element.addEventListener('pointerleave', (event) => {
				if (event.pointerType === 'mouse') demarrer()
			})
			demarrer()
			this.notification = {}
		}
	},
	created () {
		this.chronos = new Map()
	},
	mounted () {
		this.verifierDimensions()
		this.activerDefilementHorizontal()

		document.querySelector('#chargement').addEventListener('animationend', () => {
			this.chargement = false
		}, false)

		const params = new URLSearchParams(document.location.search)

		const langues = ['fr', 'en', 'it', 'es', 'nl', 'de', 'hr', 'eu']
		let langue = params.get('lang')
		if (langues.includes(langue) === true) {
			this.langue = langue
			localStorage.setItem('digiscreen_lang', langue)
		}
		const langueNavigateur = navigator.language.substring(0, 2)
		if (langues.includes(langue) === false && langues.includes(langueNavigateur) === true) {
			this.langue = langueNavigateur
		}
		if (localStorage.getItem('digiscreen_lang')) {
			this.langue = localStorage.getItem('digiscreen_lang')
		}
		this.$i18n.locale = this.langue
		document.getElementsByTagName('html')[0].setAttribute('lang', this.langue)

		if (localStorage.getItem('digiscreen_modules')) {
			try {
				this.modules = this.migrerModules(JSON.parse(localStorage.getItem('digiscreen_modules')))
			} catch {
				localStorage.removeItem('digiscreen_modules')
			}
		}

		if (localStorage.getItem('digiscreen_fonte')) {
			this.fonte = localStorage.getItem('digiscreen_fonte')
		}

		let pageAAfficher = 0
		const page = params.get('page')
		if (page && !isNaN(parseInt(page))) {
			pageAAfficher = parseInt(page)
		}

		const dgs = params.get('dgs')
		if (lecteur) {
			this.importDonnees = true
			const donneesLecteur = recupererDonneesLecteur()
			if (donneesLecteur && Array.isArray(donneesLecteur.pages) && donneesLecteur.pages.length > 0 && Array.isArray(donneesLecteur.panneaux)) {
				this.lectureSeule = donneesLecteur.lectureSeule === true
				this.chargerDonnees(donneesLecteur, pageAAfficher, langues.includes(langue))
			} else {
				this.importTermine = true
				this.notification = { type: 'erreur', message: this.$t('erreurDonneesLecteur') }
			}
			this.$nextTick(() => {
				document.querySelector('#import')?.addEventListener('animationend', () => {
					this.importDonnees = false
					this.importTermine = false
				})
			})
		} else if (dgs && dgs !== '') {
			this.importDonnees = true
			let mdp = ''
			const dgt = params.get('dgt')
			if (dgt && dgt !== '') {
				const requete = new URLSearchParams(window.location.search)
				requete.delete('dgt')
				window.history.replaceState({}, document.title, window.location.pathname + (requete.toString() === '' ? '' : '?' + requete))
			} else if (params.get('mdp')) {
				window.history.replaceState({}, document.title, window.location.href.split('&mdp=')[0])
				mdp = params.get('mdp')
				mdp = decodeURIComponent(window.atob(mdp))
			}
			const xhr = new XMLHttpRequest()
			xhr.onload = () => {
				if (xhr.status === 200) {
					let donnees = xhr.responseText
					if (donnees !== '' && this.verifierJSON(donnees) === true) {
						donnees = JSON.parse(donnees)
						this.admin = donnees.admin
						this.motdepasse = mdp
						this.dgsId = donnees.id
						if (donnees.bloque === true) {
							this.notification = { type: 'erreur', message: this.$t('erreurTentativesNombreuses') }
						}
						try {
							const donneesDgs = JSON.parse(donnees.dgs)
							if (!donneesDgs || !Array.isArray(donneesDgs.pages)) {
								throw new Error()
							}
							this.chargerDonnees(donneesDgs, pageAAfficher, langue && langues.includes(langue))
						} catch {
							this.importTermine = true
							this.notification = { type: 'erreur', message: this.$t('erreurChargementLien') }
						}
					} else {
						this.importTermine = true
						this.notification = { type: 'erreur', message: this.$t('erreurChargementLien') }
					}
				} else {
					this.importTermine = true
					this.notification = { type: 'erreur', message: xhr.status === 429 ? this.$t('erreurRequetesNombreuses') : this.$t('erreurChargementLien') }
				}
				this.$nextTick(() => {
					document.querySelector('#import')?.addEventListener('animationend', () => {
						this.importDonnees = false
						this.importTermine = false
					})
				})
			}
			xhr.onerror = () => {
				this.importTermine = true
				this.notification = { type: 'erreur', message: this.$t('erreurEnregistrement') }
			}
			xhr.open('POST', window.location.href.split('?')[0] + 'inc/recuperer_donnees_dgs.php', true)
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
			xhr.send('dgs=' + encodeURIComponent(dgs) + (dgt && dgt !== '' ? '&dgt=' + encodeURIComponent(dgt) : '&mdp=' + encodeURIComponent(mdp)))
		}

		this.audio = new Audio()
		this.audio.autoplay = true
		this.audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
		document.body.addEventListener('touchstart', () => {
			if (this.audioInitialise === false) {
				this.audio.play()
				this.audioInitialise = true
			}
		})
		document.body.addEventListener('click', () => {
			if (this.audioInitialise === false) {
				this.audio.play()
				this.audioInitialise = true
			}
		})

		this.recupererVoix()
		const synth = window.speechSynthesis
		if (synth && synth.onvoiceschanged !== undefined) {
			synth.onvoiceschanged = this.recupererVoix
		}

		document.addEventListener('keydown', this.gererClavier, false)

		document.querySelector('main').addEventListener('dragover', (event) => {
			event.preventDefault()
			event.stopPropagation()
		}, false)

		document.querySelector('main').addEventListener('dragenter', (event) => {
			event.preventDefault()
			event.stopPropagation()
		}, false)

		document.querySelector('main').addEventListener('drop', this.deposer, false)

		fscreen.addEventListener('fullscreenchange', () => {
			if (fscreen.fullscreenElement === null) {
				this.pleinEcran = false
			} else {
				this.pleinEcran = true
			}
		})

		window.addEventListener('resize', this.verifierDimensions, false)

		// Untere Programmleiste: alle Buttons sichtbar (Medienzentrum MTK)
		window.addEventListener('resize', this.ajusterNav, false)
		this.$nextTick(this.ajusterNav)
		if (document.fonts && document.fonts.ready) {
			document.fonts.ready.then(() => this.ajusterNav())
		}

		window.addEventListener('beforeunload', this.quitterPage, false)

		window.addEventListener('paste', this.coller, false)
	},
	beforeUnmount () {
		this.chronos.forEach((chrono) => clearTimeout(chrono))
		this.chronos.clear()
		document.removeEventListener('keydown', this.gererClavier, false)
		document.querySelector('main').removeEventListener('drop', this.deposer, false)
		window.removeEventListener('resize', this.verifierDimensions, false)
		window.removeEventListener('paste', this.coller, false)
		window.removeEventListener('beforeunload', this.quitterPage, false)
	},
	methods: {
		definirLibelleModule (court, complet) {
			return complet.toLowerCase().startsWith(court.toLowerCase()) ? complet : court + ', ' + complet
		},
		annoncer (texte) {
			const statut = document.querySelector('#statut')
			if (!statut) return
			statut.textContent = ''
			setTimeout(() => {
				statut.textContent = texte
			}, 150)
		},
		migrerModules (modules) {
			if (!Array.isArray(modules)) {
				return modules
			}
			return [...new Set(modules.map((module) => module === 'pendu' ? 'mot-mystere' : module))]
		},
		migrerPanneaux (panneaux) {
			if (Array.isArray(panneaux)) {
				panneaux.forEach((panneau) => {
					if (panneau && panneau.type === 'pendu') {
						panneau.type = 'mot-mystere'
						if (['Pendu', 'Hangman', 'Ahorcado', 'L\'impiccato', 'Gehängte', 'Beul', 'Dželat', 'Urkatua'].includes(panneau.titre)) {
							delete panneau.titre
						}
					}
				})
			}
			return panneaux
		},
		chargerDonnees (donneesDgs, pageAAfficher, langueImposee) {
			this.modules = this.migrerModules(donneesDgs.modules)
			this.panneaux = this.migrerPanneaux(donneesDgs.panneaux)
			if (!langueImposee) {
				this.langue = donneesDgs.langue
				this.$i18n.locale = donneesDgs.langue
			}
			if (donneesDgs.hasOwnProperty('nav')) {
				this.nav = donneesDgs.nav
			}
			if (donneesDgs.hasOwnProperty('fonte')) {
				this.fonte = donneesDgs.fonte
			}
			this.importTermine = true
			this.$nextTick(() => {
				this.pages = donneesDgs.pages
				if (pageAAfficher > 1 && pageAAfficher <= this.pages.length) {
					this.page = pageAAfficher
				} else if (donneesDgs.page > 0 && donneesDgs.page <= this.pages.length) {
					this.page = donneesDgs.page
				} else {
					this.page = 1
				}
				if (this.pages[this.page - 1].hasOwnProperty('annotation')) {
					this.annotation = this.pages[this.page - 1].annotation
				} else {
					this.annotation = Object.keys(this.pages[this.page - 1].annotations || {}).length > 0
				}
				if (this.page === 1) {
					const panneaux = this.panneaux.filter((element) => {
						return element.page === 1
					})
					this.panneauxPage = panneaux
					for (let i = 0; i < this.panneauxPage.length; i++) {
						if (this.panneauxPage[i].type === 'retroaction') {
							this.retroaction = true
						}
						if (this.panneauxPage[i].type === 'modalites') {
							this.modalites = true
						}
					}
				}
			})
		},
		basculerDeplacementFond () {
			this.deplacementFond = !this.deplacementFond
		},
		deplacerFondDe (dx, dy) {
			const page = this.pages[this.page - 1]
			if (!page || (dx === 0 && dy === 0)) {
				return
			}
			const d = page.decalageFond || { x: 0, y: 0 }
			page.decalageFond = { x: d.x + dx, y: d.y + dy }
			// Ist das Annotieren geschlossen, die gespeicherten Objekte hier mitverschieben (sonst übernimmt das die Annotation selbst)
			if (!this.annotation && page.annotations && Array.isArray(page.annotations.items)) {
				deplacerAnnotations(page.annotations.items, dx, dy)
			}
		},
		debutDeplacementFond (event) {
			event.preventDefault()
			this.gesteFond = { id: event.pointerId, x: event.clientX, y: event.clientY }
			window.addEventListener('pointermove', this.mouvementDeplacementFond)
			window.addEventListener('pointerup', this.finDeplacementFond)
			window.addEventListener('pointercancel', this.finDeplacementFond)
		},
		mouvementDeplacementFond (event) {
			const g = this.gesteFond
			if (!g || event.pointerId !== g.id) {
				return
			}
			event.preventDefault()
			const dx = event.clientX - g.x
			const dy = event.clientY - g.y
			g.x = event.clientX
			g.y = event.clientY
			this.deplacerFondDe(dx, dy)
		},
		finDeplacementFond (event) {
			const g = this.gesteFond
			if (!g || event.pointerId !== g.id) {
				return
			}
			window.removeEventListener('pointermove', this.mouvementDeplacementFond)
			window.removeEventListener('pointerup', this.finDeplacementFond)
			window.removeEventListener('pointercancel', this.finDeplacementFond)
			this.gesteFond = null
		},
		recentrerFond () {
			const d = this.decalageFond
			this.deplacerFondDe(-d.x, -d.y)
		},
		modifierEchelleFond (sens) {
			const etapes = this.etapesEchelleFond
			let i = etapes.indexOf(this.echelleFond)
			if (i === -1) {
				i = etapes.indexOf(1)
			}
			const ancienne = this.echelleFond
			const nouvelle = sens === 0 ? 1 : etapes[Math.min(Math.max(i + sens, 0), etapes.length - 1)]
			const page = this.pages[this.page - 1]
			// Ist das Annotieren geschlossen, die gespeicherten Objekte hier mitskalieren (sonst übernimmt das die Annotation selbst)
			if (!this.annotation && nouvelle !== ancienne && page.annotations && Array.isArray(page.annotations.items) && page.annotations.items.length > 0) {
				const main = document.querySelector('main')
				const w = main ? main.clientWidth : window.innerWidth
				const h = main ? main.clientHeight : window.innerHeight
				const lineatur = this.fond.includes('/img/lineatur-haeuschen')
				const d = this.decalageFond
				echelonnerAnnotations(page.annotations.items, nouvelle / ancienne, (lineatur ? 0 : w / 2) + d.x, (lineatur ? 0 : h / 2) + d.y)
			}
			page.echelleFond = nouvelle
		},
		creerPanneau (type) {
			if (type === 'retroaction' && this.retroaction === true) {
				for (let i = 0; i < this.panneauxPage.length; i++) {
					if (this.panneauxPage[i].type === 'retroaction') {
						this.fermerPanneau(this.panneauxPage[i].id, type)
						break
					}
				}
				return
			} else if (type === 'modalites' && this.modalites === true) {
				for (let i = 0; i < this.panneauxPage.length; i++) {
					if (this.panneauxPage[i].type === 'modalites') {
						this.fermerPanneau(this.panneauxPage[i].id, type)
						break
					}
				}
				return
			}
			const id = 'panneau_' + Date.now() + '_' + Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 5)
			const largeur = document.body.clientWidth / 2
			const hauteur = (document.body.clientHeight - this.convertirRem(7.5)) / 2
			let panneau
			switch (type) {
			case 'codeqr':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 36, h: 46, x: largeur - this.convertirRem(18), y: hauteur - this.convertirRem(23) }
				break
			case 'texte':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 68, h: 46, x: largeur - this.convertirRem(34), y: hauteur - this.convertirRem(23) }
				break
			case 'seyes':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 60, h: 46, x: largeur - this.convertirRem(30), y: hauteur - this.convertirRem(23) }
				break
			case 'tableau':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 60, h: 45, x: largeur - this.convertirRem(30), y: hauteur - this.convertirRem(22.5) }
				break
			case 'image':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 27, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(13.5) }
				break
			case 'galerie':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 60, h: 38, x: largeur - this.convertirRem(30), y: hauteur - this.convertirRem(19) }
				break
			case 'dessin':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 48, h: 35, x: largeur - this.convertirRem(24), y: hauteur - this.convertirRem(17.5) }
				break
			case 'document':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 16, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(8) }
				break
			case 'audio':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 26, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(13) }
				break
			case 'enregistrement':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 26, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(13) }
				break
			case 'synthese':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 45, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(22.5) }
				break
			case 'video':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 27, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(13.5) }
				break
			case 'webcam':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 22, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(11) }
				break
			case 'partage-ecran':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 11, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(5.5) }
				break
			case 'lien':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 28, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(14) }
				break
			case 'iframe':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 22, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(11) }
				break
			case 'html':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 44, h: 41, x: largeur - this.convertirRem(22), y: hauteur - this.convertirRem(20.5) }
				break
			case 'liste':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 50, h: 32, x: largeur - this.convertirRem(25), y: hauteur - this.convertirRem(16) }
				break
			case 'nuage':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 80, h: 59.5, x: largeur - this.convertirRem(40), y: hauteur - this.convertirRem(29.75) }
				break
			case 'ordre':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 46, h: 56.2, x: largeur - this.convertirRem(23), y: hauteur - this.convertirRem(28.1) }
				break
			case 'images-sequentielles':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 60, h: 44, x: largeur - this.convertirRem(30), y: hauteur - this.convertirRem(22) }
				break
			case 'trous':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 46, h: 50, x: largeur - this.convertirRem(23), y: hauteur - this.convertirRem(25) }
				break
			case 'surlignage':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 46, h: 36, x: largeur - this.convertirRem(23), y: hauteur - this.convertirRem(18) }
				break
			case 'mot-mystere':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 60.4, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(30.2) }
				break
			case 'cartes':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 60, h: 50, x: largeur - this.convertirRem(30), y: hauteur - this.convertirRem(25) }
				break
			case 'appariement':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 64, h: 56, x: largeur - this.convertirRem(32), y: hauteur - this.convertirRem(28) }
				break
			case 'categories':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 64, h: 70, x: largeur - this.convertirRem(32), y: hauteur - this.convertirRem(35) }
				break
			case 'tirage':
			case 'tirage-texte':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 46, h: 42, x: largeur - this.convertirRem(23), y: hauteur - this.convertirRem(20) }
				break
			case 'tirage-nombre':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 46, h: 28, x: largeur - this.convertirRem(23), y: hauteur - this.convertirRem(14) }
				break
			case 'tirage-image':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 60, h: 40, x: largeur - this.convertirRem(30), y: hauteur - this.convertirRem(20) }
				break
			case 'tirage-audio':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 60, h: 40, x: largeur - this.convertirRem(30), y: hauteur - this.convertirRem(20) }
				break
			case 'roue':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 60, h: 46, x: largeur - this.convertirRem(30), y: hauteur - this.convertirRem(23) }
				break
			case 'histoire':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 22, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(11) }
				break
			case 'plateau':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 50, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(25) }
				break
			case 'des':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 29, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(14.5) }
				break
			case 'classement':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 46, h: 45, x: largeur - this.convertirRem(22.5), y: hauteur - this.convertirRem(21) }
				break
			case 'feu':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 28, h: 57, x: largeur - this.convertirRem(14), y: hauteur - this.convertirRem(28.5) }
				break
			case 'modalites':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 38, h: 56, x: largeur - this.convertirRem(19), y: hauteur - this.convertirRem(28) }
				this.modalites = true
				break
			case 'groupes':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 46, h: 50, x: largeur - this.convertirRem(23), y: hauteur - this.convertirRem(25) }
				break
			case 'humeur':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 50, h: 60, x: largeur - this.convertirRem(25), y: hauteur - this.convertirRem(30) }
				break
			case 'chrono':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 48, h: 29, x: largeur - this.convertirRem(24), y: hauteur - this.convertirRem(14.5) }
				break
			case 'rebours':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 44, h: 32, x: largeur - this.convertirRem(22), y: hauteur - this.convertirRem(16) }
				break
			case 'sablier':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 20, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(10) }
				break
			case 'horloge-modulable':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 43.6, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(21.8) }
				break
			case 'horloge':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 43.6, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(21.8) }
				break
			case 'calendrier':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 34, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(17) }
				break
			case 'retroaction':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 36, h: 31, x: largeur - this.convertirRem(18), y: hauteur - this.convertirRem(15.5) }
				this.retroaction = true
				break
			case 'sonometre':
				panneau = { page: this.page, id: id, type: type, mode: '', statut: '', dimensions: {}, position: {}, contenu: '', w: 40, h: 32, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(16) }
				break
			}
			if (!panneau) return
			this.panneaux.push(panneau)
			this.panneauxPage.push(panneau)
			this.$nextTick(() => {
				this.afficherPanneau(id)
			})
		},
		modifierPanneau (donnees) {
			this.panneaux.forEach((panneau, index) => {
				if (panneau.id === donnees.id) {
					this.panneaux[index].titre = donnees.titre
					this.panneaux[index].mode = donnees.mode
					this.panneaux[index].statut = donnees.statut
					this.panneaux[index].dimensions = donnees.dimensions
					this.panneaux[index].position = donnees.position
					this.panneaux[index].contenu = donnees.contenu
					this.panneaux[index].w = donnees.w
					this.panneaux[index].h = donnees.h
					if (donnees.hasOwnProperty('echelle')) {
						this.panneaux[index].echelle = donnees.echelle
					}
					this.panneaux[index].x = donnees.x
					this.panneaux[index].y = donnees.y
				}
			})
			this.panneauxExportes++
			if (this.panneauxExportes === this.panneauxPage.length) {
				this.exportTermine = true
			}
		},
		afficherPanneau (id) {
			this.panneauAffiche = id
		},
		retirerPanneauCorbeille (id) {
			this.corbeille = this.corbeille.filter((panneau) => panneau.id !== id)
		},
		fermerPanneau (id, module) {
			if (this.suppressionComplete) {
				this.suppressionComplete = false
				return
			}
			this.export = { type: 'corbeille', id: id, module: module }
			this.exportDonnees = true
			this.chargementPage = true
			if (this.panneauxPage.length === 0) {
				this.exportTermine = true
			}
		},
		verifierPanneauAffiche (event) {
			if (event.target.closest('.jsPanel') === null) {
				this.panneauAffiche = ''
			}
		},
		ouvrirModale (modale) {
			this.elementPrecedent = (document.activeElement || document.body)
			this.modale = modale
		},
		fermerModale () {
			this.modale = ''
			this.gererFocus()
		},
		ouvrirMenu () {
			this.elementPrecedent = (document.activeElement || document.body)
			this.menuFonds = false
			this.menu = true
		},
		ouvrirMenuFonds () {
			// Eigener Button „Hintergründe“: Einstellungsmenü nur mit der Hintergrundauswahl
			this.elementPrecedent = (document.activeElement || document.body)
			this.menuFonds = true
			this.menu = true
		},
		fermerMenu () {
			this.menuFonds = false
			this.menu = false
			this.gererFocus()
		},
		reinitialiserGrille () {
			this.pages[this.page - 1].grille = {}
		},
		capturer () {
			html2canvas(document.body, { useCORS: true }).then((canvas) => {
				this.audio.src = recupererRessource('./static/audio/photo.mp3')
				this.audio.play()
				saveAs(canvas.toDataURL('image/jpeg', 0.95).replace('image/jpeg', 'image/octet-stream'), 'capture_' + Date.now() + '.jpg')
			}).catch(() => {})
		},
		annoter () {
			this.annotation = true
			this.pages[this.page - 1].annotation = true
			this.outilDeplacer = false
		},
		arreterAnnoter () {
			this.annotation = false
			this.pages[this.page - 1].annotation = false
			this.outilDeplacer = false
		},
		definirOutilDeplacer (valeur) {
			this.outilDeplacer = valeur
		},
		entrerPleinEcran () {
			fscreen.requestFullscreen(document.body)
		},
		sortirPleinEcran () {
			fscreen.exitFullscreen()
		},
		afficherPage (page) {
			this.page = page
		},
		masquerOutils () {
			this.nav = false
			this.$nextTick(() => {
				document.querySelector('.nav')?.focus()
			})
		},
		afficherOutils () {
			this.nav = true
			this.$nextTick(() => {
				document.querySelector('.nav')?.focus()
			})
		},
		verrouillerOutils () {
			this.lectureSeule = true
			this.$nextTick(() => {
				document.querySelector('.bouton-cadenas')?.focus()
			})
		},
		deverrouillerOutils () {
			this.lectureSeule = false
			this.$nextTick(() => {
				document.querySelector('.bouton-cadenas')?.focus()
			})
		},
		importer (event) {
			const fichier = event.target.files[0]
			if (!fichier) {
				document.querySelector('#televerser').value = ''
				return
			}
			this.importDonnees = true
			const page = this.page
			const reader = new FileReader()
			reader.onload = (e) => {
				if (this.verifierJSON(e.target.result) === false) {
					this.importTermine = true
					return
				}
				const donnees = JSON.parse(e.target.result)
				this.pages = donnees.pages
				this.page = donnees.page
				this.modules = this.migrerModules(donnees.modules)
				this.panneaux = this.migrerPanneaux(donnees.panneaux)
				this.corbeille = []
				this.langue = donnees.langue
				this.$i18n.locale = donnees.langue
				if (donnees.hasOwnProperty('nav')) {
					this.nav = donnees.nav
				}
				if (donnees.hasOwnProperty('fonte')) {
					this.fonte = donnees.fonte
				}
				if (donnees.hasOwnProperty('lectureSeule')) {
					this.lectureSeule = donnees.lectureSeule
				}
				this.importTermine = true
				if (page === this.page) {
					if (this.pages[this.page - 1].annotation === false) {
						this.annotation = false
					} else {
						this.annotation = true
					}
					this.retroaction = false
					this.modalites = false
					this.panneauxPage.forEach((panneau) => {
						document.querySelector('#' + panneau.id)?.close()
					})
					this.panneauxPage = []
					const panneauxPage = donnees.panneaux.filter((element) => {
						return element.page === donnees.page
					})
					imagesLoaded('main', { background: true }, () => {
						setTimeout(() => {
							this.panneauxPage.push(...panneauxPage)
							for (let i = 0; i < this.panneauxPage.length; i++) {
								if (this.panneauxPage[i].type === 'retroaction') {
									this.retroaction = true
								}
								if (this.panneauxPage[i].type === 'modalites') {
									this.modalites = true
								}
							}
							if (donnees.hasOwnProperty('ecran') && donnees.ecran.largeur > document.body.clientWidth) {
								const zoom = Math.ceil((document.body.clientWidth / donnees.ecran.largeur) * 100)
								alert(this.$t('alerteEcran', { zoom: zoom }))
							}
							this.$nextTick(() => {
								if (this.lectureSeule === true) {
									const panneaux = document.querySelectorAll('.jsPanel')
									panneaux.forEach((panneau) => {
										if (panneau.querySelector('.jsPanel-btn-close')) {
											panneau.setControlStatus('close', 'hide')
										}
										if (panneau.querySelector('.jsPanel-btn-send')) {
											panneau.setControlStatus('send', 'hide')
										}
									})
								}
							})
						}, 150)
					})
				}
			}
			reader.readAsText(fichier)
			document.querySelector('#televerser').value = ''
			this.$nextTick(() => {
				document.querySelector('#import').addEventListener('animationend', () => {
					this.importDonnees = false
					this.importTermine = false
				})
			})
		},
		exporter (nombre, format = 'dgs') {
			const date = new Date()
			const annee = date.getFullYear()
			let mois = date.getMonth() + 1
			if (mois < 10) {
				mois = '0' + mois
			}
			let jour = date.getDate()
			if (jour < 10) {
				jour = '0' + jour
			}
			let heures = date.getHours()
			if (heures < 10) {
				heures = '0' + heures
			}
			let minutes = date.getMinutes()
			if (minutes < 10) {
				minutes = '0' + minutes
			}
			let secondes = date.getSeconds()
			if (secondes < 10) {
				secondes = '0' + secondes
			}
			const fichier = 'digiscreen_' + jour + '-' + mois + '-' + annee + '_' + heures + '-' + minutes + '-' + secondes
			this.export = { type: 'fichier', fichier: fichier, nombre: nombre, format: format }
			this.exportDonnees = true
			this.chargementPage = true
			if (this.panneauxPage.length === 0) {
				this.exportTermine = true
			}
		},
		enregistrer () {
			this.export = { type: 'enregistrement' }
			this.exportDonnees = true
			this.chargementPage = true
			if (this.panneauxPage.length === 0) {
				this.exportTermine = true
			}
		},
		dupliquerPage () {
			this.export = { type: 'copie' }
			this.exportDonnees = true
			if (this.panneauxPage.length === 0) {
				this.exportTermine = true
			}
		},
		modifierModule (event) {
			const module = event.target.value
			if (event.target.checked === true) {
				this.modules.push(module)
				this.notification = { type: 'succes', message: this.$t('moduleActive') }
			} else {
				const index = this.modules.indexOf(module)
				this.modules.splice(index, 1)
				this.notification = { type: 'succes', message: this.$t('moduleDesactive') }
			}
			localStorage.setItem('digiscreen_modules', JSON.stringify(this.modules))
		},
		recupererVoix () {
			const synth = window.speechSynthesis
			if (synth) {
				this.listeVoix = synth.getVoices().sort((a, b) => {
					const nomA = a.name.toUpperCase()
					const nomB = b.name.toUpperCase()
					if (nomA < nomB) return -1
					else if (nomA === nomB) return 0
					else return +1
				})
			}
		},
		verifierJSON (json) {
			try {
				JSON.parse(json)
				return true
			} catch {
				return false
			}
		},
		verifierDimensions () {
			const largeur = document.body.clientWidth
			this.$nextTick(() => {
				this.largeur = document.body.clientWidth
				if (this.nav) {
					this.hauteur = document.body.clientHeight - this.convertirRem(7.5)
				} else {
					this.hauteur = document.body.clientHeight
				}
			})
			if (largeur < 1024) {
				this.alerte = true
			} else if (this.alerte) {
				this.alerte = false
				this.chargement = true
				this.$nextTick(() => {
					document.querySelector('#chargement').addEventListener('animationend', () => {
						this.chargement = false
					})
				})
			}
		},
		coller (event) {
			if ((!this.annotation || (this.annotation && this.outilDeplacer)) && event.target.tagName.toLowerCase() !== 'input' && event.target.tagName.toLowerCase() !== 'textarea' && !event.target.closest('.pell-content')) {
				const items = event.clipboardData.files
				const largeur = document.body.clientWidth / 2
				const hauteur = (document.body.clientHeight - this.convertirRem(7.5)) / 2
				for (let i = 0; i < items.length; i++) {
					if (items[i].type.includes('image')) {
						const id = 'panneau_' + Date.now() + '_' + Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 5)
						let fichier
						const reader = new FileReader()
						reader.readAsDataURL(items[i])
						reader.onloadend = (e) => {
							const img = new Image()
							img.src = e.target.result
							img.onload = () => {
								if (img.width > 1200) {
									const canvas = document.createElement('canvas')
									const ratio = img.width / img.height
									const largeurCanvas = 1200
									const hauteurCanvas = 1200 / ratio
									canvas.width = largeurCanvas
									canvas.height = hauteurCanvas
									canvas.getContext('2d').drawImage(img, 0, 0, largeurCanvas, hauteurCanvas)
									fichier = canvas.toDataURL('image/jpeg', 0.85)
								} else {
									fichier = e.target.result
								}
								const panneau = { page: this.page, id: id, type: 'image', mode: 'lecture', statut: '', dimensions: {}, position: {}, contenu: { image: fichier, requete: '', page: 1, zoom: 1 }, w: 40, h: 30, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(15) }
								this.panneaux.push(panneau)
								this.panneauxPage.push(panneau)
								this.$nextTick(() => { this.afficherPanneau(id) })
							}
						}
					}
				}
			}
		},
		deposer (event) {
			event.preventDefault()
			event.stopPropagation()
			if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
				for (let i = 0; i < event.dataTransfer.files.length; i++) {
					if (event.dataTransfer.files[i].type === 'application/pdf' || event.dataTransfer.files[i].type.substring(0, 5) === 'image' || event.dataTransfer.files[i].type.substring(0, 5) === 'audio' || event.dataTransfer.files[i].type.substring(0, 5) === 'video') {
						const id = 'panneau_' + Date.now() + '_' + Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 5)
						const largeur = document.body.clientWidth / 2
						const hauteur = (document.body.clientHeight - this.convertirRem(7.5)) / 2
						let type = event.dataTransfer.files[i].type.substring(0, 5)
						if (event.dataTransfer.files[i].type === 'application/pdf') {
							type = 'pdf'
						}
						let fichier, reader
						if (type === 'image') {
							reader = new FileReader()
							reader.readAsDataURL(event.dataTransfer.files[i])
							reader.onloadend = (e) => {
								const img = new Image()
								img.src = e.target.result
								img.onload = () => {
									if (img.width > 1200) {
										const canvas = document.createElement('canvas')
										const ratio = img.width / img.height
										const largeurCanvas = 1200
										const hauteurCanvas = 1200 / ratio
										canvas.width = largeurCanvas
										canvas.height = hauteurCanvas
										canvas.getContext('2d').drawImage(img, 0, 0, largeurCanvas, hauteurCanvas)
										fichier = canvas.toDataURL('image/jpeg', 0.85)
									} else {
										fichier = e.target.result
									}
									const panneau = { page: this.page, id: id, type: type, mode: 'lecture', statut: '', dimensions: {}, position: {}, contenu: { image: fichier, requete: '', page: 1, zoom: 1 }, w: 40, h: 30, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(15) }
									this.panneaux.push(panneau)
									this.panneauxPage.push(panneau)
									this.$nextTick(() => { this.afficherPanneau(id) })
								}
							}
						} else if (type === 'audio') {
							reader = new FileReader()
							reader.readAsDataURL(event.dataTransfer.files[i])
							reader.onloadend = (e) => {
								const dataURL = e.target.result
								fichier = window.URL.createObjectURL(event.dataTransfer.files[i])
								const panneau = { page: this.page, id: id, type: type, mode: 'lecture', statut: '', dimensions: {}, position: {}, contenu: { audio: fichier, dataURL: dataURL, vitesse: 1 }, w: 40, h: 12, x: largeur - this.convertirRem(20), y: hauteur - this.convertirRem(6) }
								this.panneaux.push(panneau)
								this.panneauxPage.push(panneau)
								this.$nextTick(() => { this.afficherPanneau(id) })
							}
						} else if (type === 'video') {
							reader = new FileReader()
							reader.readAsDataURL(event.dataTransfer.files[i])
							reader.onloadend = (e) => {
								const dataURL = e.target.result
								fichier = window.URL.createObjectURL(event.dataTransfer.files[i])
								const panneau = { page: this.page, id: id, type: type, mode: 'lecture', statut: '', dimensions: {}, position: {}, contenu: { video: fichier, videoId: '', type: event.dataTransfer.files[i].type, dataURL: dataURL, debutMinutes: '', debutSecondes: '', finMinutes: '', finSecondes: '' }, w: 48, h: 31.5, x: largeur - this.convertirRem(24), y: hauteur - this.convertirRem(15.75) }
								this.panneaux.push(panneau)
								this.panneauxPage.push(panneau)
								this.$nextTick(() => { this.afficherPanneau(id) })
							}
						} else if (type === 'pdf') {
							reader = new FileReader()
							reader.readAsDataURL(event.dataTransfer.files[i])
							reader.onloadend = (e) => {
								const dataURL = e.target.result
								fichier = window.URL.createObjectURL(event.dataTransfer.files[i])
								const panneau = { page: this.page, id: id, type: 'document', mode: 'lecture', statut: '', dimensions: {}, position: {}, contenu: { document: fichier, dataURL: dataURL, type: type }, w: 50, h: 35, x: largeur - this.convertirRem(25), y: hauteur - this.convertirRem(17.5) }
								this.panneaux.push(panneau)
								this.panneauxPage.push(panneau)
								this.$nextTick(() => { this.afficherPanneau(id) })
							}
						}
					}
				}
			}
		},
		gererFocus () {
			this.$nextTick(() => {
				if (this.elementPrecedent) {
					this.elementPrecedent.focus()
					this.elementPrecedent = null
				}
			})
		},
		gererClavier (event) {
			if (event.ctrlKey && event.key === 'k') {
				event.preventDefault()
				this.capturer()
			} else if (event.ctrlKey && event.key === 'm' && !this.menu) {
				event.preventDefault()
				this.ouvrirMenu()
			} else if (event.ctrlKey && event.key === 'm' && this.menu) {
				event.preventDefault()
				this.fermerMenu()
			} else if (event.ctrlKey && event.key === 'i') {
				event.preventDefault()
				if (this.modale === 'info') {
					this.fermerModale()
				} else {
					this.ouvrirModale('info')
				}
			} else if (this.modale === '' && document.querySelector('#conteneur-modale-panneau') && event.key === 'Escape') {
				this.fermerModalePanneau()
			} else if (this.modale !== '' && event.key === 'Escape') {
				this.fermerModale()
			} else if (event.ctrlKey && event.key === 'e' && !this.pleinEcran) {
				this.entrerPleinEcran()
			} else if (event.ctrlKey && event.key === 'e' && this.pleinEcran) {
				this.sortirPleinEcran()
			} else if (event.ctrlKey && (event.key === '*' || event.key === 'l')) {
				event.preventDefault()
				this.nav = !this.nav
			} else if (event.ctrlKey && event.key === 'ArrowLeft') {
				event.preventDefault()
				if (this.page === 1) {
					this.page = this.pages.length
				} else {
					this.page--
				}
			} else if (event.ctrlKey && event.key === 'ArrowRight') {
				event.preventDefault()
				if (this.page === this.pages.length) {
					this.page = 1
				} else {
					this.page++
				}
			} else if (event.ctrlKey && event.key === 'ArrowUp') {
				event.preventDefault()
				if (this.panneauAffiche !== '') {
					const panneauxPage = this.panneaux.filter((element) => {
						return element.page === this.page
					})
					for (let i = 0; i < panneauxPage.length; i++) {
						if (panneauxPage[i].id === this.panneauAffiche) {
							if (panneauxPage[i + 1] && document.querySelector('#' + panneauxPage[i + 1].id)) {
								document.querySelector('#' + panneauxPage[i + 1].id).front()
								this.$nextTick(() => {
									document.querySelector('#' + panneauxPage[i + 1].id)?.focus()
								})
								break
							} else {
								document.querySelector('#' + panneauxPage[0].id)?.front()
								this.$nextTick(() => {
									document.querySelector('#' + panneauxPage[0].id)?.focus()
								})
								break
							}
						}
					}
				}
			} else if (event.ctrlKey && event.key === 'ArrowDown') {
				event.preventDefault()
				if (this.panneauAffiche !== '') {
					const panneauxPage = this.panneaux.filter((element) => {
						return element.page === this.page
					})
					for (let i = 0; i < panneauxPage.length; i++) {
						if (panneauxPage[i].id === this.panneauAffiche) {
							if (panneauxPage[i - 1] && document.querySelector('#' + panneauxPage[i - 1].id)) {
								document.querySelector('#' + panneauxPage[i - 1].id).front()
								this.$nextTick(() => {
									document.querySelector('#' + panneauxPage[i - 1].id)?.focus()
								})
								break
							} else {
								document.querySelector('#' + panneauxPage[panneauxPage.length - 1].id)?.front()
								this.$nextTick(() => {
									document.querySelector('#' + panneauxPage[panneauxPage.length - 1].id)?.focus()
								})
								break
							}
						}
					}
				}
			} else if ((!this.annotation || (this.annotation && this.outilDeplacer)) && event.target.tagName.toLowerCase() !== 'input' && event.target.tagName.toLowerCase() !== 'textarea' && event.target.tagName.toLowerCase() !== 'select' && !event.target.isContentEditable && !event.target.closest('.pell-content') && (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'm' || event.key === 'f' || event.key === 'e' || event.key === 's' || event.key === 'c' || event.key === '+' || event.key === '-' || (event.key === 'Delete' && !this.lectureSeule) || (event.key === 'Escape' && !this.lectureSeule))) {
				event.preventDefault()
				if (this.panneauAffiche !== '') {
					this.evenementClavier = { event: event, touche: event.key, id: this.panneauAffiche }
				}
			}
		},
		ouvrirModalePanneau (div, fermeture = null) {
			if (document.querySelector('#conteneur-modale-panneau')) {
				this.fermerModalePanneau()
			}
			this.elementPrecedentModalePanneau = (document.activeElement || document.body)
			this.fermetureModalePanneau = fermeture
			div.addEventListener('keydown', (event) => {
				if (event.key === 'Escape') {
					event.stopPropagation()
					this.fermerModalePanneau()
				} else if (event.key === 'Tab') {
					this.piegerFocus(event, div.querySelector('.modale'))
				}
			})
			document.body.appendChild(div)
			this.$nextTick(() => {
				div.querySelector('input:not([type="radio"]), button')?.focus()
			})
		},
		fermerModalePanneau (restaurerFocus = true) {
			document.querySelector('#conteneur-modale-panneau')?.remove()
			if (this.fermetureModalePanneau) {
				this.fermetureModalePanneau()
				this.fermetureModalePanneau = null
			}
			if (restaurerFocus && this.elementPrecedentModalePanneau && document.body.contains(this.elementPrecedentModalePanneau)) {
				this.elementPrecedentModalePanneau.focus()
			} else {
				document.querySelector('#pages button[aria-current="page"]')?.focus()
			}
			this.elementPrecedentModalePanneau = null
		},
		piegerFocus (event, conteneur) {
			if (!conteneur) return
			const elementFocalisable = el => !el.disabled && el.tabIndex >= 0 && Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
			const elementsFocalisables = Array.from(conteneur.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])')).filter(el => !(el.type === 'radio' && !el.checked) && elementFocalisable(el))
			if (elementsFocalisables.length === 0) return
			const premier = elementsFocalisables[0]
			const dernier = elementsFocalisables[elementsFocalisables.length - 1]
			if (event.shiftKey) {
				if (document.activeElement === premier) {
					event.preventDefault()
					dernier.focus()
				}
			} else {
				if (document.activeElement === dernier) {
					event.preventDefault()
					premier.focus()
				}
			}
		},
		convertirRem (valeur) {
			const taille = window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size')
			return typeof valeur !== 'undefined' && valeur >= 0 ? parseFloat(taille) * valeur : parseFloat(taille)
		},
		ajusterNav () {
			const nav = document.querySelector('nav')
			if (!nav) {
				return
			}
			// Mehrzeilig umbrechen; braucht es mehr als zwei Reihen, kompakt ohne Beschriftung
			const reihen = () => new Set(Array.from(nav.querySelectorAll('button')).map(bouton => bouton.offsetTop)).size
			nav.classList.remove('compact')
			if (reihen() > 2) {
				nav.classList.add('compact')
			}
			document.documentElement.style.setProperty('--hauteur-nav', nav.offsetHeight + 'px')
		},
		activerDefilementHorizontal () {
			const nav = document.querySelector('nav')
			if (!nav) return
			nav.removeEventListener('mousedown', this.commencerDefilementHorizontal)
			nav.removeEventListener('mouseleave', this.terminerDefilementHorizontal)
			nav.removeEventListener('mouseup', this.terminerDefilementHorizontal)
			nav.removeEventListener('mousemove', this.poursuivreDefilementHorizontal)
			nav.addEventListener('mousedown', this.commencerDefilementHorizontal)
			nav.addEventListener('mouseleave', this.terminerDefilementHorizontal)
			nav.addEventListener('mouseup', this.terminerDefilementHorizontal)
			nav.addEventListener('mousemove', this.poursuivreDefilementHorizontal)
		},
		commencerDefilementHorizontal (event) {
			const nav = document.querySelector('nav')
			this.defilement = true
			this.depart = event.pageX - nav.offsetLeft
			this.distance = nav.scrollLeft
		},
		terminerDefilementHorizontal () {
			this.defilement = false
		},
		poursuivreDefilementHorizontal (event) {
			if (!this.defilement) {
				return
			}
			event.preventDefault()
			const nav = document.querySelector('nav')
			const x = event.pageX - nav.offsetLeft
			const delta = (x - this.depart) * 1.5
			nav.scrollLeft = this.distance - delta
		},
		quitterPage (event) {
			event.preventDefault()
			return ''
		}
	}
}
</script>

<style src="destyle.css/destyle.css"></style>
<style src="@/assets/css/style.css"></style>
<style>
main {
	font-family: v-bind('fonte');
}
</style>
<style src="@/assets/css/jspanel.css"></style>
<style src="@/assets/css/calendar.css"></style>
<style src="video.js/dist/video-js.css"></style>
<style src="tabulator-tables/dist/css/tabulator_simple.css"></style>
