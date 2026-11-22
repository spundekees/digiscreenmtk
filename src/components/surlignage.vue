<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-surlignage">
			<div class="contenu" v-if="mode === 'edition'">
				<label :for="'texte_' + id">{{ $t('texte') }}</label>
				<textarea :id="'texte_' + id" class="surlignage" :value="texte" @input="texte = $event.target.value"></textarea>
				<div class="actions">
					<span role="button" class="bouton-secondaire" tabindex="0" :title="$t('televerserFichierTxt')" :aria-label="$t('televerserFichierTxt')" @keydown.enter.space.prevent="activerInput('selectionner_txt_' + id)" @click="activerInput('selectionner_txt_' + id)"><i class="material-icons" aria-hidden="true">upload_file</i></span>
					<input :id="'selectionner_txt_' + id" type="file" @change="televerserTxt" style="display: none" accept=".txt">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<div class="contenu" v-else>
				<div class="surligneurs">
					<button type="button" class="surligneur jaune" :title="$t('surligneurJaune')" :aria-label="$t('surligneurJaune')" :aria-pressed="(surligneur === '#faff00') ? 'true' : 'false'" :class="{'actif': surligneur === '#faff00'}" @click="surligneur = '#faff00'" ></button>
					<button type="button" class="surligneur vert" :title="$t('surligneurVert')" :aria-label="$t('surligneurVert')" :aria-pressed="(surligneur === '#00ff00') ? 'true' : 'false'" :class="{'actif': surligneur === '#00ff00'}" @click="surligneur = '#00ff00'" ></button>
					<button type="button" class="surligneur rose" :title="$t('surligneurRose')" :aria-label="$t('surligneurRose')" :aria-pressed="(surligneur === '#fb3bc3') ? 'true' : 'false'" :class="{'actif': surligneur === '#fb3bc3'}" @click="surligneur = '#fb3bc3'" ></button>
					<button type="button" class="surligneur bleu" :title="$t('surligneurBleu')" :aria-label="$t('surligneurBleu')" :aria-pressed="(surligneur === '#04fdff') ? 'true' : 'false'" :class="{'actif': surligneur === '#04fdff'}" @click="surligneur = '#04fdff'" ></button>
				</div>
				<div class="surlignage" :class="{'plein-ecran': statut === 'max'}">
					<template v-for="(item, index) in items">
						<template v-if="item !== '<br>' && item !== ''">
							<span :id="'item_' + id + '_' + index" role="button" tabindex="0" aria-pressed="true" :title="$t('annuler')" :style="{'background': definirCouleur(index)}" @click="surligner($event, index)" @keydown.enter.space.prevent="surligner($event, index)" v-if="itemsSurlignes.map(i => i.index).includes(index)" :key="'item_surligne_' + index + '_' + item">{{ item }}</span>
							<span :id="'item_' + id + '_' + index" role="button" tabindex="0" aria-pressed="false" :title="$t('surligner')" @click="surligner($event, index)" @keydown.enter.space.prevent="surligner($event, index)" v-else :key="'item_' + index + '_' + item">{{ item }}</span>
						</template>
						<template v-else-if="item === '<br>'">
							<br :key="'item_br_' + index + '_' + item">
						</template>
					</template>
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
	name: 'PSurlignage',
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
			itemsSurlignes: [],
			surligneur: '#faff00'
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { texte: this.texte, itemsSurlignes: this.itemsSurlignes }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('surlignage')
		if (this.panneau.contenu !== '') {
			this.texte = this.panneau.contenu.texte
			this.itemsSurlignes = this.panneau.contenu.itemsSurlignes
		}
		if (this.mode === 'lecture') {
			this.redimensionnement = true
			this.creer()
		}
		this.genererOptions('surlignage')
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
				if (this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else {
					this.w = 60
					this.h = 36
				}
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				this.$nextTick(() => {
					document.querySelector('#' + this.id)?.focus()
				})
				this.positionner()
				this.creer()
			}
		},
		creer () {
			const texte = this.texte.replace(/(?:\r|\n|\r\n)/g, ' <br> ')
			const items = texte.split(' ')
			this.items = items
		},
		editer () {
			this.mode = 'edition'
			this.redimensionnement = false
			this.items = []
			this.itemsSurlignes = []
			this.surligneur = '#faff00'
			this.donnees.w = this.w
			this.donnees.h = this.h
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 46
			this.h = 36
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' textarea')?.focus()
			})
			this.positionner()
		},
		surligner (event, item) {
			event.preventDefault()
			event.stopPropagation()
			if (this.itemsSurlignes.map(i => i.index).includes(item)) {
				const index = this.itemsSurlignes.map(i => i.index).indexOf(item)
				if (this.itemsSurlignes[index].couleur === this.surligneur) {
					this.itemsSurlignes.splice(index, 1)
				} else {
					this.itemsSurlignes[index].couleur = this.surligneur
				}
			} else {
				this.itemsSurlignes.push({ index: item, couleur: this.surligneur })
			}
			this.$nextTick(() => {
				document.querySelector('#item_' + this.id + '_' + item)?.focus()
			})
		},
		definirCouleur (index) {
			let couleur = ''
			this.itemsSurlignes.forEach((item) => {
				if (item.index === index) {
					couleur = item.couleur
				}
			})
			return couleur
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
.panneau .conteneur textarea.surlignage {
	height: 21rem;
    max-height: 21rem;
}

.panneau .conteneur .surligneurs {
	display: flex;
	justify-content: center;
	margin-bottom: 2rem;
	margin-top: 0.5rem;
}

.panneau .conteneur .surligneur {
	display: inline-block;
	width: 4rem;
	height: 4rem;
	border-radius: 50%;
	margin: 0 1rem;
	cursor: pointer;
}

.panneau .conteneur .surligneur.jaune {
	background: #faff00;
}

.panneau .conteneur .surligneur.vert {
	background: #00ff00;
}

.panneau .conteneur .surligneur.rose {
	background: #fa35c2;
}

.panneau .conteneur .surligneur.bleu {
	background: #04fdff;
}

.panneau .conteneur .surligneur.actif {
	border-radius: 4px;
}

.panneau .conteneur div.surlignage {
	text-align: left;
}

.panneau .conteneur div.surlignage span {
	display: inline-flex;
	font-size: 3.2rem;
	font-weight: 400;
    vertical-align: middle;
	margin-right: 1rem;
	line-height: 2;
	cursor: pointer;
}

.panneau .conteneur div.surlignage.plein-ecran span {
	font-size: 4.5rem;
}

.panneau .panneau-surlignage .actions {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 2rem;
}

.panneau .panneau-surlignage .actions .bouton {
	margin-top: 0;
	margin-left: 2rem;
	margin-right: 0;
}
</style>
