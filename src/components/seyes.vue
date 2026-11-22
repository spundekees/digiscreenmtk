<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-seyes">
			<div class="contenu">
				<div class="editeur" />
			</div>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'
import DOMPurify from 'dompurify'

export default {
	name: 'PSeyes',
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
			redimensionnement: true,
			titre: '',
			id: '',
			w: 0,
			h: 0,
			x: 0,
			y: 0,
			minw: 60,
			minh: 46,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			editeur: '',
			texte: '',
			fonte: 'Marelle',
			tailleTexte: '4rem',
			tailleCarreau: '7.5rem',
			marge: '1.8rem',
			epaisseurSoulignage: '0.4rem',
			decalageSoulignage: '1.475rem',
			echelle: 1
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { texte: this.texte, fonte: this.fonte, echelle: this.echelle }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('Seyes')
		if (this.panneau.contenu !== '') {
			this.texte = this.formaterHTML(this.panneau.contenu.texte)
			this.fonte = this.panneau.contenu.fonte
			this.echelle = this.panneau.contenu.echelle
			this.definirVariables()
		}
		this.genererOptions('seyes')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		setTimeout(() => {
			this.creer()
		}, 0)
	},
	methods: {
		creer () {
			this.editeur = pell.init({
				element: document.querySelector('#' + this.id + ' .editeur'),
				onChange: (html) => {
					this.texte = this.formaterHTML(html)
				},
				actions: [
					{ name: 'taille-plus', title: this.$t('tailleTextePlus'), icon: '<i class="material-icons" aria-hidden="true">add</i>', result: () => this.augmenterTaille() },
					{ name: 'taille-moins', title: this.$t('tailleTexteMoins'), icon: '<i class="material-icons" aria-hidden="true">remove</i>', result: () => this.reduireTaille() },
					{ name: 'fonte', title: '', icon: '<select id="fonte-' + this.id + '"><option value="Marelle">Marelle</option><option value="Marelle2">Marelle2</option><option value="MarelleBaton">MarelleBaton</option><option value="MarelleBaton2">MarelleBaton2</option></select>', result: () => void 0 },
					{ name: 'souligner-noir', shortcut: 'u', title: this.$t('soulignerNoir'), icon: '<i class="material-icons" aria-hidden="true">format_underlined</i>', result: () => {
						const focusNode = window.getSelection()?.focusNode
						if (!focusNode) return
						if (focusNode.parentNode?.tagName === 'U' || focusNode.parentNode?.parentNode?.tagName === 'U') {
							pell.exec('removeFormat')
						}
						pell.exec('underline')
						const element = window.getSelection()?.focusNode?.parentNode
						if (element?.tagName === 'U') {
							element.className = ''
							element.classList.add('noir')
						}
					} },
					{ name: 'souligner-rouge', title: this.$t('soulignerRouge'), icon: '<i class="material-icons" style="color: red;" aria-hidden="true">format_underlined</i>', result: () => {
						const focusNode = window.getSelection()?.focusNode
						if (!focusNode) return
						if (focusNode.parentNode?.tagName === 'U' || focusNode.parentNode?.parentNode?.tagName === 'U') {
							pell.exec('removeFormat')
						}
						pell.exec('underline')
						const element = window.getSelection()?.focusNode?.parentNode
						if (element?.tagName === 'U') {
							element.className = ''
							element.classList.add('rouge')
						}
					} },
					{ name: 'souligner-vert', title: this.$t('soulignerVert'), icon: '<i class="material-icons" style="color: green;" aria-hidden="true">format_underlined</i>', result: () => {
						const focusNode = window.getSelection()?.focusNode
						if (!focusNode) return
						if (focusNode.parentNode?.tagName === 'U' || focusNode.parentNode?.parentNode?.tagName === 'U') {
							pell.exec('removeFormat')
						}
						pell.exec('underline')
						const element = window.getSelection()?.focusNode?.parentNode
						if (element?.tagName === 'U') {
							element.className = ''
							element.classList.add('vert')
						}
					} },
					{ name: 'souligner-bleu', title: this.$t('soulignerBleu'), icon: '<i class="material-icons" style="color: blue;" aria-hidden="true">format_underlined</i>', result: () => {
						const focusNode = window.getSelection()?.focusNode
						if (!focusNode) return
						if (focusNode.parentNode?.tagName === 'U' || focusNode.parentNode?.parentNode?.tagName === 'U') {
							pell.exec('removeFormat')
						}
						pell.exec('underline')
						const element = window.getSelection()?.focusNode?.parentNode
						if (element?.tagName === 'U') {
							element.className = ''
							element.classList.add('bleu')
						}
					} },
					{ name: 'barrer', shortcut: 'shift+x', title: this.$t('barrer'), icon: '<i class="material-icons" aria-hidden="true">format_strikethrough</i>', result: () => pell.exec('strikethrough') },
					{ name: 'exposant', title: this.$t('exposant'), icon: '<i class="material-icons" aria-hidden="true">superscript</i>', result: () => pell.exec('superscript') },
					{ name: 'couleur-texte', title: this.$t('couleurTexte'), icon: '<i class="material-icons couleur couleur-texte" aria-hidden="true">format_color_text</i>', result: () => {
						let i = 0
						let couleurActuelle = ''
						let element = window.getSelection()?.focusNode?.parentNode ?? null
						while (i < 6 && couleurActuelle === '' && element !== null) {
							if (element.tagName === 'FONT' && element.color !== null) {
								couleurActuelle = element.color
							} else {
								element = element.parentNode
							}
							i++
						}
						const champ = document.querySelector('#couleur-texte-' + this.id)
						if (champ === null) {
							return
						}
						champ.value = couleurActuelle !== '' ? couleurActuelle : '#001d1d'
						this.ouvrirSelecteurCouleur(champ)
					} },
					{ name: 'aligner-gauche', shortcut: 'shift+l', title: this.$t('alignerGauche'), icon: '<i class="material-icons" aria-hidden="true">format_align_left</i>', result: () => pell.exec('JustifyLeft') },
					{ name: 'centrer', shortcut: 'shift+e', title: this.$t('centrer'), icon: '<i class="material-icons" aria-hidden="true">format_align_center</i>', result: () => pell.exec('JustifyCenter') },
					{ name: 'aligner-droite', shortcut: 'shift+r', title: this.$t('alignerDroite'), icon: '<i class="material-icons" aria-hidden="true">format_align_right</i>', result: () => pell.exec('JustifyRight') },
					{ name: 'supprimer-formatage', title: this.$t('supprimerFormatage'), icon: '<i class="material-icons" aria-hidden="true">format_clear</i>', result: () => {
						pell.exec('removeFormat')
					} }
				],
				label: this.$t('texte') + ' (Seyes)',
				actionbarLabel: this.$t('miseEnForme'),
				keyLabels: { ctrl: this.$t('toucheCtrl'), shift: this.$t('toucheMaj') }
			})
			this.editeur.content.innerHTML = this.formaterHTML(this.texte)
			this.editeur.content.onpaste = (event) => {
				event.preventDefault()
				event.stopPropagation()
				pell.exec('insertText', event.clipboardData.getData('text/plain'))
			}
			const champFonte = document.querySelector('#fonte-' + this.id)
			champFonte.closest('button')?.replaceWith(champFonte)
			champFonte.setAttribute('aria-label', this.$t('fonte'))
			champFonte.value = this.fonte
			champFonte.addEventListener('change', this.modifierFonte)
			this.initialiserChampCouleur(this.editeur, 'couleur-texte-' + this.id)
			if (this.texte === '') {
				document.querySelector('#' + this.id + ' .pell-content')?.focus()
			}
		},
		formaterHTML (html) {
			return DOMPurify.sanitize(html)
		},
		modifierCouleurTexte (event) {
			pell.exec('foreColor', event.target.value)
		},
		initialiserChampCouleur (editeur, id) {
			const icone = editeur?.querySelector('.couleur-texte') ?? null
			if (icone === null) {
				return
			}
			const bouton = icone.closest('button')
			if (bouton === null) {
				return
			}
			let champ = document.querySelector('#' + id)
			if (champ === null) {
				champ = document.createElement('input')
				champ.type = 'color'
				champ.id = id
				champ.tabIndex = -1
				champ.setAttribute('aria-hidden', 'true')
				champ.style.cssText = 'position: absolute; left: 0; top: 0; width: 100%; height: 100%; padding: 0; margin: 0; border: 0; opacity: 0; pointer-events: none;'
				champ.addEventListener('input', this.modifierCouleurTexte)
				champ.addEventListener('change', this.modifierCouleurTexte)
			}
			champ.boutonCouleur = bouton
			if (getComputedStyle(bouton.parentNode).position === 'static') {
				bouton.parentNode.style.position = 'relative'
			}
			bouton.parentNode.prepend(champ)
		},
		ouvrirSelecteurCouleur (champ) {
			if (!champ) {
				return
			}
			const bouton = champ.boutonCouleur
			if (bouton) {
				champ.style.left = bouton.offsetLeft + 'px'
				champ.style.top = bouton.offsetTop + 'px'
				champ.style.width = bouton.offsetWidth + 'px'
				champ.style.height = bouton.offsetHeight + 'px'
			}
			try {
				if (typeof champ.showPicker === 'function') {
					champ.showPicker()
				} else {
					champ.click()
				}
			} catch {
				champ.click()
			}
		},
		modifierFonte (event) {
			this.fonte = event.target.value
		},
		augmenterTaille () {
			if (this.echelle < 2.5) {
				this.echelle = this.echelle + 0.1
				this.definirVariables()
			}
		},
		reduireTaille () {
			if (this.echelle > 0.6) {
				this.echelle = this.echelle - 0.1
				this.definirVariables()
			}
		},
		definirVariables () {
			this.tailleTexte = 4 * this.echelle + 'rem'
			this.tailleCarreau = 7.5 * this.echelle + 'rem'
			this.marge = 1.8 * this.echelle + 'rem'
			this.epaisseurSoulignage = 0.4 * this.echelle + 'rem'
			this.decalageSoulignage = 1.475 * this.echelle + 'rem'
		}
	}
}
</script>

