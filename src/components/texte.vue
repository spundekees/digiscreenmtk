<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-texte">
			<div class="contenu edition" v-if="mode === 'edition'">
				<div class="editeur" :style="{'font-size': convertirRem(taille) + 'px'}" />
				<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
			</div>
			<div class="contenu" v-else>
				<div class="texte" :style="{'font-size': convertirRem(taille) + 'px'}" v-html="texte" />
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
import linkifyHtml from 'linkify-html'

export default {
	name: 'PTexte',
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
			minw: 68,
			minh: 46,
			statut: '',
			dimensions: {},
			position: {},
			donnees: { w: 0, h: 0, x: 0, y: 0 },
			editeur: '',
			texte: '',
			fonte: 'Andika',
			taille: 3.2,
			couleurFond: '#ffffff'
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { texte: this.texte, fonte: this.fonte, taille: this.taille, couleurFond: this.couleurFond }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('texte')
		if (typeof this.panneau.contenu === 'object' && this.panneau.contenu.constructor === Object) {
			this.texte = this.panneau.contenu.texte
			if (this.panneau.contenu.hasOwnProperty('fonte')) {
				this.fonte = this.panneau.contenu.fonte
			}
			this.taille = this.panneau.contenu.taille
			this.couleurFond = this.panneau.contenu.couleurFond
		} else if (this.panneau.contenu !== '') {
			this.texte = this.formaterHTML(this.panneau.contenu)
		}
		if (this.mode === 'lecture') {
			this.minw = 27
			this.minh = 8
			this.$nextTick(() => {
				window.typesetMathJax()
			})
		}
		this.genererOptions('texte')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		setTimeout(() => {
			if (this.mode === 'edition') {
				this.creer()
			} else if (this.mode === 'lecture' && this.couleurFond !== '#ffffff') {
				document.querySelector('#' + this.id + ' .jsPanel-hdr').style.background = this.couleurFond
				document.querySelector('#' + this.id + ' .jsPanel-content').style.background = this.couleurFond
			}
		}, 0)
	},
	methods: {
		generer () {
			if (this.texte !== '') {
				this.mode = 'lecture'
				this.editeur = ''
				if (this.donnees.w > 0 && this.donnees.h > 0) {
					this.w = this.donnees.w
					this.h = this.donnees.h
				} else {
					this.w = 30
					this.h = 20
				}
				if (this.donnees.x > 0 && this.donnees.y > 0) {
					this.x = this.donnees.x
					this.y = this.donnees.y
				}
				this.minw = 27
				this.minh = 8
				this.$nextTick(() => {
					document.querySelector('#' + this.id)?.focus()
				})
				this.positionner()
				if (this.couleurFond !== '#ffffff') {
					document.querySelector('#' + this.id + ' .jsPanel-hdr').style.background = this.couleurFond
					document.querySelector('#' + this.id + ' .jsPanel-content').style.background = this.couleurFond
				}
				this.$nextTick(() => {
					window.typesetMathJax()
				})
			}
		},
		editer () {
			this.mode = 'edition'
			this.$nextTick(() => {
				this.creer()
				this.donnees.w = this.w
				this.donnees.h = this.h
				this.donnees.x = this.x
				this.donnees.y = this.y
				this.w = 68
				this.h = 46
				this.minw = 68
				this.minh = 46
				this.positionner()
				document.querySelector('#' + this.id + ' .jsPanel-hdr').style.background = '#ffffff'
				document.querySelector('#' + this.id + ' .jsPanel-content').style.background = '#ffffff'
			})
		},
		creer () {
			this.editeur = pell.init({
				element: document.querySelector('#' + this.id + ' .editeur'),
				onChange: (html) => {
					this.texte = this.formaterHTML(html)
				},
				actions: [
					{ name: 'taille-plus', title: this.$t('tailleTextePlus'), icon: '<i class="material-icons" aria-hidden="true">add</i>', result: () => this.augmenterTaille() },
					{ name: 'taille-moins', title: this.$t('tailleTexteMoins'), icon: '<i class="material-icons" aria-hidden="true">remove</i>', result: () => this.reduireTaille() },
					{ name: 'fonte', title: '', icon: '<select id="fonte-' + this.id + '"><option value="Andika">Druckschrift</option><option value="Playwrite DE Grund">Grundschrift</option><option value="Luciole">Luciole</option><option value="InclusiveSans">Inclusive Sans</option><option value="MonaSans">Mona Sans</option><option value="RobotoSerif">Roboto Serif</option><option value="RobotoMono">Roboto Mono</option><option value="OpenDyslexic">OpenDyslexic</option></select>', result: () => void 0 },
					{ name: 'gras', shortcut: 'b', title: this.$t('gras'), icon: '<i class="material-icons" aria-hidden="true">format_bold</i>', result: () => pell.exec('bold') },
					{ name: 'italique', shortcut: 'i', title: this.$t('italique'), icon: '<i class="material-icons" aria-hidden="true">format_italic</i>', result: () => pell.exec('italic') },
					{ name: 'souligner', shortcut: 'u', title: this.$t('souligner'), icon: '<i class="material-icons" aria-hidden="true">format_underlined</i>', result: () => pell.exec('underline') },
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
					{ name: 'listedecimale', shortcut: 'shift+7', title: this.$t('listeDecimale'), icon: '<i class="material-icons" aria-hidden="true">format_list_numbered</i>', result: () => pell.exec('insertOrderedList') },
					{ name: 'liste', shortcut: 'shift+8', title: this.$t('liste'), icon: '<i class="material-icons" aria-hidden="true">format_list_bulleted</i>', result: () => pell.exec('insertUnorderedList') },
					{ name: 'lien', shortcut: 'k', title: this.$t('lien'), icon: '<i class="material-icons" aria-hidden="true">link</i>', result: () => {
						let i = 0
						let lienActuel = ''
						let element = window.getSelection()?.focusNode?.parentNode ?? null
						while (i < 6 && lienActuel === '' && element !== null) {
							if (element.href && element.href !== null) {
								lienActuel = element.href
							} else {
								element = element.parentNode
							}
							i++
						}
						if (lienActuel !== '') {
							const range = document.createRange()
							range.selectNodeContents(element)
							const selection = window.getSelection()
							selection.removeAllRanges()
							selection.addRange(range)
						}
						const url = window.prompt(this.$t('adresseLien'), lienActuel)
						if (url && url !== '') {
							pell.exec('createLink', url)
						} else if (url === '') {
							pell.exec('unlink')
						}
					} },
					{ name: 'aligner-gauche', shortcut: 'shift+l', title: this.$t('alignerGauche'), icon: '<i class="material-icons" aria-hidden="true">format_align_left</i>', result: () => pell.exec('JustifyLeft') },
					{ name: 'centrer', shortcut: 'shift+e', title: this.$t('centrer'), icon: '<i class="material-icons" aria-hidden="true">format_align_center</i>', result: () => pell.exec('JustifyCenter') },
					{ name: 'aligner-droite', shortcut: 'shift+r', title: this.$t('alignerDroite'), icon: '<i class="material-icons" aria-hidden="true">format_align_right</i>', result: () => pell.exec('JustifyRight') },
					{ name: 'couleur-fond', title: this.$t('couleurFond'), icon: '<i class="material-icons couleur couleur-fond" aria-hidden="true">format_color_fill</i>', result: () => {
						const champ = document.querySelector('#couleur-fond-' + this.id)
						if (champ === null) {
							return
						}
						champ.value = this.couleurFond
						this.ouvrirSelecteurCouleur(champ)
					} },
					{ name: 'supprimer-formatage', title: this.$t('supprimerFormatage'), icon: '<i class="material-icons" aria-hidden="true">format_clear</i>', result: () => {
						pell.exec('removeFormat')
					} }
				],
				label: this.$t('texte'),
				actionbarLabel: this.$t('miseEnForme'),
				keyLabels: { ctrl: this.$t('toucheCtrl'), shift: this.$t('toucheMaj') }
			})
			this.editeur.content.innerHTML = this.formaterHTML(this.texte)
			this.editeur.content.onpaste = (event) => {
				event.preventDefault()
				event.stopPropagation()
				const html = this.nettoyerCollage(event.clipboardData.getData('text/html'))
				if (html !== '') {
					pell.exec('insertHTML', html)
				} else {
					pell.exec('insertText', event.clipboardData.getData('text/plain'))
				}
			}
			document.querySelector('#' + this.id + ' .editeur .pell-content').style.backgroundColor = this.couleurFond
			const champFonte = document.querySelector('#fonte-' + this.id)
			champFonte.closest('button')?.replaceWith(champFonte)
			champFonte.setAttribute('aria-label', this.$t('fonte'))
			champFonte.value = this.fonte
			champFonte.addEventListener('change', this.modifierFonte)
			this.initialiserChampCouleur(this.editeur, 'texte', 'couleur-texte-' + this.id)
			this.initialiserChampCouleur(this.editeur, 'fond', 'couleur-fond-' + this.id)
			if (this.texte === '') {
				document.querySelector('#' + this.id + ' .pell-content')?.focus()
			}
		},
		nettoyerCollage (html) {
			if (html === '') {
				return ''
			}
			const source = new DOMParser().parseFromString(html, 'text/html')
			this.convertirListesWord(source)
			const conteneur = source.createElement('div')
			this.copierNoeudsCollage(source.body, conteneur)
			return DOMPurify.sanitize(conteneur.innerHTML).trim()
		},
		convertirListesWord (source) {
			let pile = []
			let identifiantPrecedent = ''
			source.querySelectorAll('p[style*="mso-list"]').forEach((paragraphe) => {
				const correspondance = paragraphe.getAttribute('style').match(/mso-list:\s*(l\d+)\s+level(\d+)(?:\s+(lfo\d+))?/i)
				if (correspondance === null) {
					return
				}
				const identifiant = correspondance[1] + (correspondance[3] ?? '')
				const niveau = parseInt(correspondance[2], 10)
				const type = /^\s*\w+[.)]/.test(this.extraireMarqueurWord(paragraphe)) ? 'ol' : 'ul'
				if (paragraphe.previousElementSibling !== pile[0] || identifiant !== identifiantPrecedent) {
					pile = []
				}
				identifiantPrecedent = identifiant
				pile.length = Math.min(pile.length, niveau)
				if (pile.length === niveau && pile[niveau - 1].localName !== type) {
					pile.length = niveau - 1
				}
				while (pile.length < niveau) {
					const liste = source.createElement(type)
					if (pile.length === 0) {
						paragraphe.before(liste)
					} else {
						const parent = pile[pile.length - 1]
						if (parent.lastElementChild === null) {
							parent.append(source.createElement('li'))
						}
						parent.lastElementChild.append(liste)
					}
					pile.push(liste)
				}
				const item = source.createElement('li')
				item.append(...paragraphe.childNodes)
				pile[pile.length - 1].append(item)
				paragraphe.remove()
			})
		},
		extraireMarqueurWord (paragraphe) {
			const source = paragraphe.ownerDocument
			const iterateur = source.createNodeIterator(paragraphe, NodeFilter.SHOW_COMMENT)
			let debut = null
			let fin = null
			let noeud = iterateur.nextNode()
			while (noeud !== null && fin === null) {
				if (debut === null && noeud.data.includes('supportLists')) {
					debut = noeud
				} else if (debut !== null && noeud.data.includes('endif')) {
					fin = noeud
				}
				noeud = iterateur.nextNode()
			}
			const plage = source.createRange()
			if (fin !== null) {
				plage.setStartBefore(debut)
				plage.setEndAfter(fin)
			} else {
				const element = paragraphe.querySelector('[style*="mso-list:ignore" i]')
				if (element === null) {
					return ''
				}
				plage.selectNode(element)
			}
			const marqueur = plage.toString()
			plage.deleteContents()
			return marqueur
		},
		copierNoeudsCollage (origine, cible) {
			const balisesIgnorees = ['script', 'style', 'title', 'meta', 'link', 'noscript', 'template', 'iframe', 'object', 'embed', 'svg', 'math', 'xml']
			const balisesConservees = ['a', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'sub', 'sup', 'font', 'span', 'div', 'br', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th']
			const balisesBloc = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'section', 'article', 'header', 'footer', 'address', 'dt', 'dd']
			origine.childNodes.forEach((noeud) => {
				if (noeud.nodeType === Node.TEXT_NODE) {
					cible.append(noeud.textContent)
					return
				}
				if (noeud.nodeType !== Node.ELEMENT_NODE || balisesIgnorees.includes(noeud.localName)) {
					return
				}
				const nom = balisesBloc.includes(noeud.localName) ? 'div' : noeud.localName === 'del' ? 's' : noeud.localName
				if (!balisesConservees.includes(nom)) {
					this.copierNoeudsCollage(noeud, cible)
					return
				}
				const element = noeud.ownerDocument.createElement(nom)
				this.copierAttributsCollage(noeud, element)
				if (['a', 'font', 'span'].includes(nom) && element.attributes.length === 0) {
					this.copierNoeudsCollage(noeud, cible)
					return
				}
				this.copierNoeudsCollage(noeud, element)
				cible.append(element)
			})
		},
		copierAttributsCollage (origine, element) {
			const styles = this.extraireStylesCollage(origine)
			if (/^h[1-6]$/.test(origine.localName) && origine.style.fontWeight === '') {
				styles.push('font-weight: bold')
			}
			if (styles.length > 0) {
				element.setAttribute('style', styles.join('; '))
			}
			if (origine.localName === 'a' && origine.hasAttribute('href')) {
				element.setAttribute('href', origine.getAttribute('href'))
			} else if (origine.localName === 'font' && this.verifierCouleurCollage(origine.getAttribute('color') ?? '', 'texte')) {
				element.setAttribute('color', origine.getAttribute('color'))
			} else if (['td', 'th'].includes(origine.localName)) {
				['colspan', 'rowspan'].forEach((attribut) => {
					if (origine.hasAttribute(attribut)) {
						element.setAttribute(attribut, origine.getAttribute(attribut))
					}
				})
			}
		},
		extraireStylesCollage (element) {
			const style = element.style
			const styles = []
			if (this.verifierCouleurCollage(style.color, 'texte')) {
				styles.push('color: ' + style.color)
			}
			if (this.verifierCouleurCollage(style.backgroundColor, 'fond')) {
				styles.push('background-color: ' + style.backgroundColor)
			}
			if (/^(bold|bolder|normal|[1-9]00)$/.test(style.fontWeight)) {
				styles.push('font-weight: ' + style.fontWeight)
			}
			if (/^(italic|oblique|normal)$/.test(style.fontStyle)) {
				styles.push('font-style: ' + style.fontStyle)
			}
			const decorations = style.textDecorationLine.split(' ').filter((decoration) => ['underline', 'line-through'].includes(decoration))
			if (decorations.length > 0) {
				styles.push('text-decoration: ' + decorations.join(' '))
			}
			const alignement = style.textAlign !== '' ? style.textAlign : (element.getAttribute('align') ?? '').toLowerCase()
			if (['left', 'center', 'right', 'justify'].includes(alignement)) {
				styles.push('text-align: ' + alignement)
			}
			if (['super', 'sub'].includes(style.verticalAlign)) {
				styles.push('vertical-align: ' + style.verticalAlign)
			}
			return styles
		},
		verifierCouleurCollage (couleur, type) {
			const valeur = couleur.toLowerCase().replace(/\s/g, '')
			const valeursCommunes = ['', 'auto', 'none', 'inherit', 'initial', 'unset', 'currentcolor', 'transparent', 'rgba(0,0,0,0)']
			const valeursTexte = ['black', '#000', '#000000', 'rgb(0,0,0)', 'windowtext']
			const valeursFond = ['white', '#fff', '#ffffff', 'rgb(255,255,255)', 'window']
			return !valeur.includes('var(') && !valeursCommunes.includes(valeur) && !(type === 'texte' ? valeursTexte : valeursFond).includes(valeur)
		},
		formaterHTML (html) {
			html = linkifyHtml(html, {
				defaultProtocol: 'https',
				truncate: 50,
				rel: 'noreferrer',
				target: '_blank'
			})
			html = DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] })
			const div = document.createElement('div')
			div.innerHTML = html
			div.querySelectorAll('a[href]').forEach((lien) => {
				lien.setAttribute('target', '_blank')
				lien.setAttribute('rel', 'noreferrer')
			})
			return div.innerHTML
		},
		modifierCouleurTexte (event) {
			pell.exec('foreColor', event.target.value)
		},
		initialiserChampCouleur (editeur, type, id) {
			const icone = editeur?.querySelector(type === 'texte' ? '.couleur-texte' : '.couleur-fond') ?? null
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
				if (type === 'texte') {
					champ.addEventListener('input', this.modifierCouleurTexte)
					champ.addEventListener('change', this.modifierCouleurTexte)
				} else if (type === 'fond') {
					champ.addEventListener('input', this.modifierCouleurFond)
					champ.addEventListener('change', this.modifierCouleurFond)
				}
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
		modifierCouleurFond (event) {
			document.querySelector('#' + this.id + ' .editeur .pell-content').style.backgroundColor = event.target.value
			this.couleurFond = event.target.value
		},
		modifierFonte (event) {
			this.fonte = event.target.value
		},
		augmenterTaille () {
			if (this.taille < 10) {
				this.taille = this.taille + 0.2
			}
		},
		reduireTaille () {
			if (this.taille > 1) {
				this.taille = this.taille - 0.2
			}
		},
		annulerTaille () {
			this.taille = 3.2
		}
	}
}
</script>

