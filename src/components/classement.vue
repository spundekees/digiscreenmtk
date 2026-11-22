<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-classement">
			<div class="contenu" v-if="mode === 'edition'">
				<label :for="'liste_personnes_' + id">{{ $t('listePersonnes') }}</label>
				<span :id="'consigne_' + id" class="consigne" v-html="$t('consigneClassement')" />
				<textarea :id="'liste_personnes_' + id" :aria-describedby="'consigne_' + id" class="classement" :value="texte" @input="texte = $event.target.value" :placeholder="$t('exempleGroupe')"></textarea>
				<label :for="'nombre_points_' + id">{{ $t('nombrePoints') }}</label>
				<input :id="'nombre_points_' + id" type="number" :value="points" :min="1" @input="points = $event.target.value">
				<div class="actions edition">
					<span role="button" class="bouton-secondaire" tabindex="0" :title="$t('televerserFichierTxt')" :aria-label="$t('televerserFichierTxt')" @keydown.enter.space.prevent="activerInput('selectionner_txt_' + id)" @click="activerInput('selectionner_txt_' + id)"><i class="material-icons" aria-hidden="true">upload_file</i></span>
					<input :id="'selectionner_txt_' + id" type="file" @change="televerserTxt" style="display: none" accept=".txt">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<div class="contenu" v-else>
				<div class="classement">
					<div class="personne" v-for="(item, index) in classement" :key="'personne_' + index">
						<div class="titre" tabindex="0" @dblclick="afficherRenommerPersonne(item.personne, item.id)" @keydown.enter="afficherRenommerPersonne(item.personne, item.id)">{{ item.personne }}</div>
						<div class="score">
							<button type="button" class="moins" :title="$t('retirerPoints')" :aria-label="$t('retirerPoints')" @click="retirerPoints(item.id)"><i class="material-icons" aria-hidden="true">remove</i></button>
							<button type="button" class="points" :title="$t('modifierScore')" :aria-label="$t('modifierScore')" @click="modifierScore(item.id)">{{ item.score }}</button>
							<button type="button" class="plus" :title="$t('ajouterPoints')" :aria-label="$t('ajouterPoints')" @click="ajouterPoints(item.id)"><i class="material-icons" aria-hidden="true">add</i></button>
						</div>
					</div>
				</div>
				<div class="actions">
					<button type="button" class="bouton" @click="classer">{{ $t('classer') }}</button>
				</div>
			</div>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'