<style>
.panneau .panneau-seyes .contenu {
	width: 100%;
	height: 100%;
}

.panneau .panneau-seyes .editeur {
	height: 100%;
}

.panneau .panneau-seyes .editeur,
.panneau .panneau-seyes .pell-content {
    box-sizing: border-box;
}

.panneau .panneau-seyes .pell-content {
	font-family: v-bind('fonte');
	font-size: v-bind('tailleTexte');
	text-align: left;
    height: calc(100% - 4.5rem);
	width: 100%;
	outline: 0;
	line-height: v-bind('tailleCarreau');
	margin: 0;
	padding: v-bind('marge');
	background: url('@/assets/img/seyes.svg');
	background-repeat: repeat;
	background-size: v-bind('tailleCarreau');
	background-position: 0 0;
	cursor: text;
	overflow: auto;
}

.panneau .panneau-seyes .pell-content u.noir {
	text-decoration: underline solid #001d1d v-bind('epaisseurSoulignage');
  	text-underline-offset: v-bind('decalageSoulignage');
}

.panneau .panneau-seyes .pell-content u.rouge {
	text-decoration: underline solid red v-bind('epaisseurSoulignage');
  	text-underline-offset: v-bind('decalageSoulignage');
}

.panneau .panneau-seyes .pell-content u.vert {
	text-decoration: underline solid green v-bind('epaisseurSoulignage');
  	text-underline-offset: v-bind('decalageSoulignage');
}

