<template>
	<div id="conteneur-menu">
		<div id="menu-parametres" class="menu" role="dialog" aria-modal="true" :aria-label="app.menuFonds ? $t('hintergruende') : $t('options')" @keydown="gererClavierParametres" :class="{'ouvert': ouvert, 'nur-fonds': app.menuFonds}">
			<header>
				<span class="titre">{{ app.menuFonds ? $t('hintergruende') : $t('options') }}</span>
				<button type="button" class="fermer" :title="$t('fermer')" :aria-label="$t('fermer')" @click="app.fermerMenu"><i class="material-icons" aria-hidden="true">close</i></button>
			</header>
			<div class="conteneur">
				<div class="contenu">
					<label id="libelle-langue">{{ $t('langue') }}</label>
					<div class="langue" role="group" aria-labelledby="libelle-langue">
						<button type="button" title="Français" aria-label="FR, Français" lang="fr" :aria-pressed="app.langue === 'fr' ? 'true' : 'false'" :class="{'selectionne': app.langue === 'fr'}" @click="modifierLangue('fr')">FR</button>
						<button type="button" title="Español" aria-label="ES, Español" lang="es" :aria-pressed="app.langue === 'es' ? 'true' : 'false'" :class="{'selectionne': app.langue === 'es'}" @click="modifierLangue('es')">ES</button>
						<button type="button" title="Italiano" aria-label="IT, Italiano" lang="it" :aria-pressed="app.langue === 'it' ? 'true' : 'false'" :class="{'selectionne': app.langue === 'it'}" @click="modifierLangue('it')">IT</button>
						<button type="button" title="Euskaraz" aria-label="EU, Euskaraz" lang="eu" :aria-pressed="app.langue === 'eu' ? 'true' : 'false'" :class="{'selectionne': app.langue === 'eu'}" @click="modifierLangue('eu')">EU</button>
						<button type="button" title="Deutsch" aria-label="DE, Deutsch" lang="de" :aria-pressed="app.langue === 'de' ? 'true' : 'false'" :class="{'selectionne': app.langue === 'de'}" @click="modifierLangue('de')">DE</button>
						<button type="button" title="Nederlands" aria-label="NL, Nederlands" lang="nl" :aria-pressed="app.langue === 'nl' ? 'true' : 'false'" :class="{'selectionne': app.langue === 'nl'}" @click="modifierLangue('nl')">NL</button>
						<button type="button" title="English" aria-label="EN, English" lang="en" :aria-pressed="app.langue === 'en' ? 'true' : 'false'" :class="{'selectionne': app.langue === 'en'}" @click="modifierLangue('en')">EN</button>
						<button type="button" title="Hrvatski" aria-label="HR, Hrvatski" lang="hr" :aria-pressed="app.langue === 'hr' ? 'true' : 'false'" :class="{'selectionne': app.langue === 'hr'}" @click="modifierLangue('hr')">HR</button>
					</div>

					<label id="libelle-parametres-1">{{ $t('arrierePlanPage') }}</label>
					<div role="group" aria-labelledby="libelle-parametres-1" class="fond">
						<button type="button" :title="$t('mainTaunus')" :aria-label="$t('mainTaunus')" @click="modifierFond('./static/img/main-taunus.jpg')">
							<img src="@/assets/img/miniatures/main-taunus.jpg" :alt="$t('mainTaunus')">
						</button>
						<button type="button" :title="$t('digitales')" :aria-label="$t('digitales')" @click="modifierFond('./static/img/digitale.jpg')">
							<img src="@/assets/img/miniatures/digitale.jpg" :alt="$t('digitales')">
						</button>
						<button type="button" :title="$t('lavande')" :aria-label="$t('lavande')" @click="modifierFond('./static/img/lavande.jpg')">
							<img src="@/assets/img/miniatures/lavande.jpg" :alt="$t('lavande')">
						</button>
						<button type="button" :title="$t('plage')" :aria-label="$t('plage')" @click="modifierFond('./static/img/plage.jpg')">
							<img src="@/assets/img/miniatures/plage.jpg" :alt="$t('plage')">
						</button>
						<button type="button" :title="$t('lac')" :aria-label="$t('lac')" @click="modifierFond('./static/img/lac.jpg')">
							<img src="@/assets/img/miniatures/lac.jpg" :alt="$t('lac')">
						</button>
						<button type="button" :title="$t('feuilles')" :aria-label="$t('feuilles')" @click="modifierFond('./static/img/feuilles.jpg')">
							<img src="@/assets/img/miniatures/feuilles.jpg" :alt="$t('feuilles')">
						</button>
						<button type="button" :title="$t('arbre')" :aria-label="$t('arbre')" @click="modifierFond('./static/img/arbre.jpg')">
							<img src="@/assets/img/miniatures/arbre.jpg" :alt="$t('arbre')">
						</button>
						<button type="button" :title="$t('auroresBoreales')" :aria-label="$t('auroresBoreales')" @click="modifierFond('./static/img/aurore.jpg')">
							<img src="@/assets/img/miniatures/aurore.jpg" :alt="$t('auroresBoreales')">
						</button>
						<button type="button" :title="$t('points')" :aria-label="$t('points')" @click="modifierFond('./static/img/points.png')">
							<img src="@/assets/img/miniatures/points.png" :alt="$t('points')" style="border: 1px solid #ddd;">
						</button>
						<button type="button" :title="$t('lignesHorizontales')" :aria-label="$t('lignesHorizontales')" @click="modifierFond('./static/img/lignes-horizontales.png')">
							<img src="@/assets/img/miniatures/lignes-horizontales.png" :alt="$t('lignesHorizontales')" style="border: 1px solid #ddd;">
						</button>
						<button type="button" title="Seyes" aria-label="Seyes" @click="modifierFond('./static/img/seyes.png')">
							<img src="@/assets/img/miniatures/seyes.png" alt="Seyes" style="border: 1px solid #ddd;">
						</button>
						<button type="button" :title="$t('lineaturHaeuschen')" :aria-label="$t('lineaturHaeuschen')" @click="modifierFond('./static/img/lineatur-haeuschen.svg')">
							<img src="@/assets/img/miniatures/lineatur-haeuschen.png" :alt="$t('lineaturHaeuschen')" style="border: 1px solid #ddd;">
						</button>
						<button type="button" :title="$t('lineaturHaeuschenGross')" :aria-label="$t('lineaturHaeuschenGross')" @click="modifierFond('./static/img/lineatur-haeuschen-gross.svg')">
							<img src="@/assets/img/miniatures/lineatur-haeuschen-gross.png" :alt="$t('lineaturHaeuschenGross')" style="border: 1px solid #ddd;">
						</button>
						<button type="button" :title="$t('quadrillage')" :aria-label="$t('quadrillage')" @click="modifierFond('./static/img/quadrillage.png')">
							<img src="@/assets/img/miniatures/quadrillage.png" :alt="$t('quadrillage')" style="border: 1px solid #ddd;">
						</button>
						<button type="button" :title="$t('quadrillageGrand')" :aria-label="$t('quadrillageGrand')" @click="modifierFond('./static/img/quadrillage-grand.png')">
							<img src="@/assets/img/miniatures/quadrillage-grand.png" :alt="$t('quadrillageGrand')" style="border: 1px solid #ddd;">
						</button>
						<button type="button" :title="$t('quadrillageGris')" :aria-label="$t('quadrillageGris')" @click="modifierFond('./static/img/quadrillage-gris.png')">
							<img src="@/assets/img/miniatures/quadrillage-gris.png" :alt="$t('quadrillageGris')" style="border: 1px solid #ddd;">
						</button>
						<button type="button" :title="$t('quadrillageGrisGrand')" :aria-label="$t('quadrillageGrisGrand')" @click="modifierFond('./static/img/quadrillage-gris-grand.png')">
							<img src="@/assets/img/miniatures/quadrillage-gris-grand.png" :alt="$t('quadrillageGrisGrand')" style="border: 1px solid #ddd;">
						</button>
						<button type="button" :title="$t('partition')" :aria-label="$t('partition')" @click="modifierFond('./static/img/partition.png')">
							<img src="@/assets/img/miniatures/partition.png" :alt="$t('partition')" style="border: 1px solid #ddd;">
						</button>
						<button type="button" class="couleur-fond" :title="$t('turquoise')" :aria-label="$t('turquoise')" @click="modifierFond('#00ced1')" style="background-color: #00ced1;" ></button>
						<button type="button" class="couleur-fond" :title="$t('rouge')" :aria-label="$t('rouge')" @click="modifierFond('#ff2d55')" style="background-color: #ff2d55;" ></button>
						<button type="button" class="couleur-fond" :title="$t('jaune')" :aria-label="$t('jaune')" @click="modifierFond('#f7d000')" style="background-color: #f7d000;" ></button>
						<button type="button" class="couleur-fond" :title="$t('blanc')" :aria-label="$t('blanc')" @click="modifierFond('#ffffff')" style="background-color: #ffffff; border: 1px solid #ddd;" ></button>
						<span class="couleur-fond icone">
							<span role="button" tabindex="0" :title="$t('selectionnerCouleur')" :aria-label="$t('selectionnerCouleur')" @keydown.enter.space.prevent="activerInput('couleur-fond-page')" @click="activerInput('couleur-fond-page')"><i class="material-icons" aria-hidden="true">colorize</i></span>
							<input id="couleur-fond-page" type="color" value="#001d1d">
						</span>
					</div>

					<div class="recherche">
						<div class="rechercher" :role="pixabayAPIKey !== '' ? 'search' : null" :aria-label="pixabayAPIKey !== '' ? $t('rechercherImagePixabay') : null">
							<input type="text" :aria-label="pixabayAPIKey !== '' ? $t('lienImageRecherche') : $t('lienImage')" :value="requete" @input="requete = $event.target.value" @keyup="verifierRequete" @keydown.enter="valider" :placeholder="pixabayAPIKey !== '' ? $t('lienImageRecherche') : $t('lienImage')">
							<button type="button" class="bouton-secondaire" :title="$t('rechercher')" :aria-label="$t('rechercher')" @click="valider" v-if="pixabayAPIKey !== ''"><i class="material-icons" aria-hidden="true">search</i></button>
							<button type="button" class="bouton-secondaire" :title="$t('valider')" :aria-label="$t('valider')" @click="valider" v-else><i class="material-icons" aria-hidden="true">check</i></button>
							<span role="button" class="bouton-secondaire" tabindex="0" :title="$t('selectionnerImage')" :aria-label="$t('selectionnerImage')" @keydown.enter.space.prevent="activerInput('televerser-fond')" @click="activerInput('televerser-fond')"><i class="material-icons" aria-hidden="true">upload_file</i></span>
							<input id="televerser-fond" type="file" @change="televerserImage" style="display: none" accept=".jpg, .jpeg, .png, .gif">
						</div>
						<div class="resultats" v-if="Object.keys(resultats).length > 0">
							<button type="button" class="item" :title="$t('selectionnerImageRecherche', { image: image.id })" :aria-label="$t('selectionnerImageRecherche', { image: image.id })" :data-w="image.previewWidth" :data-h="image.previewHeight" v-for="(image, index) in resultats.hits" @click="modifierFond(image.previewURL.replace('_150', '_1280'))" :key="'image_' + index">
								<img :src="image.previewURL" :alt="'Image_' + index">
							</button>
						</div>
						<div class="navigation" v-if="Object.keys(resultats).length > 0 && (pageResultats > 1 || pageResultats < (resultats.total / 15))">
							<button type="button" :class="{'invisible': pageResultats < 2}" @click="modifierPageResultats('precedente')">{{ $t('pagePrecedente') }}</button>
							<button type="button" :class="{'invisible': pageResultats >= (resultats.total / 15)}" @click="modifierPageResultats('suivante')">{{ $t('pageSuivante') }}</button>
						</div>
					</div>

					<label for="fonte">{{ $t('fonte') }}</label>
					<select id="fonte" :value="app.fonte" @change="modifierFonte">
						<option value="">{{ $t('fonteSysteme') }}</option>
						<option value="Andika">Druckschrift (Andika)</option>
						<option value="Playwrite DE Grund">Grundschrift (Playwrite DE Grund)</option>
						<option value="Luciole">Luciole</option>
						<option value="InclusiveSans">Inclusive Sans</option>
						<option value="MonaSans">Mona Sans</option>
						<option value="RobotoSerif">Roboto Serif</option>
						<option value="RobotoMono">Roboto Mono</option>
					</select>

					<label class="actions-pages">
						<span>{{ $t('pages') }}</span>
						<button type="button" class="bouton-secondaire" :class="{'desactive': app.pages.length === 1}" :title="$t('supprimerPage')" :aria-label="$t('supprimerPage')" @click="afficherSupprimerPage"><i class="material-icons" aria-hidden="true">remove_circle_outline</i></button>
						<button type="button" class="bouton-secondaire" :class="{'desactive': app.pages.length > 13}" :title="$t('dupliquerPage')" :aria-label="$t('dupliquerPage')" @click="dupliquerPage"><i class="material-icons" aria-hidden="true">content_copy</i></button>
						<button type="button" class="bouton-secondaire" :class="{'desactive': app.pages.length > 13}" :title="$t('ajouterPage')" :aria-label="$t('ajouterPage')" @click="ajouterPage"><i class="material-icons" aria-hidden="true">add_circle_outline</i></button>
						<button type="button" class="bouton-secondaire" :class="{'desactive': app.page === 1}" :aria-disabled="app.page === 1 ? 'true' : 'false'" :title="$t('deplacerAvant')" :aria-label="$t('libelleCible', { action: $t('deplacerAvant'), cible: $t('page') + ' ' + app.page })" @click="deplacerPage(-1)"><i class="material-icons" aria-hidden="true">arrow_back</i></button>
						<button type="button" class="bouton-secondaire" :class="{'desactive': app.page === app.pages.length}" :aria-disabled="app.page === app.pages.length ? 'true' : 'false'" :title="$t('deplacerApres')" :aria-label="$t('libelleCible', { action: $t('deplacerApres'), cible: $t('page') + ' ' + app.page })" @click="deplacerPage(1)"><i class="material-icons" aria-hidden="true">arrow_forward</i></button>
					</label>
					<div class="pages">
						<draggable v-model="app.pages" @sort="verifierPages">
							<button type="button" class="page" :title="$t('page') + ' ' + (indexPage + 1)" :aria-label="$t('page') + ' ' + (indexPage + 1)" :aria-current="app.page === indexPage + 1 ? 'page' : null" :class="{'selectionne': app.page === indexPage + 1}" @click="afficherPage(indexPage + 1)" v-for="(page, indexPage) in app.pages" :key="'page_' + indexPage">{{ indexPage + 1 }}</button>
						</draggable>
					</div>

					<label id="libelle-parametres-2" v-if="admin">{{ $t('enregistrer') }}</label>
					<button aria-describedby="libelle-parametres-2" type="button" class="bouton" @click="enregistrer" v-if="admin">{{ $t('enregistrer') }}</button>
					<label id="libelle-parametres-3">{{ $t('exporter') }}</label>
					<button aria-describedby="libelle-parametres-3" type="button" class="bouton" @click="exporter('pages')" v-if="app.pages.length === 1">{{ $t('exporterEcran') }}</button>
					<template v-else>
						<button type="button" class="bouton" @click="exporter('page')">{{ $t('exporterPage') }}</button>
						<button type="button" class="bouton" @click="exporter('pages')">{{ $t('exporterPages') }}</button>
					</template>
					<button type="button" class="bouton" @click="exporter('pages', 'html')" v-if="!app.lecteur">{{ $t('exporterHtml') }}</button>
					<label id="libelle-parametres-4">{{ $t('importer') }}</label>
					<span aria-describedby="libelle-parametres-4" role="button" class="bouton" tabindex="0" @keydown.enter.space.prevent="activerInput('televerser')" @click="activerInput('televerser')">{{ $t('importerEcran') }}</span>
					<input id="televerser" type="file" style="display: none;" accept=".dgb, .dgs" @change="importer">
					<label for="lien-dgs" v-if="!app.lecteur">{{ $t('importerLien') }}</label>
					<small id="services-lien-dgs" class="services-lien-dgs" v-if="!app.lecteur">{{ $t('servicesLienDgs') }}</small>
					<div class="rechercher lien-dgs" v-if="!app.lecteur">
						<input id="lien-dgs" type="text" inputmode="url" aria-describedby="services-lien-dgs" :value="lienDgs" @input="lienDgs = $event.target.value" @keydown.enter="ouvrirLienDgs" :placeholder="$t('lienFichierDgs')">
						<button type="button" class="bouton-secondaire" :title="$t('ouvrirLienDgs')" :aria-label="$t('ouvrirLienDgs')" @click="ouvrirLienDgs"><i class="material-icons" aria-hidden="true">cloud_download</i></button>
					</div>

					<label>{{ $t('modules') }}</label>
					<div class="modules" role="group" :aria-label="$t('activerDesactiverModules')">
						<div class="filtres-modules">
							<div class="champ-recherche-modules">
								<input ref="rechercheModules" type="search" :value="filtreModules" @input="filtreModules = $event.target.value" @keydown.esc="gererEchapRechercheModules" :placeholder="$t('rechercherModule')" :aria-label="$t('rechercherModule')">
								<button type="button" class="reinitialiser-recherche" :title="$t('reinitialiser')" :aria-label="$t('reinitialiser')" @click="reinitialiserFiltreModules" v-show="filtreModules !== ''"><i class="material-icons" aria-hidden="true">close</i></button>
							</div>
							<label class="masquer-modules-actives">
								<input type="checkbox" :checked="masquerModulesActives" @change="masquerModulesActives = $event.target.checked">
								<span>{{ $t('masquerModulesActives') }}</span>
							</label>
						</div>
						<div class="module" v-for="module in modulesFiltres" :key="module.valeur">
							<span>{{ definirLibelleModule(module) }}</span>
							<label class="interrupteur">
								<input :id="module.id" type="checkbox" role="switch" :aria-label="definirLibelleModule(module)" :value="module.valeur" :checked="app.modules.includes(module.valeur)" @change="modifierModule">
								<span class="curseur" />
							</label>
						</div>
						<p class="aucun-module" role="status">{{ messageModules }}</p>
					</div>
				</div>
			</div>
		</div>

		<div id="confirmation" class="conteneur-modale" v-if="confirmation">
			<div class="modale" role="alertdialog" aria-modal="true" aria-labelledby="texte-confirmation-suppression-page">
				<div class="conteneur">
					<div class="contenu">
						<p id="texte-confirmation-suppression-page" v-html="$t('confirmationSuppressionPage', { page: app.page })" />
						<div class="actions">
							<button type="button" class="bouton" @click="annulerSupprimerPage">{{ $t('annuler') }}</button>
							<button type="button" class="bouton" @click="supprimerPage">{{ $t('valider') }}</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { VueDraggableNext } from 'vue-draggable-next'
