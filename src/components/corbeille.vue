<template>
	<div class="conteneur-modale">
		<div id="modale-corbeille" class="modale" role="dialog" aria-modal="true" :aria-label="$t('corbeille')">
			<header>
				<span class="titre">{{ $t('corbeille') }}</span>
				<button type="button" class="fermer" :title="$t('fermer')" :aria-label="$t('fermer')" @click="app.fermerModale"><i class="material-icons" aria-hidden="true">close</i></button>
			</header>
			<div class="conteneur">
				<div class="contenu">
					<template v-if="app.pages.length === 1 && corbeille.length > 0">
						<div class="item" v-for="(item, index) in corbeille" :key="'panneau_supprime_' + index">
							<span class="titre" v-if="item.titre">{{ item.titre }}</span>
							<span class="titre" v-else>{{ definirTitre(item.type) }}</span>
							<div class="actions">
								<button type="button" :title="$t('restaurer')" :aria-label="$t('restaurer')" @click="restaurerPanneau(item.id, item.page)"><i class="material-icons" aria-hidden="true">history</i></button>
								<button type="button" :title="$t('supprimer')" :aria-label="$t('supprimer')" @click="supprimerPanneau(item.id)"><i class="material-icons" aria-hidden="true">delete</i></button>
							</div>
						</div>
					</template>
					<span class="vide" v-else-if="app.pages.length === 1 && corbeille.length === 0">{{ $t('aucunPanneauSupprime') }}</span>
					<template v-else-if="app.pages.length > 1">
						<div class="panneaux" v-for="page in app.pages.length" :key="'panneaux_' + page">
							<span class="page">{{ $t('page') + ' ' + page }}</span>
							<template v-for="(item, index) in corbeille" :key="'panneau_supprime_' + index">
								<div class="item" v-if="item.page === page">
									<span class="titre" v-if="item.titre">{{ item.titre }}</span>
									<span class="titre" v-else>{{ definirTitre(item.type) }}</span>
									<div class="actions">
										<button type="button" :title="$t('restaurer')" :aria-label="$t('restaurer')" @click="restaurerPanneau(item.id, item.page)"><i class="material-icons" aria-hidden="true">history</i></button>
										<button type="button" :title="$t('supprimer')" :aria-label="$t('supprimer')" @click="supprimerPanneau(item.id)"><i class="material-icons" aria-hidden="true">delete</i></button>
									</div>
								</div>
							</template>
							<span class="vide" v-if="definirPanneauxPage(page) === 0">{{ $t('aucunPanneauSupprime') }}</span>
						</div>
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import imagesLoaded from 'imagesloaded'

export default {
	name: 'MCorbeille',
	inject: ['app'],
	props: {
		corbeille: Array
	},
	emits: {
		retirer: null
	},
	data () {
		return {
			panneaux: ['chrono', 'enregistrement', 'feu', 'galerie', 'horloge-modulable', 'iframe', 'images-sequentielles', 'mot-mystere', 'nuage', 'ordre', 'partage-ecran', 'plateau', 'rebours', 'synthese', 'tirage-audio', 'tirage-image', 'tirage-nombre', 'tirage-texte', 'trous'],
			nomsPanneaux: { chrono: 'chronometre', enregistrement: 'enregistrementAudio', feu: 'feuQuadricolore', galerie: 'galerieImages', 'horloge-modulable': 'horlogeModulable', iframe: 'contenuIntegre', 'images-sequentielles': 'imagesSequentielles', 'mot-mystere': 'motMystere', nuage: 'nuageMots', ordre: 'remiseOrdre', 'partage-ecran': 'partageEcran', plateau: 'plateauJeu', rebours: 'compteRebours', synthese: 'syntheseVocale', 'tirage-audio': 'tirageSortAudio', 'tirage-image': 'tirageSortImage', 'tirage-nombre': 'tirageSortNombre', 'tirage-texte': 'tirageSortTexte', trous: 'texteATrous' },
			elementPrecedent: null
		}
	},
	methods: {
		definirTitre (type) {
			if (type === 'seyes') {
				return 'Seyes'
			} else if (this.panneaux.includes(type)) {
				return this.$t(this.nomsPanneaux[type])
			} else {
				return this.$t(type)
			}
		},
		definirPanneauxPage (page) {
			let panneaux = 0
			this.corbeille.forEach((panneau) => {
				if (panneau.page === page) {
					panneaux++
				}
			})
			return panneaux
		},
		restaurerPanneau (id, page) {
			if (this.app.page === page) {
				this.app.chargementPage = true
				this.corbeille.forEach((panneau) => {
					if (panneau.id === id) {
						this.app.panneaux.push(panneau)
						this.$emit('retirer', id)
					}
				})
				this.app.panneauxPage.forEach((panneau) => {
					if (document.querySelector('#' + panneau.id)) {
						document.querySelector('#' + panneau.id).close()
					}
				})
				this.app.panneauxPage = []
				const panneauxPage = this.app.panneaux.filter((element) => element.page === page)
				imagesLoaded('main', { background: true }, () => {
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
						this.$nextTick(() => {
							if (this.app.lectureSeule === true) {
								const panneaux = document.querySelectorAll('.jsPanel')
								panneaux.forEach((panneau) => {
									if (panneau.querySelector('.jsPanel-btn-close')) {
										panneau.setControlStatus('close', 'hide')
									}
								})
							}
						})
						this.app.chargementPage = false
					}, 150)
				})
			} else {
				this.corbeille.forEach((panneau) => {
					if (panneau.id === id) {
						this.app.panneaux.push(panneau)
						this.$emit('retirer', id)
					}
				})
			}
		},
		supprimerPanneau (id) {
			this.$emit('retirer', id)
		},
		gererFocus () {
			this.$nextTick(() => {
				if (this.elementPrecedent) {
					this.elementPrecedent.focus()
					this.elementPrecedent = null
				}
			})
		}
	}
}
</script>

<style scoped>
#modale-corbeille {
	height: 40rem;
}

.conteneur .item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: 1px solid #ddd;
	padding: 1rem;
	margin-bottom: 1rem;
	border-radius: 5px;
}

.conteneur .item:last-child {
	margin-bottom: 0;
}

.conteneur .titre {
	width: calc(100% - 58px);
	font-size: 16px;
	text-align: left;
}

.conteneur .actions {
	width: 58px;
}

.conteneur .actions button {
	display: inline-block;
	user-select: none;
	cursor: pointer;
}

.conteneur .actions button:first-child {
	margin-right: 10px;
}

.conteneur .actions button i {
	font-size: 24px;
}

.conteneur .page {
	display: block;
	font-size: 14px;
	font-weight: 700;
	text-align: left;
	margin-bottom: 1rem;
	padding-bottom: 1rem;
	border-bottom: 1px dashed #ddd;
}

.conteneur .panneaux {
	margin-bottom: 1rem;
	padding-bottom: 1rem;
	border-bottom: 1px dashed #ddd;
}

.conteneur .vide {
	font-size: 16px;
}
</style>
