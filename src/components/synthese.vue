<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-synthese">
			<div class="contenu" v-if="mode === 'edition'">
				<label :for="'texte_' + id">{{ $t('texteSynthetiser') }}</label>
				<div class="synthese"><textarea :id="'texte_' + id" v-model="texte"></textarea></div>
				<label :for="'vitesse_' + id">{{ $t('vitesse') }}</label>
				<div class="vitesse">
					<input :id="'vitesse_' + id" type="range" :min="0.5" :max="2" :value="vitesse" :step="0.1" @change="vitesse = $event.target.value">
					<span class="valeur">{{ vitesse }}</span>
				</div>
				<label :for="'hauteur_' + id">{{ $t('hauteur') }}</label>
				<div class="hauteur">
					<input :id="'hauteur_' + id" type="range" :min="0" :max="2" :value="hauteur" :step="0.1" @change="hauteur = $event.target.value">
					<span class="valeur">{{ hauteur }}</span>
				</div>
				<label :for="'voix_' + id">{{ $t('voix') }}</label>
				<div class="voix">
					<input :id="'voix_' + id" type="text" :list="'liste_voix_' + id" :value="voix" @input="voix = $event.target.value" :disabled="listeVoix.length === 0" />
					<datalist :id="'liste_voix_' + id">
						<option value="">--</option>
						<template v-for="(item, index) in listeVoix">
							<option :value="item.name" v-if="item.default" :key="'voix_defaut_' + index">{{ item.name }} ({{ item.lang }}) -- {{ $t('parDefaut') }}</option>
							<option :value="item.name" v-else :key="'voix_' + index">{{ item.name }} ({{ item.lang }})</option>
						</template>
					</datalist>
				</div>
				<div class="actions">
					<button type="button" class="bouton" @click="parler">{{ $t('ecouter') }}</button>
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<button type="button" class="bouton audio" :title="$t('ecouterAudio')" :aria-label="$t('ecouterAudio')" @click="parler" v-else><i class="material-icons" aria-hidden="true">play_arrow</i></button>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'

export default {
	name: 'PSynthese',
	components: {
		JsPanel
	},
	props: {
		panneau: Object,
		pages: Array,
		nav: Boolean,
		export: Boolean,
		evenementClavier: Object,
		listeVoix: Array
	},
	extends: Panneau,
	data () {
		return {
			chargement: true,
			options: {},
			mode: 'edition',
			deplacement: false,
			redimensionnement: false,
			redimensionnementProportionnel: true,
			titre: '',
			id: '',
			w: 0,
			h: 0,
			x: 0,
			y: 0,
			minw: 20,
			minh: 14,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { x: 0, y: 0 },
			texte: '',
			vitesse: 1,
			hauteur: 1,
			voix: ''
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { texte: this.texte, vitesse: this.vitesse, hauteur: this.hauteur, voix: this.voix }, echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('syntheseVocale')
		if (this.panneau.contenu !== '') {
			this.texte = this.panneau.contenu.texte
			this.vitesse = this.panneau.contenu.vitesse
			this.hauteur = this.panneau.contenu.hauteur
			this.voix = this.panneau.contenu.voix
		}
		this.genererOptions('synthese')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min' && this.texte === '') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' input')?.focus()
			}, 0)
		}
		if (this.mode === 'edition' && this.listeVoix.length === 0) {
			this.voix = '---'
		} else if (this.mode === 'lecture' && (this.listeVoix.length === 0 || this.listeVoix.map((e) => e.name).includes(this.voix) === false)) {
			this.editer()
		} else if (this.mode === 'lecture') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .bouton.audio')?.focus()
			}, 0)
		}
	},
	methods: {
		generer () {
			if (this.texte !== '' && this.voix !== '' && this.listeVoix.map((e) => e.name).includes(this.voix) === true) {
				this.mode = 'lecture'
				this.w = 20
				this.h = 14
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				setTimeout(() => {
					document.querySelector('#' + this.id + ' .bouton.audio')?.focus()
				}, 0)
				this.positionner()
			}
		},
		editer () {
			this.mode = 'edition'
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 40
			this.h = 45
			setTimeout(() => {
				document.querySelector('#' + this.id + ' input')?.focus()
			}, 0)
			this.positionner()
		},
		parler () {
			if (window.speechSynthesis.speaking || this.voix === '') {
				return
			} else {
				const synthese = new SpeechSynthesisUtterance(this.texte)
				synthese.rate = this.vitesse
				synthese.pitch = this.hauteur
				this.listeVoix.forEach((item) => {
					if (item.name === this.voix) {
						synthese.voice = item
					}
				})
				window.speechSynthesis.speak(synthese)
			}
		}
	}
}
</script>

<style>
.panneau .conteneur .synthese,
.panneau .conteneur .vitesse,
.panneau .conteneur .hauteur {
	margin-bottom: 2rem;
}

.panneau .conteneur .hauteur .valeur,
.panneau .conteneur .vitesse .valeur {
	width: 3rem;
}

.panneau .conteneur .vitesse,
.panneau .conteneur .hauteur,
.panneau .conteneur .temps .minutes-secondes {
    display: flex;
}

.panneau .conteneur .bouton.audio {
	height: 6.4rem;
	line-height: 6.4rem;
	padding: 0 3.5rem;
	margin-top: 0;
}

.panneau .conteneur .bouton.audio i {
	font-size: 4.8rem;
}
</style>