export default {
	name: 'PClassement',
	components: {
		JsPanel
	},
	props: {
		panneau: { type: Object, required: true },
		pages: { type: Array, required: true },
		nav: { type: Boolean, default: false },
		export: { type: Boolean, default: false },
		evenementClavier: { type: Object, default: () => ({}) }
	},
	extends: Panneau,
	data () {
		return {
			chargement: true,
			options: {},
			mode: 'edition',
			deplacement: false,
			redimensionnement: false,
			titre: '',
			id: '',
			w: 0,
			h: 0,
			x: 0,
			y: 0,
			minw: 32,
			minh: 28,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			texte: '',
			points: 100,
			classement: [],
			personneId: ''
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { texte: this.texte, points: this.points, classement: this.classement }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('classement')
		if (this.panneau.contenu !== '') {
			this.texte = this.panneau.contenu.texte
			this.points = this.panneau.contenu.points
			this.classement = this.panneau.contenu.classement
		}
		if (this.mode === 'lecture') {
			this.redimensionnement = true
		}
		this.genererOptions('classement')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min' && this.texte === '') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' textarea')?.focus()
			}, 0)
		}
	},
	methods: {
		generer () {
			if (this.texte !== '') {
				this.mode = 'lecture'
				this.redimensionnement = true
				let liste = this.texte.split(',').map(item => item.trim())
				liste = liste.filter(item => item !== '')
				liste.forEach((personne) => {
					const id = 'personne-' + Date.now() + Math.random().toString(16).slice(12)
					this.classement.push({ id: id, personne: personne, score: 0 })
				})
				if (this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else {
					this.w = 64
					this.h = 48
				}
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				this.$nextTick(() => {
					document.querySelector('#' + this.id)?.focus()
				})
				this.positionner()
			}
		},
		editer () {
			this.mode = 'edition'
			this.redimensionnement = false
			this.classement = []
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 46
			this.h = 45
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' textarea')?.focus()
			})
			this.positionner()
		},
		ajouterPoints (id) {
			this.classement.forEach((item) => {
				if (item.id === id) {
					const score = item.score + parseInt(this.points)
					item.score = score
				}
			})
		},
		retirerPoints (id) {
			this.classement.forEach((item) => {
				if (item.id === id) {
					const score = item.score - parseInt(this.points)
					item.score = score
				}
			})
		},
		modifierScore (id) {
			this.classement.forEach((item) => {
				if (item.id === id) {
					const score = window.prompt(this.$t('modifierScore'), item.score)
					if (score !== null && isNaN(score) === false) {
						item.score = parseInt(score)
					}
				}
			})
		},
		classer () {
			this.classement.sort((a, b) => {
				const scoreA = a.score
				const scoreB = b.score
				return scoreA < scoreB ? 1 : -1
			})
		},
		afficherRenommerPersonne (nom, id) {
			const div = document.createElement('div')
			div.id = 'conteneur-modale-panneau'
			div.className = 'conteneur-modale'
			const modale = document.createElement('div')
			modale.id = 'modale-panneau'
			modale.className = 'modale'
			modale.setAttribute('role', 'dialog')
			modale.setAttribute('aria-modal', 'true')
			modale.setAttribute('aria-label', this.$t('nouveauNom'))
			const conteneur = document.createElement('div')
			conteneur.className = 'conteneur'
			const contenu = document.createElement('div')
			contenu.className = 'contenu'
			const label = document.createElement('label')
			label.setAttribute('for', 'champ-nouveau-nom')
			label.textContent = this.$t('nouveauNom')
			const input = document.createElement('input')
			input.id = 'champ-nouveau-nom'
			input.type = 'text'
			const actions = document.createElement('div')
			actions.className = 'actions'
			const boutonAnnuler = document.createElement('button')
			boutonAnnuler.type = 'button'
			boutonAnnuler.id = 'annuler'
			boutonAnnuler.className = 'bouton'
			boutonAnnuler.textContent = this.$t('annuler')
			const boutonValider = document.createElement('button')
			boutonValider.type = 'button'
			boutonValider.id = 'valider'
			boutonValider.className = 'bouton'
			boutonValider.textContent = this.$t('valider')
			actions.appendChild(boutonAnnuler)
			actions.appendChild(boutonValider)
			contenu.appendChild(label)
			contenu.appendChild(input)
			contenu.appendChild(actions)
			conteneur.appendChild(contenu)
			modale.appendChild(conteneur)
			div.appendChild(modale)
			this.app.ouvrirModalePanneau(div, () => {
				this.personneId = ''
			})
			input.value = nom
			this.personneId = id
			this.$nextTick(() => {
				document.querySelector('#annuler').addEventListener('click', () => {
					this.app.fermerModalePanneau()
				})
				document.querySelector('#valider').addEventListener('click', () => {
					this.renommerPersonne()
				})
				document.querySelector('#modale-panneau input').addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						this.renommerPersonne()
					}
				})
			})
		},
		renommerPersonne () {
			const nom = document.querySelector('#modale-panneau input').value
			if (nom) {
				this.classement.forEach((item, index) => {
					if (item.id === this.personneId) {
						this.texte = this.texte.replace(item.personne, nom)
						this.classement[index].personne = nom
					}
				})
				this.app.fermerModalePanneau()
			}
		},
		televerserTxt (event) {
			const fichier = event.target.files[0]
			if (fichier) {
				const reader = new FileReader()
				reader.readAsText(fichier)
				reader.onloadend = (e) => {
					this.texte = e.target.result.trim()
					this.$nextTick(() => {
						document.querySelector('#' + this.id + ' textarea')?.focus()
					})
				}
			}
		}
	}
}
</script>

<style>
.panneau .conteneur textarea.classement {
	height: 15rem;
	max-height: 15rem;
	margin-bottom: 2rem;
}

.panneau .conteneur div.classement {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.panneau .conteneur .personne {
    border: 1px solid #ddd;
    width: 28rem;
    padding: 0 1rem 1.5rem;
    margin: 1rem;
    font-size: 1.8rem;
}

.panneau .conteneur .personne .titre {
	padding-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #ddd;
    margin-bottom: 1rem;
    font-weight: 700;
}

.panneau .conteneur .personne .score {
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
}

.panneau .conteneur .personne .moins,
.panneau .conteneur .personne .plus {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	border: 1px solid #ddd;
	width: 4rem;
	height: 4rem;
	cursor: pointer;
	user-select: none;
}

.panneau .conteneur .personne .moins:hover,
.panneau .conteneur .personne .plus:hover,
.panneau .conteneur .personne .moins:active,
.panneau .conteneur .personne .plus:active {
	background-color: #ddd;
}

.panneau .panneau-classement .actions.edition {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 2rem;
}

.panneau .panneau-classement .actions.edition .bouton {
	margin-top: 0;
	margin-left: 2rem;
	margin-right: 0;
}
</style>
