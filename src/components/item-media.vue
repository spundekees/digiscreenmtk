<template>
	<div class="item-media edition" v-if="edition">
		<div class="types" role="radiogroup" :aria-label="$t('typeElement') + ' : ' + libelle">
			<button type="button" role="radio" :aria-checked="element.type === type.id" :class="{'selectionne': element.type === type.id}" :title="type.titre" :aria-label="type.titre" @click="modifierType(type.id)" v-for="type in types" :key="type.id"><i class="material-icons" aria-hidden="true">{{ type.icone }}</i></button>
		</div>
		<div class="valeur" v-if="element.type === 'texte'">
			<input type="text" :value="element.valeur" :aria-label="libelle" :placeholder="$t('texte')" @input="modifierValeur($event.target.value)">
		</div>
		<div class="valeur" v-else-if="element.type === 'image'" @dragover.prevent @drop.prevent="glisserFichier">
			<input :id="'fichier_' + identifiant" type="file" accept="image/*" style="display: none;" @change="selectionnerFichier">
			<img :src="element.valeur" :alt="libelle" v-if="element.valeur !== ''">
			<span role="button" class="televerser" tabindex="0" :title="$t('selectionnerImage')" :aria-label="$t('libelleCible', { action: $t('selectionnerImage'), cible: libelle })" @keydown.enter.space.prevent="activerInput" @click="activerInput"><i class="material-icons" aria-hidden="true">add_photo_alternate</i></span>
		</div>
		<div class="valeur" v-else @dragover.prevent @drop.prevent="glisserFichier">
			<input :id="'fichier_' + identifiant" type="file" accept="audio/*" style="display: none;" @change="selectionnerFichier">
			<button type="button" class="lire" :class="{'lecture': lecture}" :title="lecture ? $t('arreterAudio') : $t('ecouterAudio')" :aria-label="$t('libelleCible', { action: lecture ? $t('arreterAudio') : $t('ecouterAudio'), cible: libelle })" @click="lire" v-if="element.valeur !== ''"><i class="material-icons" aria-hidden="true">{{ lecture ? 'stop' : 'play_arrow' }}</i></button>
			<span role="button" class="televerser" tabindex="0" :title="$t('selectionnerAudio')" :aria-label="$t('libelleCible', { action: $t('selectionnerAudio'), cible: libelle })" @keydown.enter.space.prevent="activerInput" @click="activerInput"><i class="material-icons" aria-hidden="true">library_music</i></span>
		</div>
	</div>
	<div class="item-media" :class="element.type" v-else>
		<span class="texte" v-if="element.type === 'texte'">{{ element.valeur }}</span>
		<img :src="element.valeur" :alt="libelle" draggable="false" v-else-if="element.type === 'image'">
		<button type="button" class="lire" :class="{'lecture': lecture}" :title="lecture ? $t('arreterAudio') : $t('ecouterAudio')" :aria-label="$t('libelleCible', { action: lecture ? $t('arreterAudio') : $t('ecouterAudio'), cible: libelle })" @click.stop="lire" v-else><i class="material-icons" aria-hidden="true">{{ lecture ? 'stop' : 'play_arrow' }}</i></button>
	</div>
</template>

<script>
let audioCourant = null
let elementCourant = null

