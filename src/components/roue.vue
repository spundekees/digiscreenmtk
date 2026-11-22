<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-roue">
			<div class="contenu" v-if="mode === 'edition'">
				<label :id="'libelle-roue-1_' + id">{{ $t('itemsRoue') }}</label>
				<div role="group" :aria-labelledby="'libelle-roue-1_' + id" class="items">
					<div class="item" v-for="(item, index) in items" :key="'item_' + index">
						<span class="poignee"><i class="material-icons" aria-hidden="true">drag_handle</i></span>
						<button type="button" class="deplacer avant" :disabled="index === 0" :title="$t('deplacerAvant')" :aria-label="$t('libelleCible', { action: $t('deplacerAvant'), cible: $t('itemsRoue') + ' ' + (index + 1) })" @click="deplacerElement('items', index, -1, '.items .item')"><i class="material-icons" aria-hidden="true">arrow_upward</i></button>
						<button type="button" class="deplacer apres" :disabled="index === items.length - 1" :title="$t('deplacerApres')" :aria-label="$t('libelleCible', { action: $t('deplacerApres'), cible: $t('itemsRoue') + ' ' + (index + 1) })" @click="deplacerElement('items', index, 1, '.items .item')"><i class="material-icons" aria-hidden="true">arrow_downward</i></button>
						<input type="text" :aria-label="$t('itemsRoue') + ' ' + (index + 1)" :value="item" @input="items[index] = $event.target.value" :maxlength="20">
					</div>
				</div>
				<div class="boutons">
					<button type="button" class="bouton-secondaire" :title="$t('ajouterItem')" :aria-label="$t('ajouterItem')" @click="ajouterItem"><i class="material-icons" aria-hidden="true">add_circle_outline</i></button>
					<button type="button" class="bouton-secondaire" :title="$t('ajouterListe')" :aria-label="$t('ajouterListe')" @click="afficherListe"><i class="material-icons" aria-hidden="true">list_alt</i></button>
					<span role="button" class="bouton-secondaire" tabindex="0" :title="$t('televerserFichierTxt')" :aria-label="$t('televerserFichierTxt')" @keydown.enter.space.prevent="activerInput('selectionner_txt_' + id)" @click="activerInput('selectionner_txt_' + id)"><i class="material-icons" aria-hidden="true">upload_file</i></span>
					<input :id="'selectionner_txt_' + id" type="file" @change="televerserTxt" style="display: none" accept=".txt">
				</div>
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
				<div class="actions">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<div class="contenu" v-else>
				<canvas :id="'roue_' + id" tabindex="0" @click="lancer" @keydown.enter="lancer" />
			</div>
			<Transition name="fondu">
				<div class="liste" v-if="modale">
					<span :id="'consigne_liste_' + id" class="consigne">{{ $t('consigneListeMots') }}</span>
					<textarea :aria-labelledby="'consigne_liste_' + id" @input="liste = $event.target.value" :placeholder="$t('exempleListe')"></textarea>
					<div class="actions">
						<button type="button" class="bouton" @click="fermerListe">{{ $t('annuler') }}</button>
						<button type="button" class="bouton" @click="ajouterListe">{{ $t('ajouter') }}</button>
					</div>
				</div>
			</Transition>
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
	name: 'PRoue',
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
			redimensionnementProportionnel: true,
			titre: '',
			id: '',
			w: 0,
			h: 0,
			x: 0,
			y: 0,
			minw: 40,
			minh: 40,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { x: 0, y: 0 },
			items: ['', '', '', ''],
			copieItems: [],
			suppression: 'non',
			resultat: '',
			couleurs: ['#f84', '#8f4', '#48f', '#f8f'],
			roues: null,
			frame: null,
			tirage: false,
			sortable: '',
			modale: false,
			liste: ''
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { items: this.items, suppression: this.suppression }, echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('roue')
		if (this.panneau.contenu !== '') {
			this.items = this.panneau.contenu.items
			this.suppression = this.panneau.contenu.suppression
		}
		this.genererOptions('roue')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition') {
			setTimeout(() => {
				this.sortable = new Sortable(document.querySelector('#' + this.id + ' .conteneur .items'), {
					sort: true,
					delay: 0,
					delayOnTouchOnly: false,
					touchStartThreshold: 0,
					animation: 150,
					easing: 'cubic-bezier(1, 0, 0, 1)',
					draggable: '.item',
					handle: '.item .poignee',
					preventOnFilter: true,
					onEnd: this.synchroniserOrdre
				})
				if (this.statut !== 'min') {
					document.querySelector('#' + this.id + ' .items input')?.focus()
				}
			}, 0)
		} else {
			this.copieItems = JSON.parse(JSON.stringify(this.items))
			setTimeout(() => {
				this.canvas = document.querySelector('#roue_' + this.id)
				this.roues = null
				this.frame = null
				this.angle = 0
				this.tirage = false
				this.repeindre(this.angle)
				if (this.statut !== 'min') {
					document.querySelector('#roue_' + this.id)?.focus()
				}
			}, 0)
		}
		window.addEventListener('resize', this.gererRedimensionnement, false)
	},
	beforeUnmount () {
		window.removeEventListener('resize', this.gererRedimensionnement, false)
	},
	methods: {
		generer () {
			if (this.items.length > 1 && this.verifierItems() === true) {
				this.mode = 'lecture'
				this.w = 70
				this.h = 70
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				this.positionner()
				this.items.forEach((item, index) => {
					this.items[index] = item.trim()
				})
				this.items = this.items.filter((element) => element !== '')
				this.copieItems = JSON.parse(JSON.stringify(this.items))
				this.$nextTick(() => {
					this.sortable.destroy()
					this.canvas = document.querySelector('#roue_' + this.id)
					this.roues = null
					this.frame = null
					this.angle = 0
					this.tirage = false
					this.repeindre(this.angle)
					document.querySelector('#roue_' + this.id)?.focus()
				})
			}
		},
		editer () {
			this.mode = 'edition'
			this.resultat = ''
			this.roues = null
			this.frame = null
			this.tirage = false
			this.donnees.x = this.x
			this.donnees.y = this.y
			this.w = 60
			this.h = 48
			this.positionner()
			this.$nextTick(() => {
				this.sortable = new Sortable(document.querySelector('#' + this.id + ' .conteneur .items'), {
					sort: true,
					delay: 0,
					delayOnTouchOnly: false,
					touchStartThreshold: 0,
					animation: 150,
					easing: 'cubic-bezier(1, 0, 0, 1)',
					draggable: '.item',
					handle: '.item .poignee',
					preventOnFilter: true,
					onEnd: this.synchroniserOrdre
				})
				document.querySelector('#' + this.id + ' .bouton')?.focus()
			})
		},
		ajouterItem () {
			this.items.push('')
			this.$nextTick(() => {
				const element = document.querySelector('#' + this.id + ' .panneau-roue')
				element.scrollTop = element.scrollHeight
				const items = document.querySelectorAll('#' + this.id + ' .items .item')
				for (let i = 0; i < items.length; i++) {
					if (i === this.items.length - 1) {
						items[i].querySelector('input')?.focus()
					}
				}
			})
		},
		ajouterListe () {
			const liste = this.liste.split(',')
			if (liste.length > 0) {
				const items = JSON.parse(JSON.stringify(liste))
				this.items.push(...items)
				this.items.forEach((item, index) => {
					if (item.trim().length > 20) {
						this.items[index] = item.trim().substring(0, 20)
					} else {
						this.items[index] = item.trim()
					}
				})
				this.items = this.items.filter((element) => element !== '')
				this.copieItems = JSON.parse(JSON.stringify(this.items))
				this.$nextTick(() => {
					const element = document.querySelector('#' + this.id + ' .panneau-roue')
					element.scrollTop = element.scrollHeight
					const items = document.querySelectorAll('#' + this.id + ' .items .item')
					for (let i = 0; i < items.length; i++) {
						if (i === this.items.length - 1) {
							items[i].querySelector('input')?.focus()
						}
					}
					this.liste = ''
					this.modale = false
				})
			}
		},
		afficherListe () {
			this.modale = true
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .liste textarea')?.focus()
			}, 10)
		},
		fermerListe () {
			this.modale = false
		},
		televerserTxt (event) {
			const fichier = event.target.files[0]
			if (fichier) {
				const reader = new FileReader()
				reader.readAsText(fichier)
				reader.onloadend = (e) => {
					this.liste = e.target.result.trim()
					this.ajouterListe()
				}
			}
		},
		synchroniserOrdre (event) {
			if (event.oldIndex === event.newIndex) return
			const parent = event.from
			parent.removeChild(event.item)
			parent.insertBefore(event.item, parent.children[event.oldIndex] || null)
			const liste = [...this.items]
			const element = liste.splice(event.oldIndex, 1)[0]
			liste.splice(event.newIndex, 0, element)
			this.items = liste
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
		},
		lancer () {
			if (!this.tirage && this.copieItems.length > 2) {
				if (this.suppression === 'oui' && this.resultat !== '') {
					this.copieItems.splice(Math.round(this.resultat), 1)
					this.roues = null
					this.frame = null
					this.angle = 0
					this.repeindre(this.angle)
				}
				const max = this.copieItems.length
				this.resultat = Math.floor(Math.random() * max) + Math.random()
				this.tourner(this.resultat, 5000)
			}
		},
		repeindre (angle) {
			const largeur = this.convertirRem(this.w - 4)
			const hauteur = this.convertirRem(this.h - 7)
			let r = Math.min(largeur, hauteur) / 2.25 | 0
			let g, ctx, cx, cy
			if (this.roues === null) {
				this.roues = []
				let lettresMax = 0
				for (let selectionne = 0; selectionne < this.copieItems.length; selectionne++) {
					if (this.copieItems[selectionne].length > lettresMax) {
						lettresMax = this.copieItems[selectionne].length
					}
					let c = document.createElement('canvas')
					c.width = c.height = 2 * r + 10
					ctx = c.getContext('2d')
					cx = 5 + r
					cy = 5 + r
					g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
					g.addColorStop(0, 'rgba(0, 0, 0, 0)')
					g.addColorStop(1, 'rgba(0, 0, 0, 0.5)')
					for (let i = 0; i < this.copieItems.length; i++) {
						let a0 = 2 * Math.PI * i / this.copieItems.length
						let a1 = a0 + 2 * Math.PI / (i === 0 ? 1 : this.copieItems.length)
						let a = 2 * Math.PI * (i + 0.5) / this.copieItems.length
						ctx.beginPath()
						ctx.moveTo(cx, cy)
						ctx.arc(cx, cy, r, a0, a1, false)
						ctx.fillStyle = this.couleurs[i % 4]
						ctx.fill()
						ctx.fillStyle = g
						ctx.fill()
						ctx.save()
						if (i === selectionne) {
							ctx.fillStyle = '#fff'
							ctx.shadowColor = '#fff'
							ctx.shadowBlur = r / 20
						} else {
							ctx.fillStyle = '#aaa'
							ctx.shadowColor = '#000'
							ctx.shadowBlur = r / 100
						}
						if (lettresMax > 10) {
							ctx.font = 'bold ' + r / this.copieItems.length * (this.copieItems.length / lettresMax) + 'px serif'
						} else if (lettresMax > 6) {
							ctx.font = 'bold ' + r / this.copieItems.length * ((this.copieItems.length / 1.5) / lettresMax) + 'px serif'
						} else {
							ctx.font = 'bold ' + r / this.copieItems.length * ((this.copieItems.length / 2) / lettresMax) + 'px serif'
						}
						ctx.textAlign = 'center'
						ctx.textBaseline = 'middle'
						ctx.translate(cx, cy)
						ctx.rotate(a)
						ctx.fillText(this.copieItems[i], r * 0.55, 0)
						ctx.restore()
					}
					this.roues.push(c)
				}
			}
			if (this.frame === null) {
				this.frame = document.createElement('canvas')
				this.frame.width = this.frame.height = 10 + 2 * r * 1.25 | 0
				ctx = this.frame.getContext('2d')
				cx = this.frame.width / 2
				cy = this.frame.height / 2
				ctx.shadowOffsetX = r / 80
				ctx.shadowOffsetY = r / 80
				ctx.shadowBlur = r / 40
				ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
				ctx.beginPath()
				ctx.arc(cx, cy, r * 1.025, 0, 2 * Math.PI, true)
				ctx.arc(cx, cy, r * 0.975, 0, 2 * Math.PI, false)
				ctx.fillStyle = '#444'
				ctx.fill()
				ctx.shadowOffsetX = r / 40
				ctx.shadowOffsetY = r / 40
				g = ctx.createRadialGradient(cx -r / 7, cy - r / 7, 0, cx, cy, r / 3)
				g.addColorStop(0, '#fff')
				g.addColorStop(0.2, '#f44')
				g.addColorStop(1, '#811')
				ctx.fillStyle = g
				ctx.beginPath()
				ctx.arc(cx, cy, r / 7, 0, 2 * Math.PI, false)
				ctx.fill()
				ctx.translate(cx, cy)
				ctx.rotate(Math.PI - 0.2)
				ctx.beginPath()
				ctx.moveTo(- r * 1.1, - r * 0.05)
				ctx.lineTo(- r * 0.9, 0)
				ctx.lineTo(- r * 1.1, r * 0.05)
				ctx.fillStyle = '#f44'
				ctx.fill()
			}
			this.canvas.width = largeur
			this.canvas.height = hauteur
			cx = largeur / 2
			cy = hauteur / 2
			ctx = this.canvas.getContext('2d')
			let selectionne = (Math.floor((- 0.2 - angle) * this.copieItems.length / (2 * Math.PI)) % this.copieItems.length)
			if (selectionne < 0) {
				selectionne += this.copieItems.length
			}
			ctx.save()
			ctx.translate(cx, cy)
			ctx.rotate(angle)
			ctx.translate(-this.roues[selectionne].width / 2, -this.roues[selectionne].height / 2)
			ctx.drawImage(this.roues[selectionne], 0, 0)
			ctx.restore()
			ctx.drawImage(this.frame, cx - this.frame.width / 2, cy - this.frame.height / 2)
		},
		tourner (resultat, duree) {
			let angleFin = (-0.2) - (0.5 + resultat) * 2 * Math.PI / this.copieItems.length
			let angleDebut = this.angle - Math.floor(this.angle / (2 * Math.PI)) * 2 * Math.PI - 5 * 2 * Math.PI
			let debut = performance.now()
			const frame = () => {
				let maintenant = performance.now()
				let t = Math.min(1, (maintenant - debut) / duree)
				t = 3 * t * t - 2 * t * t * t
				this.angle = angleDebut + t * (angleFin - angleDebut)
				this.repeindre(this.angle)
				if (t < 1) {
					requestAnimationFrame(frame)
				} else {
					this.tirage = false
				}
			}
			requestAnimationFrame(frame)
			this.tirage = true
		},
		gererRedimensionnement () {
			setTimeout(() => {
				this.repeindre(this.angle)
			}, 10)
		}
	}
}
</script>

