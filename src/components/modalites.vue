<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-modalites">
			<div class="contenu">
				<div class="modalites">
					<button type="button" :title="$t('silence')" :aria-label="$t('silence')" @click="modalite = 'silence'" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/modalites/silence.png') + ')' }" ></button>
					<button type="button" :title="$t('ecoutez')" :aria-label="$t('ecoutez')" @click="modalite = 'ecoutez'" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/modalites/ecoutez.png') + ')' }" ></button>
					<button type="button" :title="$t('chuchotez')" :aria-label="$t('chuchotez')" @click="modalite = 'chuchotez'" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/modalites/chuchotez.png') + ')' }" ></button>
					<button type="button" :title="$t('parlez')" :aria-label="$t('parlez')" @click="modalite = 'parlez'" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/modalites/parlez.png') + ')' }" ></button>
					<button type="button" :title="$t('communiquez')" :aria-label="$t('communiquez')" @click="modalite = 'communiquez'" :style="{ 'background-image': 'url(' + $recupererRessource('./static/img/modalites/communiquez.png') + ')' }" ></button>
				</div>
				<div class="modalite">
					<img :src="$recupererRessource('./static/img/modalites/' + modalite + '.png')" :alt="$t(modalite)">
					<div class="legende">{{ $t(modalite) }}</div>
					<div class="source"><a href="https://arasaac.org" target="_blank" rel="noreferrer">{{ $t('sourceImages') }}&nbsp;: ARASAAC. Licence&nbsp;: CC (BY-NC-SA)<span class="lecteur-ecran"> ({{ $t('nouvelOnglet') }})</span></a></div>
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
	name: 'PModalites',
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
			minw: 38,
			minh: 56,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			modalite: 'silence'
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { modalite: this.modalite }, echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('modalites')
		if (this.panneau.contenu !== '') {
			this.modalite = this.panneau.contenu.modalite
		}
		this.genererOptions('modalites')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' button[type="button"]')?.focus()
			}, 0)
		}
	}
}
</script>

<style>
.panneau .panneau-modalites .modalites {
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	margin-bottom: 2rem;
	margin-top: 0.5rem;
}

.panneau .panneau-modalites .modalites button {
	width: 5rem;
	height: 5rem;
	background-size: contain;
	background-origin: center;
	background-repeat: no-repeat;
	cursor: pointer;
	border-radius: 50%;
	border: 1px solid #ddd;
}

.panneau .panneau-modalites .modalites button:hover {
	background-color: #eee;
}

.panneau .panneau-modalites .modalite img {
	max-width: 100%;
	font-size: 0;
}

.panneau .panneau-modalites .modalite .legende {
	font-size: 3rem;
	font-weight: 700;
	margin-top: 1.5rem;
}

.panneau .panneau-modalites .modalite .source {
	font-size: 1rem;
	margin-top: 1.5rem;
}
</style>