.panneau .panneau-seyes .pell-content u.bleu {
	text-decoration: underline solid blue v-bind('epaisseurSoulignage');
  	text-underline-offset: v-bind('decalageSoulignage');
}

.panneau .panneau-seyes .pell-content strike {
	text-decoration-thickness: v-bind('epaisseurSoulignage');
}

.panneau .panneau-seyes .pell-actionbar {
	position: sticky;
	top: 0;
	display: flex;
	justify-content: center;
	align-items: center;
    background-color: #fff;
	border-bottom: 1px solid #ddd;
	height: 4.5rem;
	z-index: 1;
}

.panneau .panneau-seyes .pell-button {
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 2.4rem;
    height: 3.4rem;
    width: auto;
	padding: 0 0.5rem;
	background-color: transparent;
    border: none;
	line-height: 1;
    cursor: pointer;
}

.panneau .panneau-seyes .pell-button:focus {
	outline: 2px solid #ed5b00;
  	outline-offset: 1px;
}

.panneau .panneau-seyes .pell-button-selected {
    background-color: #f0f0f0;
}

.panneau .panneau-seyes .pell-button .couleur {
	font-size: 2.2rem!important;
	font-weight: 400!important;
	margin: 0!important;
	width: 2.2rem!important;
}

.panneau .panneau-seyes select {
	height: 2.4rem;
	padding: 0 3rem 0 1.5rem!important;
	line-height: 1!important;
}
</style>