import imagesLoaded from 'imagesloaded'

const listeModules = Object.freeze([
	{ id: 'module_codeqr', valeur: 'codeqr', cle: 'codeqr' },
	{ id: 'module_texte', valeur: 'texte', cle: 'texte' },
	{ id: 'module_seyes', valeur: 'seyes', texte: 'Seyes' },
	{ id: 'module_tableau', valeur: 'tableau', cle: 'tableau' },
	{ id: 'module_image', valeur: 'image', cle: 'image' },
	{ id: 'module_galerie', valeur: 'galerie', cle: 'galerieImages' },
	{ id: 'module_dessin', valeur: 'dessin', cle: 'dessin' },
	{ id: 'module_document', valeur: 'document', cle: 'document' },
	{ id: 'module_audio', valeur: 'audio', cle: 'audio' },
	{ id: 'module_enregistrement', valeur: 'enregistrement', cle: 'enregistrementAudio' },
	{ id: 'module_synthese', valeur: 'synthese', cle: 'syntheseVocale' },
	{ id: 'module_video', valeur: 'video', cle: 'video' },
	{ id: 'module_webcam', valeur: 'webcam', cle: 'webcam' },
	{ id: 'module_partage_ecran', valeur: 'partage-ecran', cle: 'partageEcran' },
	{ id: 'module_lien', valeur: 'lien', cle: 'lien' },
	{ id: 'module_iframe', valeur: 'iframe', cle: 'contenuIntegre' },
	{ id: 'module_html', valeur: 'html', cle: 'html' },
	{ id: 'module_liste', valeur: 'liste', cle: 'liste' },
	{ id: 'module_nuage', valeur: 'nuage', cle: 'nuageMots' },
	{ id: 'module_ordre', valeur: 'ordre', cle: 'remiseOrdre' },
	{ id: 'module_images-sequentielles', valeur: 'images-sequentielles', cle: 'imagesSequentielles' },
	{ id: 'module_trous', valeur: 'trous', cle: 'texteATrous' },
	{ id: 'module_surlignage', valeur: 'surlignage', cle: 'surlignage' },
	{ id: 'module_mot-mystere', valeur: 'mot-mystere', cle: 'motMystere' },
	{ id: 'module_cartes', valeur: 'cartes', cle: 'cartes' },
	{ id: 'module_appariement', valeur: 'appariement', cle: 'appariement' },
	{ id: 'module_categories', valeur: 'categories', cle: 'categories' },
	{ id: 'module_tirage-texte', valeur: 'tirage-texte', cle: 'tirageSortTexte' },
	{ id: 'module_tirage-nombre', valeur: 'tirage-nombre', cle: 'tirageSortNombre' },
	{ id: 'module_tirage-image', valeur: 'tirage-image', cle: 'tirageSortImage' },
	{ id: 'module_tirage-audio', valeur: 'tirage-audio', cle: 'tirageSortAudio' },
	{ id: 'module_roue', valeur: 'roue', cle: 'roue' },
	{ id: 'module_histoire', valeur: 'histoire', cle: 'histoire' },
	{ id: 'module_plateau', valeur: 'plateau', cle: 'plateauJeu' },
	{ id: 'module_des', valeur: 'des', cle: 'des' },
	{ id: 'module_classement', valeur: 'classement', cle: 'classement' },
	{ id: 'module_feu', valeur: 'feu', cle: 'feuQuadricolore' },
	{ id: 'module_modalites', valeur: 'modalites', cle: 'modalitesTravail' },
	{ id: 'module_groupes', valeur: 'groupes', cle: 'groupes' },
	{ id: 'module_humeur', valeur: 'humeur', cle: 'meteoHumeur' },
	{ id: 'module_chrono', valeur: 'chrono', cle: 'chronometre' },
	{ id: 'module_rebours', valeur: 'rebours', cle: 'compteRebours' },
	{ id: 'module_sablier', valeur: 'sablier', cle: 'sablier' },
	{ id: 'module_horloge_modulable', valeur: 'horloge-modulable', cle: 'horlogeModulable' },
	{ id: 'module_horloge', valeur: 'horloge', cle: 'horloge' },
	{ id: 'module_calendrier', valeur: 'calendrier', cle: 'calendrier' },
	{ id: 'module_sonometre', valeur: 'sonometre', cle: 'sonometre' },
	{ id: 'module_retroaction', valeur: 'retroaction', cle: 'retroaction' },
	{ id: 'module_grille', valeur: 'grille', cle: 'grille' }
])

