<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-tirage-texte">
			<div class="contenu" v-if="mode === 'edition'">
				<label :for="'texte_tirage_' + id">{{ $t('texteTirageTexte') }}</label>
				<span :id="'consigne_' + id" class="consigne" v-html="$t('consigneTirageTexte')" />
				<textarea :id="'texte_tirage_' + id" :aria-describedby="'consigne_' + id" class="tirage" :value="texte" @input="texte = $event.target.value" :placeholder="$t('exempleListe')"></textarea>
				<label :id="'groupe_choix_' + id" class="libelle-option">{{ $t('supprimerItemTirage') }}</label>
				<div class="choix" role="radiogroup" :aria-labelledby="'groupe_choix_' + id">
					<span class="oui">
						<input :id="'choix_oui_' + id" type="radio" :name="'choix_' + id" value="oui" :checked="suppression === 'oui'" @change="suppression = $event.target.value">
						<label :for="'choix_oui_' + id">{{ $t('oui') }}</label>
					</span>
					<span class="non">
						<input :id="'choix_non_' + id" type="radio" :name="'choix_' + id" value="non" :checked="suppression === 'non'" @change="suppression = $event.target.value">
						<label :for="'choix_non_' + id">{{ $t('non') }}</label>
					</span>
				</div>
				<div class="actions edition">
					<span role="button" class="bouton-secondaire" tabindex="0" :title="$t('televerserFichierTxt')" :aria-label="$t('televerserFichierTxt')" @keydown.enter.space.prevent="activerInput('selectionner_txt_' + id)" @click="activerInput('selectionner_txt_' + id)"><i class="material-icons" aria-hidden="true">upload_file</i></span>
					<input :id="'selectionner_txt_' + id" type="file" @change="televerserTxt" style="display: none" accept=".txt">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<div class="contenu" v-else>
				<div class="tirage" aria-hidden="true" :class="{'tirage-en-cours': tirageEnCours, 'plein-ecran': statut === 'max'}">{{ tirage }}</div>
				<div class="actions">
					<button type="button" class="bouton" @click="tirer" v-if="items.length > 1">{{ $t('tirer') }}</button>
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
	name: 'PTirageTexte',
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
			minw: 30,
			minh: 15,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			texte: '',
			items: [],
			tirage: '',
			suppression: 'non',
			tirageEnCours: false
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { texte: this.texte, suppression: this.suppression }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('tirageSortTexte')
		if (this.panneau.contenu !== '') {
			this.texte = this.panneau.contenu.texte
			this.suppression = this.panneau.contenu.suppression
		}
		if (this.mode === 'lecture' && this.texte !== '') {
			this.redimensionnement = true
			this.creer()
		}
		this.genererOptions('tirage-texte')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min' && this.texte === '') {
			setTimeout(() => {
				document.querySelector('#texte_tirage_' + this.id)?.focus()
			}, 0)
		} else if (this.mode === 'lecture' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .actions .bouton')?.focus()
			}, 0)
		}
	},
	methods: {
		generer () {
			const items = this.texte.split(',').map(item => item.trim())
			if (items.length > 1) {
				this.mode = 'lecture'
				this.redimensionnement = true
				if (this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else {
					this.w = 40
					this.h = 30
				}
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				this.$nextTick(() => {
					document.querySelector('#' + this.id + ' .actions .bouton')?.focus()
				})
				this.positionner()
				this.creer()
			}
		},
		creer () {
			let items = this.texte.split(',').map(item => item.trim())
			items = items.filter((item) => item !== '')
			items = items.filter((item, i, ar) => ar.indexOf(item) === i)
			items = this.melanger(items)
			this.items = items
			this.tirage = '✨✨✨'
		},
		tirer () {
			if (this.suppression === 'oui') {
				this.items.forEach((item, index) => {
					if (item === this.tirage) {
						this.items.splice(index, 1)
					}
				})
			}
			let tirage = ''
			const tirageEnCours = setInterval(() => {
				tirage = this.items[Math.floor(Math.random() * this.items.length)]
				this.tirage = tirage
				this.tirageEnCours = true
			}, 5)
			setTimeout(() => {
				clearInterval(tirageEnCours)
				this.tirageEnCours = false
				const statut = document.querySelector('#statut')
				if (statut) statut.textContent = tirage
			}, 1200)
		},
		editer () {
			this.mode = 'edition'
			this.redimensionnement = false
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 46
			this.h = 42
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' textarea')?.focus()
			})
			this.positionner()
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
.panneau .panneau-tirage-texte textarea.tirage {
	height: 15rem;
	max-height: 15rem;
	margin-bottom: 2rem;
}

.panneau .panneau-tirage-texte .oui {
	margin-right: 2.5rem;
}

.panneau .panneau-tirage-texte .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
    margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-tirage-texte div.tirage {
    display: flex;
    justify-content: center;
	flex-wrap: wrap;
	font-size: 5rem;
	font-weight: 400;
	margin-bottom: 2rem;
}

.panneau .panneau-tirage-texte div.tirage.plein-ecran {
	font-size: 7.5rem;
}

.panneau .panneau-tirage-texte div.tirage.tirage-en-cours {
	opacity: 0.25;
}

.panneau .panneau-tirage-texte div.tirage span {
    font-size: 2rem;
	color: orange;
}

.panneau .panneau-tirage-texte .actions.edition {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 2rem;
}

.panneau .panneau-tirage-texte .actions.edition .bouton {
	margin-top: 0;
	margin-left: 2rem;
	margin-right: 0;
}
</style>
