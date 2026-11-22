<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-retroaction">
			<div class="contenu">
				<div class="retroactions">
					<button type="button" id="confettis" class="bouton" :disabled="disabled" :title="$t('confettis')" :aria-label="$t('confettis')" @click="ouvrirCarte('applaudissements', 'confettis')" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/retroactions/confettis.svg') + ')' }" ></button>
					<button type="button" id="applaudissements" class="bouton" :disabled="disabled" :title="$t('applaudissements')" :aria-label="$t('applaudissements')" @click="ouvrirCarte('applaudissements', 'applaudissements')" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/retroactions/applaudissements.svg') + ')' }" ></button>
					<button type="button" id="victoire" class="bouton" :disabled="disabled" :title="$t('victoire')" :aria-label="$t('victoire')" @click="ouvrirCarte('victoire', 'victoire')" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/retroactions/victoire.svg') + ')' }" ></button>
					<button type="button" id="dommage" class="bouton" :disabled="disabled" :title="$t('dommage')" :aria-label="$t('dommage')" @click="ouvrirCarte('dommage', 'dommage')" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/retroactions/dommage.svg') + ')' }" ></button>
					<button type="button" id="vrai" class="bouton" :disabled="disabled" :title="$t('vrai')" :aria-label="$t('vrai')" @click="ouvrirCarte('vrai', 'vrai')" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/retroactions/vrai.svg') + ')' }" ></button>
					<button type="button" id="faux" class="bouton" :disabled="disabled" :title="$t('faux')" :aria-label="$t('faux')" @click="ouvrirCarte('faux', 'faux')" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/retroactions/faux.svg') + ')' }" ></button>
					<button type="button" id="pouce-haut" class="bouton" :disabled="disabled" :title="$t('pouceHaut')" :aria-label="$t('pouceHaut')" @click="ouvrirCarte('vrai', 'pouce-haut')" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/retroactions/pouce-haut.svg') + ')' }" ></button>
					<button type="button" id="pouce-bas" class="bouton" :disabled="disabled" :title="$t('pouceBas')" :aria-label="$t('pouceBas')" @click="ouvrirCarte('faux', 'pouce-bas')" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/retroactions/pouce-bas.svg') + ')' }" ></button>
				</div>
				<label :id="'groupe_choix_' + id" class="libelle-option">{{ $t('activerEffetsSonores') }}</label>
				<div class="choix" role="radiogroup" :aria-labelledby="'groupe_choix_' + id">
					<span class="oui">
						<input :id="'son_oui_' + id" type="radio" :name="'son_' + id" value="oui" :checked="son === 'oui'" :disabled="disabled" @change="son = $event.target.value">
						<label :for="'son_oui_' + id">{{ $t('oui') }}</label>
					</span>
					<span class="non">
						<input :id="'son_non_' + id" type="radio" :name="'son_' + id" value="non" :checked="son === 'non'" :disabled="disabled" @change="son = $event.target.value">
						<label :for="'son_non_' + id">{{ $t('non') }}</label>
					</span>
				</div>
			</div>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>

	<div id="carte-confettis" class="conteneur-carte" :class="{'ouvert': carte === 'confettis'}" key="confettis">
		<button type="button" class="carte" :title="$t('fermer')" :aria-label="$t('fermer')" @click="fermerCarte" @keydown.tab.prevent="fermerCarte" @keydown.esc="fermerCarteEsc"><img src="@/assets/img/retroactions/confettis.svg" :alt="$t('confettis')"></button>
	</div>

	<div id="carte-applaudissements" class="conteneur-carte" :class="{'ouvert': carte === 'applaudissements'}" key="applaudissements">
		<button type="button" class="carte" :title="$t('fermer')" :aria-label="$t('fermer')" @click="fermerCarte" @keydown.tab.prevent="fermerCarte" @keydown.esc="fermerCarteEsc"><img src="@/assets/img/retroactions/applaudissements.svg" :alt="$t('applaudissements')"></button>
	</div>

	<div id="carte-victoire" class="conteneur-carte" :class="{'ouvert': carte === 'victoire'}" key="victoire">
		<button type="button" class="carte" :title="$t('fermer')" :aria-label="$t('fermer')" @click="fermerCarte" @keydown.tab.prevent="fermerCarte" @keydown.esc="fermerCarteEsc"><img src="@/assets/img/retroactions/victoire.svg" :alt="$t('victoire')"></button>
	</div>

	<div id="carte-dommage" class="conteneur-carte" :class="{'ouvert': carte === 'dommage'}" key="dommage">
		<button type="button" class="carte" :title="$t('fermer')" :aria-label="$t('fermer')" @click="fermerCarte" @keydown.tab.prevent="fermerCarte" @keydown.esc="fermerCarteEsc"><img src="@/assets/img/retroactions/dommage.svg" :alt="$t('dommage')"></button>
	</div>

	<div id="carte-vrai" class="conteneur-carte" :class="{'ouvert': carte === 'vrai'}" key="vrai">
		<button type="button" class="carte" :title="$t('fermer')" :aria-label="$t('fermer')" @click="fermerCarte" @keydown.tab.prevent="fermerCarte" @keydown.esc="fermerCarteEsc"><img src="@/assets/img/retroactions/vrai.svg" :alt="$t('vrai')"></button>
	</div>

	<div id="carte-faux" class="conteneur-carte" :class="{'ouvert': carte === 'faux'}" key="faux">
		<button type="button" class="carte" :title="$t('fermer')" :aria-label="$t('fermer')" @click="fermerCarte" @keydown.tab.prevent="fermerCarte" @keydown.esc="fermerCarteEsc"><img src="@/assets/img/retroactions/faux.svg" :alt="$t('faux')"></button>
	</div>

	<div id="carte-pouce-haut" class="conteneur-carte" :class="{'ouvert': carte === 'pouce-haut'}" key="pouce-haut">
		<button type="button" class="carte" :title="$t('fermer')" :aria-label="$t('fermer')" @click="fermerCarte" @keydown.tab.prevent="fermerCarte" @keydown.esc="fermerCarteEsc"><img src="@/assets/img/retroactions/pouce-haut.svg" :alt="$t('pouceHaut')"></button>
	</div>

	<div id="carte-pouce-bas" class="conteneur-carte" :class="{'ouvert': carte === 'pouce-bas'}" key="pouce-bas">
		<button type="button" class="carte" :title="$t('fermer')" :aria-label="$t('fermer')" @click="fermerCarte" @keydown.tab.prevent="fermerCarte" @keydown.esc="fermerCarteEsc"><img src="@/assets/img/retroactions/pouce-bas.svg" :alt="$t('pouceBas')"></button>
	</div>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'