export default {
	name: 'MParametres',
	inject: ['app'],
	components: {
		draggable: VueDraggableNext
	},
	props: {
		admin: { type: Boolean, required: true }
	},
	data () {
		return {
			ouvert: false,
			image: '',
			pixabayAPIKey: '',
			requete: '',
			resultats: {},
			pageResultats: 1,
			confirmation: false,
			lienDgs: '',
			filtreModules: '',
			masquerModulesActives: false
		}
	},
	computed: {
		modulesFiltres () {
			const filtre = this.normaliser(this.filtreModules.trim())
			return listeModules.filter((module) => {
				if (this.masquerModulesActives && this.app.modules.includes(module.valeur)) {
					return false
				}
				return filtre === '' || this.normaliser(this.definirLibelleModule(module)).includes(filtre) || module.valeur.includes(filtre)
			})
		},
		messageModules () {
			if (this.modulesFiltres.length > 0) {
				return ''
			} else if (this.filtreModules.trim() === '' && this.masquerModulesActives) {
				return this.$t('tousModulesActives')
			}
			return this.$t('aucunModuleTrouve')
		}
	},
	watch: {
		pageResultats (page) {
			this.rechercher(page)
		}
	},
	created () {
		if (import.meta.env.VITE_PIXABAY_API_KEY) {
			this.pixabayAPIKey = import.meta.env.VITE_PIXABAY_API_KEY
		}
	},
	mounted () {
		setTimeout(() => {
			this.ouvert = true
			setTimeout(() => {
				document.querySelector('#menu-parametres .fermer')?.focus()
			}, 150)
		}, 10)
		document.querySelector('#couleur-fond-page')?.addEventListener('change', this.modifierCouleurFond)
		document.querySelector('#conteneur-menu')?.addEventListener('click', this.fermer)
	},
	beforeUnmount () {
		document.querySelector('#couleur-fond-page')?.removeEventListener('change', this.modifierCouleurFond)
		document.querySelector('#conteneur-menu')?.removeEventListener('click', this.fermer)
	},
	methods: {
		modifierLangue (langue) {
			this.$i18n.locale = langue
			this.app.langue = langue
			this.app.notification = { type: 'succes', message: this.$t('langueModifiee') }
			document.getElementsByTagName('html')[0].setAttribute('lang', langue)
			localStorage.setItem('digiscreen_lang', langue)
		},
		activerInput (id) {
			document.querySelector('#' + id)?.click()
		},
		modifierFond (fond) {
			const index = this.app.page - 1
			this.app.pages[index].fond = fond
			this.app.notification = { type: 'succes', message: this.$t('arrierePlanModifie') }
		},
		modifierCouleurFond (event) {
			this.modifierFond(event.target.value)
		},
		valider () {
			if (this.requete !== '' && this.verifierURL(this.requete) === true) {
				this.modifierFond(this.requete)
			} else if (this.requete !== '' && this.pixabayAPIKey !== '') {
				this.rechercher(1)
			}
		},
		rechercher (page) {
			if (this.requete !== '') {
				const requete = encodeURIComponent(this.requete.trim())
				const xhr = new XMLHttpRequest()
				xhr.onload = () => {
					if (xhr.status === 200) {
						try {
							const donnees = JSON.parse(xhr.responseText)
							if (donnees && donnees.total > 0) {
								this.resultats = donnees
								this.$nextTick(() => {
									new flexImages({ selector: '.resultats', rowHeight: this.convertirRem(6.5) })
								})
							}
						} catch {
							this.resultats = {}
						}
					}
				}
				if (page === 1) {
					this.pageResultats = page
				}
				xhr.open('GET', 'https://pixabay.com/api/?key=' + this.pixabayAPIKey + '&q=' + requete + '&image_type=photo&lang=fr&orientation=horizontal&safesearch=true&per_page=15&page=' + page, true)
				xhr.send()
			}
		},
		modifierPageResultats (type) {
			if (type === 'suivante' && this.pageResultats < (this.resultats.total / 15)) {
				this.pageResultats++
			} else if (type === 'precedente' && this.pageResultats > 1) {
				this.pageResultats--
			}
		},
		verifierRequete () {
			if (this.requete === '') {
				this.resultats = {}
				this.pageResultats = 1
			}
		},
		televerserImage (event) {
			const fichier = event.target.files[0]
			if (fichier) {
				const reader = new FileReader()
				reader.readAsDataURL(fichier)
				reader.onloadend = (e) => {
					const img = new Image()
					img.src = e.target.result
					img.onload = () => {
						if (img.width > 1920) {
							const canvas = document.createElement('canvas')
							const ratio = img.width / img.height
							const largeur = 1920
							const hauteur = 1920 / ratio
							canvas.width = largeur
							canvas.height = hauteur
							canvas.getContext('2d').drawImage(img, 0, 0, largeur, hauteur)
							this.modifierFond(canvas.toDataURL('image/jpeg', 0.85))
						} else {
							this.modifierFond(e.target.result)
						}
					}
				}
			}
		},
		modifierFonte (event) {
			const fonte = event.target.value
			this.app.fonte = fonte
			this.app.notification = { type: 'succes', message: this.$t('fonteModifiee') }
			localStorage.setItem('digiscreen_fonte', fonte)
		},
		ajouterPage () {
			let index = this.app.pages.length
			if (index < 14) {
				index++
				let fond = ''
				switch (index) {
				case 2:
				case 9:
					fond = './static/img/lavande.jpg'
					break
				case 3:
				case 10:
					fond = './static/img/plage.jpg'
					break
				case 4:
				case 11:
					fond = './static/img/lac.jpg'
					break
				case 5:
				case 12:
					fond = './static/img/arbre.jpg'
					break
				case 6:
				case 13:
					fond = './static/img/aurore.jpg'
					break
				case 7:
				case 14:
					fond = './static/img/feuilles.jpg'
					break
				case 8:
					fond = './static/img/digitale.jpg'
					break
				}
				this.app.pages.push({ fond: fond, grille: {}, annotations: {}, annotation: false })
			}
		},
		dupliquerPage () {
			if (this.app.pages.length < 14) {
				this.app.dupliquerPage()
			}
		},
		afficherPage (page) {
			this.app.page = page
		},
		annoncer (texte) {
			const statut = document.querySelector('#statut')
			if (!statut) return
			statut.textContent = ''
			setTimeout(() => {
				statut.textContent = texte
			}, 150)
		},
		deplacerPage (direction) {
			const index = this.app.page - 1
			const cible = index + direction
			if (cible < 0 || cible > this.app.pages.length - 1) return
			const pages = [...this.app.pages]
			const page = pages.splice(index, 1)[0]
			pages.splice(cible, 0, page)
			this.app.pages = pages
			this.verifierPages({ oldIndex: index, newIndex: cible })
			this.annoncer(this.$t('elementDeplace', { position: cible + 1 }))
		},
		verifierPages (event) {
			const panneaux = this.app.panneaux
			if (event.newIndex < event.oldIndex) {
				panneaux.forEach((panneau, indexPanneau) => {
					if (panneau.page === event.oldIndex + 1) {
						panneaux[indexPanneau].page = event.newIndex + 1
					} else if (panneau.page >= event.newIndex + 1 && panneau.page <= event.oldIndex + 1) {
						panneaux[indexPanneau].page = panneau.page + 1
					}
				})
			} else {
				panneaux.forEach((panneau, indexPanneau) => {
					if (panneau.page === event.oldIndex + 1) {
						panneaux[indexPanneau].page = event.newIndex + 1
					} else if (panneau.page >= event.oldIndex + 1 && panneau.page <= event.newIndex + 1) {
						panneaux[indexPanneau].page = panneau.page - 1
					}
				})
			}
			this.app.panneaux = panneaux
			if (this.app.page === event.oldIndex + 1) {
				this.app.page = event.newIndex + 1
			} else if (this.app.page === event.newIndex + 1) {
				this.app.chargementPage = true
				if (this.app.pages[this.app.page - 1].annotation === false) {
					this.app.annotation = false
				} else {
					this.app.annotation = true
				}
				this.app.retroaction = false
				this.app.modalites = false
				this.app.panneauxPage.forEach((panneau) => {
					document.querySelector('#' + panneau.id)?.close()
				})
				const panneauxPage = panneaux.filter((element) => element.page === event.newIndex + 1)
				imagesLoaded('main', { background: true }, () => {
					this.app.panneauxPage = []
					setTimeout(() => {
						this.app.panneauxPage.push(...panneauxPage)
						for (let i = 0; i < this.app.panneauxPage.length; i++) {
							if (this.app.panneauxPage[i].type === 'retroaction') {
								this.app.retroaction = true
							}
							if (this.app.panneauxPage[i].type === 'modalites') {
								this.app.modalites = true
							}
						}
						imagesLoaded('main', { background: true }, () => {
							this.app.chargementPage = false
						})
					}, 150)
				})
			}
		},
		afficherSupprimerPage () {
			if (this.app.pages.length > 1) {
				this.confirmation = true
			}
		},
		annulerSupprimerPage (event) {
			event.preventDefault()
			event.stopPropagation()
			this.confirmation = false
			this.$nextTick(() => {
				document.querySelector('#menu-parametres .actions-pages .bouton-secondaire')?.focus()
			})
		},
		supprimerPage () {
			this.confirmation = false
			const index = this.app.page - 1
			const pages = this.app.pages.length
			this.app.pages.splice(index, 1)
			const panneaux = this.app.panneaux.filter((element) => element.page !== this.app.page)
			panneaux.forEach((panneau) => {
				if (panneau.page > this.app.page) {
					panneau.page = panneau.page - 1
				}
			})
			this.app.panneaux = panneaux
			if (index + 1 < pages) {
				this.app.chargementPage = true
				this.app.page = index + 1
				if (this.app.pages[this.app.page - 1].annotation === false) {
					this.app.annotation = false
				} else {
					this.app.annotation = true
				}
				this.app.retroaction = false
				this.app.modalites = false
				this.app.panneauxPage.forEach((panneau) => {
					document.querySelector('#' + panneau.id)?.close()
				})
				const panneauxPage = panneaux.filter((element) => element.page === index + 1)
				this.app.notification = { type: 'succes', message: this.$t('pageSupprimee') }
				imagesLoaded('main', { background: true }, () => {
					this.app.panneauxPage = []
					setTimeout(() => {
						this.app.panneauxPage.push(...panneauxPage)
						for (let i = 0; i < this.app.panneauxPage.length; i++) {
							if (this.app.panneauxPage[i].type === 'retroaction') {
								this.app.retroaction = true
							}
							if (this.app.panneauxPage[i].type === 'modalites') {
								this.app.modalites = true
							}
						}
						imagesLoaded('main', { background: true }, () => {
							if (this.app.panneauxPage.length > 0) {
								document.querySelector('#' + this.app.panneauxPage[0].id).front()
								this.$nextTick(() => {
									document.querySelector('#' + this.app.panneauxPage[0].id)?.focus()
								})
							}/* else if (this.app.nav) {
								document.querySelector('nav div')?.focus()
							} else if (!this.app.nav && !this.app.lectureSeule) {
								document.querySelector('span.nav')?.focus()
							}*/
							this.app.chargementPage = false
						})
					}, 150)
				})
			} else {
				this.app.page = index
			}
		},
		importer (event) {
			this.app.importer(event)
			this.app.fermerMenu()
		},
		ouvrirLienDgs () {
			const lien = this.lienDgs.trim()
			let url
			try {
				url = new URL(lien)
			} catch {
				url = null
			}
			if (!url || (url.protocol !== 'https:' && url.protocol !== 'http:')) {
				this.app.notification = { type: 'erreur', message: this.$t('lienInvalide') }
				return
			}
			const parametres = new URLSearchParams()
			parametres.set('dgs', lien)
			window.location.href = window.location.href.split('?')[0] + '?' + parametres
		},
		exporter (nb, format) {
			this.app.exporter(nb, format)
			this.app.fermerMenu()
		},
		enregistrer () {
			this.app.enregistrer()
			this.app.fermerMenu()
		},
		definirLibelleModule (module) {
			return module.cle ? this.$t(module.cle) : module.texte
		},
		gererEchapRechercheModules (event) {
			if (this.filtreModules !== '') {
				event.stopPropagation()
				this.reinitialiserFiltreModules()
			}
		},
		reinitialiserFiltreModules () {
			this.filtreModules = ''
			this.$refs.rechercheModules?.focus()
		},
		normaliser (texte) {
			return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
		},
		modifierModule (event) {
			const interrupteurs = Array.from(document.querySelectorAll('#menu-parametres .modules .module input'))
			const index = interrupteurs.indexOf(event.target)
			const ligneMasquee = this.masquerModulesActives && event.target.checked
			this.app.modifierModule(event)
			if (ligneMasquee) {
				this.$nextTick(() => {
					const restants = document.querySelectorAll('#menu-parametres .modules .module input')
					if (restants.length > 0) {
						restants[Math.min(index, restants.length - 1)].focus()
					} else {
						this.$refs.rechercheModules?.focus()
					}
				})
			}
		},
		fermer (event) {
			if (event.target.isConnected && !document.querySelector('#menu-parametres').contains(event.target)) {
				this.app.fermerMenu()
			}
		},
		gererClavierParametres (event) {
			if (event.key === 'Escape') {
				this.app.fermerMenu()
			} else if (event.key === 'Tab') {
				const menu = document.querySelector('#menu-parametres')
				this.app.piegerFocus(event, menu)
			}
		},
		convertirRem (valeur) {
			const taille = window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size')
			return typeof valeur !== 'undefined' && valeur > 0 ? parseFloat(taille) * valeur : parseFloat(taille)
		},
		verifierURL (lien) {
			let url
			try {
				url = new URL(lien)
			} catch {
				return false
			}
			return url.protocol === 'http:' || url.protocol === 'https:'
		}
	}
}
</script>