<style>
.panneau .panneau-texte .edition {
	width: 100%;
	height: 100%;
}

.panneau .panneau-texte .texte {
	font-family: v-bind('fonte');
	font-weight: 400;
	line-height: 1.4;
	text-align: left;
	user-select: none;
}

.panneau .panneau-texte .texte a {
	color: #0000ee!important;
	text-decoration: underline!important;
}

.panneau .panneau-texte .editeur {
	height: calc(100% - 6rem);
	border-bottom: 1px solid #ddd;
}

.panneau .panneau-texte .editeur,
.panneau .panneau-texte .pell-content {
    box-sizing: border-box;
}

.panneau .panneau-texte .pell-content {
	font-family: v-bind('fonte');
    height: calc(100% - 4.5rem);
	width: 100%;
	outline: 0;
	line-height: 1.5;
	margin: 3px 0;
	padding: calc(2rem - 3px) 1rem;
	text-align: left;
	overflow: auto;
	cursor: text;
}

.panneau .panneau-texte .pell-content a {
	color: #0000ee!important;
	text-decoration: underline!important;
}

.panneau .panneau-texte ul,
.panneau .panneau-texte ol {
	list-style-position: outside;
	padding-left: 1.25em;
}

.panneau .panneau-texte table {
	border-collapse: collapse;
}

.panneau .panneau-texte td,
.panneau .panneau-texte th {
	border: 1px solid #ddd;
	padding: 0.25em 0.5em;
}

.panneau .panneau-texte .pell-actionbar {
	position: sticky;
	top: 0;
	display: flex;
	justify-content: center;
	align-items: center;
    background-color: #fff;
	border-bottom: 1px solid #ddd;
	height: 4.5rem;
}

.panneau .panneau-texte .pell-button {
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

.panneau .panneau-texte .pell-button-selected {
    background-color: #f0f0f0;
}

.panneau .panneau-texte .pell-button:focus {
	outline: 2px solid #ed5b00;
  	outline-offset: 1px;
}

.panneau .panneau-texte .pell-button .couleur {
	font-size: 2.2rem!important;
	font-weight: 400!important;
	margin: 0!important;
	width: 2.2rem!important;
}

.panneau .panneau-texte select {
	height: 2.4rem;
	width: 14rem!important;
	padding: 0 2.6rem 0 1rem!important;
	line-height: 1!important;
}
</style>
