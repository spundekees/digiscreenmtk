<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-feu">
			<div class="contenu">
				<div class="feux">
					<button type="button" class="feu rouge" :title="$t('rouge')" :aria-label="$t('rouge')" :class="{'allume': couleur === 'rouge'}" @click="modifier('rouge')"></button>
					<button type="button" class="feu orange" :title="$t('orange')" :aria-label="$t('orange')" :class="{'allume': couleur === 'orange'}" @click="modifier('orange')"></button>
					<button type="button" class="feu vert" :title="$t('vert')" :aria-label="$t('vert')" :class="{'allume': couleur === 'vert'}" @click="modifier('vert')"></button>
					<button type="button" class="feu blanc" :title="$t('blanc')" :aria-label="$t('blanc')" :class="{'allume': couleur === 'blanc'}" @click="modifier('blanc')"></button>
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
	name: 'PFeu',
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
			minw: 28,
			minh: 57,
			statut: '',
			dimensions: {},
			position: {},
			couleur: ''
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { couleur: this.couleur }, echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('feuQuadricolore')
		if (this.panneau.contenu !== '') {
			this.couleur = this.panneau.contenu.couleur
		}
		this.genererOptions('feu')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .feu')?.focus()
			}, 0)
		}
	},
	methods: {
		modifier (couleur) {
			if (this.couleur !== couleur) {
				this.couleur = couleur
			} else {
				this.couleur = ''
			}
		}
	}
}
</script>

<style>
.panneau .panneau-feu .feux {
	background: #111;
	width: 17rem;
	height: 49.5rem;
	border-radius: 2rem;
	position: relative;
	border: solid 0.5rem #333;
	box-sizing: border-box;
	margin: auto;
}

.panneau .panneau-feu .feu {
	position: absolute;
	width: 10rem;
	height: 10rem;
	background-size: 0.5rem 0.5rem;
	border-radius: 50%;
	opacity: 0.2;
	border: none;
	padding: 0;
	box-sizing: border-box;
	cursor: pointer;
}

.panneau .panneau-feu .feu.rouge {
	background: red;
	background-image: radial-gradient(brown, transparent);
	top: 2rem;
	left: 3rem;
	border: dotted 2px red;
	box-shadow: 0 0 2rem #111 inset, 0 0 1rem red;
}

.panneau .panneau-feu .feu.orange {
	background: orange;
	background-image: radial-gradient(#cf8703, transparent);
	border: dotted 2px orange;
	position: absolute;
	top: 13.5rem;
	left: 3rem;
	box-shadow: 0 0 2rem #111 inset, 0 0 1rem orange;
}

.panneau .panneau-feu .feu.vert {
	background: green;
	background-image: radial-gradient(#009b00, transparent);
	border: dotted 2px #009b00;
	position: absolute;
	top: 25rem;
	left: 3rem;
	box-shadow: 0 0 2rem #111 inset, 0 0 1rem #009b00;
}

.panneau .panneau-feu .feu.blanc {
	background: #ffffff;
	background-image: radial-gradient(#cccccc, transparent);
	border: dotted 2px #cccccc;
	position: absolute;
	top: 36.5rem;
	left: 3rem;
	box-shadow: 0 0 2rem #111 inset, 0 0 1rem #cccccc;
}

.panneau .panneau-feu .feu.allume {
	opacity: 1;
}
</style>