<style>
#conteneur-menu {
	cursor: pointer;
}

#menu-parametres {
	cursor: default;
}

.menu #fonte,
.menu .langue,
.menu .recherche {
	margin-bottom: 2rem;
}

.menu .pages {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	margin-bottom: 1rem;
}

.menu .pages button,
.menu .langue button {
	display: inline-flex;
	width: 4rem;
	height: 4rem;
	justify-content: center;
	align-items: center;
	line-height: 1;
	font-size: 1.8rem;
	border-radius: 50%;
	margin-right: 1rem;
	border: 1px solid #ddd;
	cursor: pointer;
	user-select: none;
}

.menu .pages button {
	margin-bottom: 1rem;
}

.menu .pages button.selectionne,
.menu .langue button.selectionne {
	background: #444;
	color: #fff;
	border: 1px solid #222;
}

.menu label.actions-pages {
	display: flex!important;
	align-items: center;
}

.menu .actions-pages .bouton-secondaire {
	font-size: 3rem!important;
	font-weight: 400!important;
	width: 3rem!important;
	height: 3rem!important;
	margin-left: 1.5rem;
}

.menu .actions-pages .bouton-secondaire i {
	line-height: 3rem!important;
}

.menu .actions-pages .bouton-secondaire.desactive:hover,
.menu .actions-pages .bouton-secondaire.desactive {
	color: #aaa;
	cursor: default;
	opacity: 1;
}

