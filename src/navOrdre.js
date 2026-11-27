// Reihenfolge der Modul-Knöpfe in der unteren Leiste (Medienzentrum MTK)
// – Reihenfolge = Reihenfolge im Array `modules` (wird schon gespeichert und in .dgs-Dateien mitgegeben)
// – Knopf gedrückt halten (Maus: ziehen) und an eine andere Stelle schieben
export const ORDRE_MODULES = Object.freeze(['codeqr', 'texte', 'seyes', 'tableau', 'image', 'galerie', 'dessin', 'document', 'audio', 'enregistrement', 'synthese', 'video', 'webcam', 'partage-ecran', 'lien', 'iframe', 'html', 'liste', 'nuage', 'ordre', 'images-sequentielles', 'trous', 'surlignage', 'mot-mystere', 'cartes', 'appariement', 'categories', 'tirage-texte', 'tirage-nombre', 'tirage-image', 'tirage-audio', 'roue', 'histoire', 'plateau', 'des', 'classement', 'feu', 'modalites', 'groupes', 'humeur', 'chrono', 'rebours', 'sablier', 'horloge-modulable', 'horloge', 'calendrier', 'sonometre', 'retroaction', 'grille'])

const DELAI_APPUI_LONG = 450
const SEUIL_SOURIS = 8
const SEUIL_TOUCHER = 12

export default {
	data () {
		return {
			gesteModule: null
		}
	},
	mounted () {
		document.addEventListener('pointerdown', this.navModuleDebut, true)
	},
	beforeUnmount () {
		document.removeEventListener('pointerdown', this.navModuleDebut, true)
		this.navModuleNettoyer()
	},
	methods: {
		appliquerOrdreModules () {
			const nav = document.querySelector('nav')
			if (!nav) {
				return
			}
			Array.from(nav.children).forEach((element, index) => {
				const module = element.dataset ? element.dataset.module : undefined
				const position = module ? this.modules.indexOf(module) : -1
				element.style.order = position > -1 ? position : 1000 + index
			})
		},
		insererModule (module) {
			// Neu eingeschaltetes Modul an seiner üblichen Stelle einsortieren statt ganz hinten
			const rang = ORDRE_MODULES.indexOf(module)
			const index = this.modules.findIndex(m => ORDRE_MODULES.indexOf(m) > rang)
			if (index === -1) {
				this.modules.push(module)
			} else {
				this.modules.splice(index, 0, module)
			}
		},
		enregistrerOrdreModules () {
			try {
				localStorage.setItem('digiscreen_modules', JSON.stringify(this.modules))
			} catch {}
		},
		deplacerModule (module, versIndex) {
			const depuis = this.modules.indexOf(module)
			if (depuis === -1 || versIndex < 0 || versIndex >= this.modules.length || depuis === versIndex) {
				return
			}
			const modules = this.modules.slice()
			modules.splice(depuis, 1)
			modules.splice(versIndex, 0, module)
			this.modules = modules
			this.enregistrerOrdreModules()
		},
		reinitialiserOrdreModules () {
			this.modules = this.modules.slice().sort((a, b) => ORDRE_MODULES.indexOf(a) - ORDRE_MODULES.indexOf(b))
			this.enregistrerOrdreModules()
		},
		navModuleDebut (event) {
			const bouton = event.target.closest ? event.target.closest('nav button[data-module]') : null
			if (!bouton || bouton.disabled || this.lectureSeule || (event.button !== undefined && event.button > 0)) {
				return
			}
			this.navModuleNettoyer()
			this.gesteModule = { bouton, module: bouton.dataset.module, x: event.clientX, y: event.clientY, id: event.pointerId, type: event.pointerType, actif: false, timer: null }
			if (event.pointerType !== 'mouse') {
				this.gesteModule.timer = setTimeout(() => this.navModuleActiver(), DELAI_APPUI_LONG)
			}
			window.addEventListener('pointermove', this.navModuleMouvement, true)
			window.addEventListener('pointerup', this.navModuleFin, true)
			window.addEventListener('pointercancel', this.navModuleFin, true)
			window.addEventListener('contextmenu', this.navModuleContexte, true)
		},
		navModuleActiver () {
			const geste = this.gesteModule
			if (!geste || geste.actif) {
				return
			}
			geste.actif = true
			geste.bouton.classList.add('module-ziehen')
			document.querySelector('nav')?.classList.add('modules-sortieren')
			try {
				geste.bouton.setPointerCapture(geste.id)
			} catch {}
		},
		navModuleMouvement (event) {
			const geste = this.gesteModule
			if (!geste || event.pointerId !== geste.id) {
				return
			}
			const distance = Math.hypot(event.clientX - geste.x, event.clientY - geste.y)
			if (!geste.actif) {
				if (geste.type === 'mouse' && distance > SEUIL_SOURIS) {
					this.navModuleActiver()
				} else if (geste.type !== 'mouse' && distance > SEUIL_TOUCHER) {
					// Finger bewegt sich vor dem langen Drücken: kein Sortieren
					this.navModuleNettoyer()
				}
				return
			}
			event.preventDefault()
			const cible = document.elementsFromPoint(event.clientX, event.clientY).find(element => element.matches && element.matches('nav button[data-module]') && element !== geste.bouton)
			if (cible) {
				this.deplacerModule(geste.module, this.modules.indexOf(cible.dataset.module))
			}
		},
		navModuleFin (event) {
			const geste = this.gesteModule
			if (!geste || (event && event.pointerId !== geste.id)) {
				return
			}
			if (geste.actif) {
				// Den Klick nach dem Ziehen nicht als „Modul öffnen“ werten
				const bloquer = (e) => {
					e.stopPropagation()
					e.preventDefault()
				}
				window.addEventListener('click', bloquer, { capture: true, once: true })
				setTimeout(() => window.removeEventListener('click', bloquer, { capture: true }), 400)
				this.enregistrerOrdreModules()
			}
			this.navModuleNettoyer()
		},
		navModuleContexte (event) {
			if (this.gesteModule) {
				event.preventDefault()
			}
		},
		navModuleNettoyer () {
			const geste = this.gesteModule
			if (geste) {
				clearTimeout(geste.timer)
				geste.bouton.classList.remove('module-ziehen')
			}
			document.querySelector('nav')?.classList.remove('modules-sortieren')
			this.gesteModule = null
			window.removeEventListener('pointermove', this.navModuleMouvement, true)
			window.removeEventListener('pointerup', this.navModuleFin, true)
			window.removeEventListener('pointercancel', this.navModuleFin, true)
			window.removeEventListener('contextmenu', this.navModuleContexte, true)
		}
	}
}