export default {
	name: 'PRetroaction',
	inject: ['app'],
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
	emits: {
		afficher: null,
		fermer: null,
		export: null
	},
	extends: Panneau,
	data () {
		return {
			chargement: true,
			options: {},
			mode: 'lecture',
			deplacement: false,
			redimensionnement: false,
			redimensionnementProportionnel: true,
			titre: '',
			id: '',
			w: 0,
			h: 0,
			x: 0,
			y: 0,
			minw: 36,
			minh: 31,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			carte: '',
			son: 'oui',
			elementPrecedent: null
		}
	},
	computed: {
		disabled () {
			return this.carte === '' ? false : true
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { son: this.son }, echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('retroaction')
		if (this.panneau.contenu !== '') {
			this.son = this.panneau.contenu.son
		}
		this.genererOptions('retroaction')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .bouton')?.focus()
			}, 0)
		}
	},
	methods: {
		ouvrirCarte (audio, carte) {
			this.carte = carte
			this.elementPrecedent = document.querySelector('#' + carte)
			if (this.son === 'oui') {
				if (this.app.audio.src !== '') {
					this.app.audio.pause()
					this.app.audio.currentTime = 0
				}
				this.app.audio.src = this.$recupererRessource('./static/audio/' + audio + '.mp3')
				this.app.audio.play()
			}
			if (carte === 'confettis' || carte === 'applaudissements' || carte === 'victoire') {
				this.lancerConfettis()
			}
			setTimeout(() => {
				document.querySelector('#carte-' + carte + ' .carte')?.focus()
			}, 100)
		},
		fermerCarte () {
			this.carte = ''
			if (this.app.audio.src !== '') {
				this.app.audio.pause()
				this.app.audio.currentTime = 0
			}
			this.gererFocus()
		},
		fermerCarteEsc (event) {
			event.preventDefault()
			event.stopPropagation()
			this.carte = ''
			if (this.app.audio.src !== '') {
				this.app.audio.pause()
				this.app.audio.currentTime = 0
			}
			this.gererFocus()
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

<style>
.panneau .panneau-retroaction .retroactions {
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	margin-bottom: 2rem;
}

.panneau .panneau-retroaction .bouton {
	background-color: #fff;
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
	height: 7rem;
	width: 7rem;
	border: 2px solid #00ced1;
	border-radius: 50%;
}

.panneau .panneau-retroaction .bouton:hover {
	border: 2px solid #00acb0;
	background: #00ced1;
}

.panneau .panneau-retroaction .oui {
	margin-right: 2.5rem;
}

.panneau .panneau-retroaction .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
    margin-left: 1rem;
	margin-bottom: 0;
}

.conteneur-carte {
	visibility: hidden;
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	height: 100%;
	width: 100%;
	z-index: 10005;
	background-color: rgba(0, 0, 0, 0.3);
	opacity: 0;
	transition: opacity 0.4s ease-in-out;
}

.conteneur-carte.ouvert {
	visibility: visible;
	opacity: 1;
}

.conteneur-carte .carte {
	color: #fff;
	transform: scale(0);
	transition: all 0.4s ease-in-out;
	user-select: none;
}

.conteneur-carte .carte img {
	width: auto;
	height: 75vh;
	cursor: pointer;
}

.conteneur-carte.ouvert .carte {
	transform: scale(1);
}
</style>