.menu .fond {
	display: flex;
	justify-content: flex-start;
	flex-wrap: wrap;
	margin-bottom: 1rem;
}

.menu .fond button,
.menu .fond span {
	margin-right: 1rem;
	margin-bottom: 1rem;
	cursor: pointer;
}

.menu .fond button.couleur-fond {
	width: 4.5rem;
	height: 4.5rem;
	border-radius: 50%;
}

.menu .fond button img {
	width: 4.5rem;
	height: 4.5rem;
	font-size: 0;
	line-height: 1;
	border-radius: 50%;
	user-select: none;
}

.menu .fond span.couleur-fond.icone {
	display: flex;
	align-items: center;
	width: 10rem;
	height: 4.5rem;
}

.menu .fond span span:where([role="button"]) {
	font-size: 3.6rem;
	width: 4.5rem;
	text-align: center;
	margin-bottom: 0;
	font-weight: 400;
}

.menu .fond input[type="color"] {
	width: 4.5rem;
	height: 4.5rem;
	border: none;
	margin-left: 1rem;
	border-radius: 0;
	cursor: pointer;
}

.menu .fond input[type="color"]::-moz-color-swatch {
	border: 1px solid #ddd;
	border-radius: 50%;
}

.menu .fond input[type="color"]::-webkit-color-swatch {
	border: 1px solid #ddd;
	border-radius: 50%;
}

