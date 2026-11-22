<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-ordre">
			<div class="contenu" v-if="mode === 'edition'">
				<label :id="'groupe_type_' + id" class="libelle-option">{{ $t('typeRemiseOrdre') }}</label>
				<div class="type" role="radiogroup" :aria-labelledby="'groupe_type_' + id">
					<span class="horizontale">
						<input :id="'horizontale_' + id" type="radio" :name="'type_' + id" value="horizontale" :checked="type === 'horizontale'" @change="type = $event.target.value">
						<label :for="'horizontale_' + id">{{ $t('horizontale') }}</label>
					</span>
					<span class="verticale">
						<input :id="'verticale_' + id" type="radio" :name="'type_' + id" value="verticale" :checked="type === 'verticale'" @change="type = $event.target.value">
						<label :for="'verticale_' + id">{{ $t('verticale') }}</label>
					</span>
				</div>
				<label :id="'groupe_fleches_' + id" class="libelle-option">{{ $t('afficherFlechesDeplacement') }}</label>
				<div class="choix" role="radiogroup" :aria-labelledby="'groupe_fleches_' + id">
					<span class="oui">
						<input :id="'fleches_oui_' + id" type="radio" :name="'fleches_' + id" value="oui" :checked="fleches === 'oui'" @change="fleches = $event.target.value">
						<label :for="'fleches_oui_' + id">{{ $t('oui') }}</label>
					</span>
					<span class="non">
						<input :id="'fleches_non_' + id" type="radio" :name="'fleches_' + id" value="non" :checked="fleches === 'non'" @change="fleches = $event.target.value">
						<label :for="'fleches_non_' + id">{{ $t('non') }}</label>
					</span>
				</div>
				<label :id="'libelle-ordre-1_' + id">{{ $t('itemsOrdre') }}</label>
				<div role="group" :aria-labelledby="'libelle-ordre-1_' + id" class="items">
					<input type="text" v-for="(item, index) in items" :aria-label="$t('itemsOrdre') + ' ' + (index + 1)" :value="item" @input="items[index] = $event.target.value" :key="'item_' + index">
				</div>
				<button type="button" class="bouton-secondaire" :title="$t('ajouterItem')" :aria-label="$t('ajouterItem')" @click="ajouterItem"><i class="material-icons" aria-hidden="true">add_circle_outline</i></button>
				<div class="actions">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<div class="contenu" v-else>
				<div class="items" :class="{'horizontale': type === 'horizontale', 'verticale': type === 'verticale', 'plein-ecran': statut === 'max'}">
					<div class="item" v-for="(item, index) in itemsMelanges" :class="{'correct': resultat === 'correct'}" :key="'item_' + index">
						<span>{{ item }}</span>
						<span class="deplacements" v-if="fleches === 'oui'">
							<button type="button" class="deplacer avant" :disabled="index === 0 || resultat === 'correct'" :title="$t('deplacerAvant')" :aria-label="$t('libelleCible', { action: $t('deplacerAvant'), cible: item })" @click="deplacerElement('itemsMelanges', index, -1, '.items .item')"><i class="material-icons" aria-hidden="true">{{ type === 'horizontale' ? 'arrow_back' : 'arrow_upward' }}</i></button>
							<button type="button" class="deplacer apres" :disabled="index === itemsMelanges.length - 1 || resultat === 'correct'" :title="$t('deplacerApres')" :aria-label="$t('libelleCible', { action: $t('deplacerApres'), cible: item })" @click="deplacerElement('itemsMelanges', index, 1, '.items .item')"><i class="material-icons" aria-hidden="true">{{ type === 'horizontale' ? 'arrow_forward' : 'arrow_downward' }}</i></button>
						</span>
					</div>
				</div>
				<div v-if="resultat === 'correct'">
					<span class="emoticones">🎉🥳</span>
					<span class="bouton correct">{{ $t('bravoExercice') }}</span>
					<span class="emoticones">🥳🎉</span>
				</div>
				<div v-else-if="resultat === 'incorrect'">
					<span class="emoticones">🙁🙁</span>
					<button type="button" class="bouton verifier" @click="verifier">{{ $t('verifier') }}</button>
					<span class="emoticones">🙁🙁</span>
				</div>
				<button type="button" class="bouton verifier" v-else @click="verifier">{{ $t('verifier') }}</button>
			</div>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'
import Sortable from 'sortablejs'