export default {
	name: 'ItemMedia',
	props: {
		element: { type: Object, required: true },
		edition: { type: Boolean, default: false },
		identifiant: { type: String, default: '' },
		libelle: { type: String, default: '' }
	},
	emits: ['modifier'],
	data () {
		return {
			lecture: false
		}
	},
	computed: {
		types () {
			return [
				{ id: 'texte', titre: this.$t('texte'), icone: 'title' },
				{ id: 'image', titre: this.$t('image'), icone: 'image' },
				{ id: 'audio', titre: this.$t('audio'), icone: 'volume_up' }
			]
		}
	},
	watch: {
		'element.valeur' () {
			this.arreter()
		}
	},
	beforeUnmount () {
		this.arreter()
	},
	methods: {
		modifierType (type) {
			if (type === this.element.type) return
			this.$emit('modifier', { type: type, valeur: '' })
		},
		modifierValeur (valeur) {
			this.$emit('modifier', { type: this.element.type, valeur: valeur })
		},
		activerInput () {
			document.querySelector('#fichier_' + this.identifiant)?.click()
		},
		selectionnerFichier (event) {
			this.lireFichier(event.target.files[0])
			event.target.value = ''
		},
		glisserFichier (event) {
			this.lireFichier(event.dataTransfer.files[0])
		},
		lireFichier (fichier) {
			if (!fichier || !fichier.type.startsWith(this.element.type + '/')) return
			const reader = new FileReader()
			reader.readAsDataURL(fichier)
			reader.onloadend = (e) => {
				if (this.element.type === 'image') {
					this.redimensionnerImage(e.target.result)
				} else {
					this.modifierValeur(e.target.result)
				}
			}
		},
		redimensionnerImage (donnees) {
			const img = new Image()
			img.src = donnees
			img.onload = () => {
				if (img.width > 1000) {
					const canvas = document.createElement('canvas')
					const ratio = img.width / img.height
					canvas.width = 1000
					canvas.height = 1000 / ratio
					canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
					this.modifierValeur(canvas.toDataURL('image/jpeg', 0.85))
				} else {
					this.modifierValeur(donnees)
				}
			}
		},
		lire () {
			if (this.lecture) {
				this.arreter()
				return
			}
			if (audioCourant) {
				audioCourant.pause()
				if (elementCourant) elementCourant.lecture = false
			}
			audioCourant = new Audio(this.element.valeur)
			elementCourant = this
			audioCourant.onended = () => {
				this.arreter()
			}
			audioCourant.play().catch(() => {
				this.arreter()
			})
			this.lecture = true
		},
		arreter () {
			if (elementCourant === this && audioCourant) {
				audioCourant.pause()
				audioCourant = null
				elementCourant = null
			}
			this.lecture = false
		}
	}
}
</script>

<style>
.item-media {
	display: flex;
	justify-content: center;
	align-items: center;
}

.item-media .texte {
	line-height: 1.4;
	word-break: break-word;
}

.item-media img {
	max-width: 100%;
	max-height: 12rem;
	height: auto;
	pointer-events: none;
}

.item-media .lire {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 5rem;
	height: 5rem;
	color: #001d1d;
	background: #fff;
	border: 0.3rem solid;
	border-radius: 50%;
	cursor: pointer;
}

.item-media .lire i {
	font-size: 3.2rem;
}

.item-media .lire.lecture {
	color: #00898b;
}

.item-media.edition {
	justify-content: flex-start;
	gap: 1rem;
	flex: 1;
	min-width: 0;
}

.item-media.edition .types {
	display: flex;
	flex-shrink: 0;
	border: 1px solid #ddd;
	border-radius: 0.5rem;
}

.item-media.edition .types button {
	position: relative;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 3.2rem;
	height: 3.2rem;
	color: #777;
	background: #fff;
	cursor: pointer;
}

.item-media.edition .types button:first-child {
	border-radius: 0.4rem 0 0 0.4rem;
}

.item-media.edition .types button:last-child {
	border-radius: 0 0.4rem 0.4rem 0;
}

.item-media .lire:focus,
.item-media.edition .types button:focus,
.conteneur .item-media.edition .valeur span.televerser:focus {
	z-index: 1;
	outline: 2px solid #ed5b00;
	outline-offset: 2px;
}

.item-media.edition .types button + button {
	border-left: 1px solid #ddd;
}

.item-media.edition .types button.selectionne {
	color: #001d1d;
	background: #00ced1;
}

.item-media.edition .types button i {
	font-size: 2rem;
}

.item-media.edition .valeur {
	display: flex;
	align-items: center;
	gap: 1rem;
	flex: 1;
	min-width: 0;
}

.item-media.edition .valeur input[type="text"] {
	margin: 0;
}

.item-media.edition .valeur img {
	max-height: 4.4rem;
	width: auto;
	border: 1px solid #ddd;
}

.item-media.edition .valeur .lire {
	width: 4.4rem;
	height: 4.4rem;
	border-width: 0.2rem;
}

.item-media.edition .valeur .lire i {
	font-size: 2.6rem;
}

.conteneur .item-media.edition .valeur span.televerser {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 4.4rem;
	height: 4.4rem;
	margin: 0;
	color: #00898b;
	border: 2px dashed #00ced1;
	cursor: pointer;
}

.item-media.edition .valeur .televerser i {
	font-size: 2.6rem;
}
</style>