.menu .fond input[type="color"]::-webkit-color-swatch-wrapper {
	padding: 0;
}

.menu .fond span:last-child,
.menu .langue button:last-child {
	margin-right: 0;
}

.menu .services-lien-dgs {
	display: block;
	font-size: 1.3rem;
	line-height: 1.4;
	color: #555;
	margin-top: -0.5rem;
	margin-bottom: 1rem;
}

.menu .lien-dgs {
	margin-bottom: 2rem;
}

.menu .rechercher span:where([role="button"]).bouton-secondaire {
	font-size: 3.6rem;
	font-weight: 400;
	margin-bottom: 0;
}

.menu .conteneur .bouton {
	display: inline-block;
	width: 100%;
	margin-top: 0;
	margin-bottom: 2rem;
	text-align: center;
}

.menu .modules {
	width: 100%;
}

.menu .modules .filtres-modules {
	margin-bottom: 2rem;
}

.menu .modules .filtres-modules .champ-recherche-modules {
	position: relative;
	margin-bottom: 1rem;
}

.menu .modules .filtres-modules input[type="search"] {
	width: 100%;
	padding-right: 4.5rem;
}

.menu .modules .filtres-modules input[type="search"]::-webkit-search-cancel-button {
	-webkit-appearance: none;
	appearance: none;
}

