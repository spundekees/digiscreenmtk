<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-liste">
			<div class="contenu">
				<div class="items" :class="{'plein-ecran': statut === 'max'}">
					<div :id="item.id" class="item" v-for="(item, indexItem) in items" :key="'item_' + indexItem + '_' + id">
						<div class="contenu-item">
							<button type="button" class="coche" :title="$t('cocher')" :aria-label="$t('cocher')" @click="cocher(indexItem)" v-if="item.coche === false"><i class="material-icons" aria-hidden="true">check_box_outline_blank</i></button>
							<button type="button" class="coche"  :title="$t('cocher')" :aria-label="$t('cocher')" @click="cocher(indexItem)" v-else><i class="material-icons" aria-hidden="true">check_box</i></button>
							<span class="texte" :class="{'barre': item.coche === true}" :contenteditable="true" @keydown="verifierItem($event, indexItem)">{{ item.texte }}</span>
							<button type="button" class="supprimer" :title="$t('supprimer')" :aria-label="$t('supprimer')" @click="supprimer(indexItem, 'apres')"><i class="material-icons" aria-hidden="true">delete</i></button>
						</div>
					</div>
				</div>
				<div class="boutons">
					<button type="button" class="bouton-secondaire" :title="$t('ajouterItem')" :aria-label="$t('ajouterItem')" @click="ajouterItem($event, '')"><i class="material-icons" aria-hidden="true">add_circle_outline</i></button>
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
	name: 'PListe',
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
			redimensionnement: true,
			titre: '',
			id: '',
			w: 0,
			h: 0,
			x: 0,
			y: 0,
			minw: 40,
			minh: 30,
			statut: '',
			dimensions: {},
			position: {},
			items: [{ id: 'item_1735035298744', coche: false, texte: this.$t('exemple') + ' 1'}, { id: 'item_1735035298745', coche: false, texte: this.$t('exemple') + ' 2'}]
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				const textes = document.querySelectorAll('#' + this.id + ' .texte')
				textes.forEach((texte, index) => {
					this.items[index].texte = texte.textContent
				})
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { items: this.items }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('liste')
		if (this.panneau.contenu !== '') {
			this.items = this.panneau.contenu.items
		}
		this.genererOptions('liste')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
	},
	methods: {
		cocher (index) {
			this.items[index].coche = !this.items[index].coche
		},
		ajouterItem (event, index) {
			event.preventDefault()
			event.stopPropagation()
			if (index === '') {
				index = this.items.length - 1
			}
			const id = 'item_' + Date.now()
			this.items.splice(index + 1, 0, { id: id, coche: false, texte: '' })
			this.$nextTick(() => {
				document.querySelector('#' + id + ' .texte')?.focus()
			})
		},
		supprimer (index, focus) {
			const textes = document.querySelectorAll('#' + this.id + ' .texte')
			textes.forEach((texte, index) => {
				this.items[index].texte = texte.textContent
			})
			const itemSuivant = this.items[index + 1]
			const itemPrecedent = this.items[index - 1]
			this.items.splice(index, 1)
			if (itemPrecedent && focus === 'avant') {
				this.$nextTick(() => {
					document.querySelector('#' + itemPrecedent.id + ' .texte')?.focus()
				})
			} else if (itemSuivant && focus === 'apres') {
				this.$nextTick(() => {
					document.querySelector('#' + itemSuivant.id + ' .texte')?.focus()
				})
			} else if (itemSuivant) {
				this.$nextTick(() => {
					document.querySelector('#' + itemSuivant.id + ' .texte')?.focus()
				})
			} else {
				this.$nextTick(() => {
					document.querySelector('#' + itemPrecedent.id + ' .texte')?.focus()
				})
			}
		},
		verifierItem (event, index) {
			const position = this.recupererPosition(event.target)
			const texte = event.target.textContent
			if (position === 0 && event.key === 'Backspace') {
				this.supprimer(index, 'avant')
			} else if (position === texte.length && event.key === 'Enter') {
				this.ajouterItem(event, index)
			} else if (event.key === 'Enter') {
				const texteAvant = texte.substring(0, position)
				const texteApres = texte.substring(position, texte.length)
				this.items[index].texte = texteAvant
				this.ajouterItem(event, index)
				this.$nextTick(() => {
					this.items[index + 1].texte = texteApres
				})
			}
		},
		recupererPosition (element) {
			let position = 0
			const doc = element.ownerDocument || element.document
			const win = doc.defaultView || doc.parentWindow
			const selection = win.getSelection()
			if (selection.rangeCount > 0) {
				const range = win.getSelection().getRangeAt(0)
				let preCaretRange = range.cloneRange()
				preCaretRange.selectNodeContents(element)
				preCaretRange.setEnd(range.endContainer, range.endOffset)
				position = preCaretRange.toString().length
			}
			return position
		}
	}
}
</script>

<style>
.panneau .panneau-liste .item {
	padding-bottom: 1rem;
	margin-bottom: 1rem;
	border-bottom: 1px solid #ddd;
}

.panneau .panneau-liste .item .contenu-item {
	display: flex;
	justify-content: flex-start;
	align-items: center;
}

.panneau .panneau-liste .item:last-child {
	border-bottom: none;
	margin-bottom: 0;
}

.panneau .panneau-liste .item .coche {
	margin-right: 1.2rem;
	cursor: pointer;
	user-select: none;
}

.panneau .panneau-liste .item .supprimer {
	color: #8a8a8a;
	margin-left: 1.2rem;
	cursor: pointer;
	user-select: none;
}

.panneau .panneau-liste .item .supprimer i,
.panneau .panneau-liste .item .coche i {
	font-size: 24px;
}

.panneau .panneau-liste .item .texte {
	font-size: 2rem;
	text-align: left;
	width: calc(100% - (48px + 2.4rem));
	cursor: text;
}

.panneau .panneau-liste .plein-ecran .item .texte {
	font-size: 2.5rem;
	text-align: left;
}

.panneau .panneau-liste .item .texte.barre {
	text-decoration: line-through;
}
</style>