export default {
	name: 'POrdre',
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
			type: 'horizontale',
			fleches: 'non',
			items: ['', '', '', '', ''],
			itemsMelanges: [],
			resultat: '',
			sortable: ''
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { items: this.items, type: this.type, fleches: this.fleches }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('remiseOrdre')
		if (this.panneau.contenu !== '') {
			this.items = this.panneau.contenu.items
			this.type = this.panneau.contenu.type
			this.fleches = this.panneau.contenu.fleches || 'non'
			this.itemsMelanges = this.melanger(JSON.parse(JSON.stringify(this.items)))
		}
		if (this.mode === 'lecture') {
			this.redimensionnement = true
		}
		this.genererOptions('ordre')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'lecture') {
			setTimeout(() => {
				this.sortable = new Sortable(document.querySelector('#' + this.id + ' .conteneur .items'), {
					sort: true,
					delay: 0,
					delayOnTouchOnly: false,
					touchStartThreshold: 0,
					animation: 150,
					easing: 'cubic-bezier(1, 0, 0, 1)',
					draggable: '.item',
					filter: '.item.correct, .deplacer',
					preventOnFilter: false,
					onEnd: this.synchroniserOrdre
				})
				if (this.statut !== 'min') {
					document.querySelector('#' + this.id)?.focus()
				}
			}, 0)
		} else if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .items input')?.focus()
			}, 0)
		}
	},
	methods: {
		generer () {
			if (this.items.length > 1 && this.verifierItems() === true) {
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
				this.positionner()
				this.items.forEach((item, index) => {
					this.items[index] = item.trim()
				})
				this.items = this.items.filter((element) => element !== '')
				this.itemsMelanges = this.melanger(JSON.parse(JSON.stringify(this.items)))
				this.$nextTick(() => {
					this.sortable = new Sortable(document.querySelector('#' + this.id + ' .conteneur .items'), {
						sort: true,
						delay: 0,
						delayOnTouchOnly: false,
						touchStartThreshold: 0,
						animation: 150,
						easing: 'cubic-bezier(1, 0, 0, 1)',
						draggable: '.item',
						filter: '.item.correct, .deplacer',
						preventOnFilter: false,
						onEnd: this.synchroniserOrdre
					})
					document.querySelector('#' + this.id)?.focus()
				})
			}
		},
		editer () {
			this.$nextTick(() => {
				this.sortable.destroy()
				this.mode = 'edition'
				this.redimensionnement = false
				this.itemsMelanges = []
				this.resultat = ''
				this.sortable = ''
				this.donnees.w = this.w
				this.donnees.h = this.h
				this.donnees.x = this.x
				this.donnees.y = this.y
				this.w = 46
				this.h = 56.2
				this.$nextTick(() => {
					document.querySelector('#' + this.id + ' .items input')?.focus()
				})
				this.positionner()
			})
		},
		synchroniserOrdre (event) {
			if (event.oldIndex === event.newIndex) return
			const parent = event.from
			parent.removeChild(event.item)
			parent.insertBefore(event.item, parent.children[event.oldIndex] || null)
			const liste = [...this.itemsMelanges]
			const element = liste.splice(event.oldIndex, 1)[0]
			liste.splice(event.newIndex, 0, element)
			this.itemsMelanges = liste
		},
		verifier () {
			if (this.items.toString() === this.itemsMelanges.toString()) {
				this.resultat = 'correct'
				this.lancerConfettis()
			} else {
				this.resultat = 'incorrect'
			}
		},
		ajouterItem () {
			this.items.push('')
			this.$nextTick(() => {
				const element = document.querySelector('#' + this.id + ' .panneau-ordre')
				element.scrollTop = element.scrollHeight
				const items = document.querySelectorAll('#' + this.id + ' .items input')
				for (let i = 0; i < items.length; i++) {
					if (i === this.items.length - 1) {
						items[i].focus()
					}
				}
			})
		},
		verifierItems () {
			let total = 0
			this.items.forEach((item) => {
				if (item.trim() !== '') {
					total++
				}
			})
			if (total > 1) {
				return true
			} else {
				return false
			}
		}
	}
}
</script>

<style>
.panneau .panneau-ordre .type {
	margin-bottom: 2rem;
}

.panneau .panneau-ordre .type label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
    margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-ordre span.horizontale,
.panneau .panneau-ordre span.oui {
	margin-right: 2.5rem;
}

.panneau .panneau-ordre .choix {
	margin-bottom: 2rem;
}

.panneau .panneau-ordre .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
    margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-ordre .items .item {
    padding: 0.5rem 1.5rem;
    border: 1px solid #ddd;
    border-radius: 0.4rem;
	font-size: 3.2rem;
	font-weight: 400;
	line-height: 1.4;
	cursor: move;
	background: #fff;
}

.panneau .panneau-ordre .items .item.correct {
    color: #007f63;
    border: 1px solid #007f63;
	cursor: default;
}

.panneau .panneau-ordre .items.horizontale .item {
	display: inline-block;
	margin: 0.5rem;
}

.panneau .panneau-ordre .items.verticale .item {
	display: block;
	margin: 1rem 0;
}

.panneau .panneau-ordre .items .item .deplacements {
	display: inline-flex;
	gap: 0.5rem;
	margin-left: 1rem;
	vertical-align: middle;
}

.panneau .panneau-ordre .items .item .deplacer {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 3.2rem;
	height: 3.2rem;
	color: #001d1d;
	background: #fff;
	border: 1px solid #ddd;
	border-radius: 50%;
	cursor: pointer;
}

.panneau .panneau-ordre .items .item .deplacer:disabled {
	opacity: 0.4;
	cursor: default;
}

.panneau .panneau-ordre .items .item .deplacer i {
	font-size: 2rem;
}

.panneau .panneau-ordre .items.plein-ecran .item {
	font-size: 4.5rem;
}

.panneau .panneau-ordre .items.plein-ecran.horizontale .item {
	margin: 0.75rem;
}

.panneau .panneau-ordre .items.plein-ecran.verticale .item {
	margin: 1.25rem 0;
}
</style>