.menu .modules .filtres-modules .reinitialiser-recherche {
	position: absolute;
	top: 50%;
	right: 0.5rem;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3.4rem;
	height: 3.4rem;
	padding: 0;
	border: none;
	border-radius: 50%;
	background: transparent;
	color: #555;
	cursor: pointer;
}

.menu .modules .filtres-modules .reinitialiser-recherche:hover,
.menu .modules .filtres-modules .reinitialiser-recherche:focus-visible {
	background-color: #eee;
	color: #001d1d;
}

.menu .modules .filtres-modules .reinitialiser-recherche i {
	font-size: 2.2rem;
}

.menu .modules .filtres-modules .masquer-modules-actives {
	display: flex;
	align-items: center;
	gap: 0.8rem;
	font-size: 1.4rem;
	cursor: pointer;
}

.menu .modules .filtres-modules .masquer-modules-actives input {
	width: 1.8rem;
	height: 1.8rem;
	margin: 0;
	accent-color: #00ced1;
	cursor: pointer;
}

.menu .modules .aucun-module {
	font-size: 1.4rem;
	color: #555;
	margin-bottom: 2rem;
}

.menu .modules .aucun-module:empty {
	margin-bottom: 0;
}

.menu .modules .module {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 2rem;
}

.menu .modules .module .interrupteur {
	position: relative;
	display: inline-block;
	width: 6rem;
	height: 3rem;
}

.menu .modules .module .interrupteur input {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
	margin: 0;
}

.menu .modules .module .interrupteur:has(> input:focus-visible) {
	outline: 2px solid #ed5b00;
	outline-offset: 1px;
}

.menu .modules .module .interrupteur .curseur {
	position: absolute;
	cursor: pointer;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #ddd;
	transition: 0.3s;
}

.menu .modules .module .interrupteur .curseur::before {
	position: absolute;
	content: '';
	height: 2.2rem;
	width: 2.6rem;
	left: 0.4rem;
	bottom: 0.4rem;
	background-color: #fff;
	transition: 0.3s;
}

.menu .modules .module .interrupteur input:checked + .curseur {
	background-color: #00ced1;
}

.menu .modules .module .interrupteur input:focus + .curseur {
	box-shadow: 0 0 1px #00ced1;
}

.menu .modules .module .interrupteur input:checked + .curseur::before {
	transform: translateX(2.6rem);
}
</style>