<style>
.panneau .panneau-roue .item {
	display: flex;
	align-items: center;
	margin-bottom: 1rem;
}

.panneau .panneau-roue .item .poignee {
	display: inline-flex;
	justify-content: flex-start;
	align-items: center;
	width: 3.2rem;
	flex-shrink: 0;
	cursor: move;
}

.panneau .panneau-roue .item .poignee i {
	font-size: 24px;
}

.panneau .panneau-roue .item .deplacer {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	width: 2.8rem;
	height: 2.8rem;
	min-width: 24px;
	min-height: 24px;
	margin-right: 0.5rem;
	color: #001d1d;
	background: #fff;
	border: 1px solid #ddd;
	border-radius: 50%;
	flex-shrink: 0;
	cursor: pointer;
}

.panneau .panneau-roue .item .deplacer:disabled {
	opacity: 0.4;
	cursor: default;
}

.panneau .panneau-roue .item .deplacer i {
	font-size: 1.8rem;
}

.panneau .panneau-roue .item input {
	display: inline-flex;
	flex: 1;
	min-width: 0;
	margin-left: 0.5rem;
	margin-bottom: 0!important;
}

.panneau .panneau-roue .bouton-secondaire {
	margin-bottom: 2rem;
	margin-right: 2.5rem;
}

.panneau .panneau-roue .bouton-secondaire:last-child {
	margin-right: 0;
}

.panneau .panneau-roue .oui {
	margin-right: 2.5rem;
}

.panneau .panneau-roue .choix label {
	display: inline-block;
	width: auto;
	font-size: 1.6rem;
	font-weight: 400;
    margin-left: 1rem;
	margin-bottom: 0;
}

.panneau .panneau-roue .liste {
	position: absolute;
	display: flex;
	flex-wrap: wrap;
	right: 2rem;
    bottom: 2rem;
    background: #eee;
    width: 40rem;
    padding: 2rem;
    border-radius: 1rem;
	box-shadow: 0 0.7rem 1.4rem rgba(0, 0, 0, 0.25), 0 1rem 1rem rgba(0, 0, 0, 0.22);
}

.panneau .panneau-roue .liste textarea {
	max-height: 18rem;
	height: 18rem;
}

.panneau .panneau-roue .liste .actions {
	text-align: center;
}
</style>
