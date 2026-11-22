import DOMPurify from 'dompurify'

const modulesSansMax = ['audio', 'calendrier', 'chrono', 'codeqr', 'des', 'enregistrement', 'feu', 'histoire', 'horloge', 'horloge-modulable', 'lien', 'modalites', 'mot-mystere', 'plateau', 'rebours', 'retroaction', 'roue', 'sablier', 'sonometre', 'synthese']
const modulesAvecMax = ['dessin', 'texte', 'liste', 'seyes']
const modulesAvecMaxLecture = ['appariement', 'cartes', 'categories', 'classement', 'document', 'galerie', 'groupes', 'html', 'humeur', 'iframe', 'image', 'images-sequentielles', 'nuage', 'ordre', 'partage-ecran', 'surlignage', 'tableau', 'tirage-audio', 'tirage-image', 'tirage-texte', 'tirage-nombre', 'trous', 'video', 'webcam']
const modulesSansEdition = ['calendrier', 'chrono', 'dessin', 'document', 'feu', 'horloge', 'horloge-modulable', 'html', 'iframe', 'liste', 'modalites', 'partage-ecran', 'retroaction', 'seyes', 'sonometre', 'webcam']
const modulesAvecZoom = ['tableau', 'texte', 'seyes']
const modulesAvecFocus = ['calendrier', 'feu', 'horloge', 'horloge-modulable', 'modalites', 'retroaction']
const modulesAvecFocusLecture = ['calendrier', 'chrono', 'codeqr', 'des', 'feu', 'histoire', 'horloge', 'horloge-modulable', 'modalites', 'mot-mystere', 'rebours', 'roue', 'sablier', 'tirage-audio', 'tirage-image', 'tirage-texte', 'tirage-nombre']
const ordreControles = ['zoom-in', 'zoom-out', 'reset', 'separator', 'edit', 'send', 'focus', 'smallify', 'normalize', 'maximize', 'close']
const modesSansRedimensionnementProportionnel = ['edition', 'parametres']
const echelleMin = 0.5
const echelleMax = 1.5

export default {
	inject: ['app'],
	data () {
		return {
			ancienStatut: '',
			redimensionnementProportionnel: false,
			echelle: 1,
			ancrageEchelle: null
		}
	},
	mounted () {
		window.addEventListener('resize', this.adapterFenetre, false)
	},
	beforeUnmount () {
		window.removeEventListener('resize', this.adapterFenetre, false)
	},
	methods: {
		definirCaracteristiques (titre) {
			if (titre === 'Seyes') {
				this.titre = titre
			} else {
				this.titre = this.$t(titre)
			}
			this.id = this.panneau.id
			this.w = this.panneau.w
			this.h = this.panneau.h
			this.x = this.panneau.x
			this.y = this.panneau.y
			this.statut = this.panneau.statut
			this.dimensions = this.panneau.dimensions
			if (this.redimensionnementProportionnel && Number.isFinite(this.panneau.echelle)) {
				this.echelle = Math.min(echelleMax, Math.max(echelleMin, this.panneau.echelle))
			}
			if (this.panneau.hasOwnProperty('position')) {
				this.position = this.panneau.position
			}
			if (this.panneau.hasOwnProperty('titre')) {
				this.titre = this.panneau.titre
			}
			if (this.panneau.mode !== '') {
				this.mode = this.panneau.mode
			}
		},
		genererOptions (module) {
			let controles = { size: 'xl', minimize: 'remove', maximize: 'hide' }
			if (modulesAvecMax.includes(module)) {
				controles = { size: 'xl', minimize: 'remove' }
			} else if (modulesSansMax.includes(module)) {
				controles = { size: 'xl', minimize: 'remove', maximize: 'remove' }
			}
			this.options = {
				id: this.id,
				theme: 'none',
				iconfont: 'material-icons',
				container: '#panneaux',
				animateIn: 'jsPanelFadeIn',
				animateOut: 'jsPanelFadeOut',
				headerTitle: '',
				headerControls: controles,
				borderRadius: '0.7rem',
				closeOnEscape: false,
				panelSize: {
					width: this.definirLargeurPanneau(),
					height: this.definirHauteurPanneau()
				},
				dragit: {
					containment: [0, 0, this.convertirRem(7.5), 0],
					handles: '.jsPanel-titlebar, .conteneur-gauche, .conteneur-droite, .conteneur-bas',
					opacity: 0.85,
					drag: (panneau, donneesPanneau) => {
						this.deplacer(donneesPanneau)
					},
					stop: (panneau, donneesPanneau) => {
						if (this.redimensionnementProportionnel) {
							this.deplacement = false
							this.x = donneesPanneau.left
							this.y = donneesPanneau.top
							this.position = {}
						} else {
							this.redimensionner(donneesPanneau)
						}
					}
				},
				resizeit: {
					containment: [0, 0, this.convertirRem(7.5), 0],
					handles: 'n, e, s, w, ne, se, sw, nw',
					minWidth: this.convertirRem(this.minw),
					minHeight: this.convertirRem(this.minh),
					stop: (panneau, donneesPanneau) => {
						this.redimensionner(donneesPanneau)
					}
				},
				onmaximized: (panneau) => {
					this.statut = 'max'
					if (Object.keys(this.dimensions).length === 0) {
						this.dimensions = { w: this.w, h: this.h, x: this.x, y: this.y }
					}
					panneau.setHeaderTitle('')
					panneau.setBorderRadius('0')
					panneau.resizeit('disable')
					panneau.dragit('disable')
					panneau.setControlStatus('smallify', 'hide')
					if (this.app.lectureSeule) {
						if (panneau.querySelector('.jsPanel-btn-close')) {
							panneau.setControlStatus('close', 'hide')
						}
						if (panneau.querySelector('.jsPanel-btn-send')) {
							panneau.setControlStatus('send', 'hide')
						}
					}
					panneau.querySelector('.jsPanel-content').style.display = 'block'
					if (this.nav) {
						panneau.style.height = (document.body.clientHeight - this.convertirRem(7.5)) + 'px'
					} else {
						panneau.style.height = '100%'
					}
				},
				onsmallified: (panneau) => {
					this.statut = 'min'
					if (Object.keys(this.dimensions).length === 0) {
						this.dimensions = { w: this.w, h: this.h, x: this.x, y: this.y }
					}
					panneau.setHeaderTitle(this.titre)
					panneau.resizeit('disable')
					if (this.mode === 'edition' && modulesAvecMaxLecture.includes(this.panneau.type)) {
						panneau.setControlStatus('maximize', 'hide')
					}
					if (this.app.lectureSeule) {
						if (panneau.querySelector('.jsPanel-btn-close')) {
							panneau.setControlStatus('close', 'hide')
						}
						if (panneau.querySelector('.jsPanel-btn-send')) {
							panneau.setControlStatus('send', 'hide')
						}
					}
					if (this.mode === 'lecture' && (modulesAvecZoom.includes(this.panneau.type) || this.panneau.type === 'image')) {
						panneau.setControlStatus('zoom-in', 'hide')
						panneau.setControlStatus('zoom-out', 'hide')
						panneau.setControlStatus('reset', 'hide')
						panneau.setControlStatus('separator', 'hide')
					}
					panneau.querySelector('.jsPanel-content').style.display = 'none'
					setTimeout(() => {
						panneau.dispatchEvent(new MouseEvent('mouseover', { 'view': window, 'bubbles': true, 'cancelable': true }))
						panneau.querySelector('.jsPanel-btn-smallify')?.focus()
					}, 10)
				},
				onunsmallified: (panneau) => {
					this.statut = ''
					this.w = this.dimensions.w
					this.h = this.dimensions.h
					this.dimensions = {}
					panneau.setHeaderTitle('')
					if (this.verifierRedimensionnement()) {
						panneau.resizeit('enable')
					}
					if (this.mode === 'edition' && modulesAvecMaxLecture.includes(this.panneau.type)) {
						panneau.setControlStatus('maximize', 'hide')
					}
					if (this.app.lectureSeule) {
						if (panneau.querySelector('.jsPanel-btn-close')) {
							panneau.setControlStatus('close', 'hide')
						}
						if (panneau.querySelector('.jsPanel-btn-send')) {
							panneau.setControlStatus('send', 'hide')
						}
					}
					if (this.mode === 'lecture' && (modulesAvecZoom.includes(this.panneau.type) || this.panneau.type === 'image')) {
						panneau.setControlStatus('zoom-in', 'show')
						panneau.setControlStatus('zoom-out', 'show')
						panneau.setControlStatus('reset', 'show')
						panneau.setControlStatus('separator', 'show')
					}
					panneau.querySelector('.jsPanel-content').style.display = 'block'
					this.positionner()
				},
				onnormalized: (panneau) => {
					this.statut = ''
					this.w = this.dimensions.w
					this.h = this.dimensions.h
					this.x = this.dimensions.x
					this.y = this.dimensions.y
					this.dimensions = {}
					panneau.setBorderRadius('0.7rem')
					panneau.setHeaderTitle('')
					panneau.dragit('enable')
					if (this.verifierRedimensionnement()) {
						panneau.resizeit('enable')
					}
					if (this.app.lectureSeule) {
						if (panneau.querySelector('.jsPanel-btn-close')) {
							panneau.setControlStatus('close', 'hide')
						}
						if (panneau.querySelector('.jsPanel-btn-send')) {
							panneau.setControlStatus('send', 'hide')
						}
					}
					panneau.setControlStatus('smallify', 'show')
					this.positionner()
				},
				onfronted: () => {
					this.$emit('afficher', this.id)
				},
				onbeforeclose: () => {
					if (this.panneau.type === 'partage-ecran' && this.mode === 'lecture') {
						const element = document.querySelector('#video_' + this.id)
						const pistes = element?.srcObject?.getTracks()
						pistes?.forEach((track) => {
							track.stop()
						})
						if (element) {
							element.srcObject = null
						}
					} else if (this.panneau.type === 'enregistrement' && this.mode === 'edition' && this.enregistrement) {
						if (this.contexte) {
							this.contexte.close().catch(() => {})
							this.contexte = null
						}
						if (this.intervalle) {
							clearInterval(this.intervalle)
							this.intervalle = null
						}
					}
					return true
				},
				onclosed: () => {
					const module = this.panneau.type
					this.$emit('fermer', this.id, module)
					if (module === 'audio' && this.dataURL !== '' && this.audio !== '') {
						window.URL.revokeObjectURL(this.audio)
					} else if (module === 'enregistrement' && this.blob !== '' && this.audio !== '') {
						window.URL.revokeObjectURL(this.audio)
					} else if (module === 'document' && this.type === 'pdf' && this.document !== '') {
						window.URL.revokeObjectURL(this.document)
					} else if (module === 'html' && this.type === 'fichier' && this.html !== '') {
						window.URL.revokeObjectURL(this.html)
					} else if (module === 'horloge') {
						clearInterval(this.horloge)
						clearInterval(this.temps)
					} else if (module === 'plateau') {
						this.desactiverPions()
					} else if ((module === 'rebours' || module === 'sablier') && this.decompte !== '') {
						clearInterval(this.decompte)
					} else if (module === 'sonometre') {
						this.pause()
						if (this.analyseur !== '') {
							this.analyseur.disconnect()
						}
					} else if (module === 'tableau' && this.tabulator !== '') {
						this.tabulator.clearData()
						this.tabulator.destroy()
					} else if (module === 'video' && this.lecteur !== '') {
						this.lecteur.dispose()
					}
				}
			}
			if (this.redimensionnementProportionnel) {
				Object.assign(this.options.resizeit, {
					handles: 'nw, se, sw',
					resize: (panneau, donneesPanneau, event) => {
						this.redimensionnerProportionnellement(panneau, event)
					},
					stop: (panneau) => {
						const rect = panneau.getBoundingClientRect()
						this.ancrageEchelle = null
						this.x = rect.left
						this.y = rect.top
						this.position = {}
						this.positionner()
					}
				})
			}
		},
		adapterFenetre () {
			const panneau = document.querySelector('#' + this.id)
			if (this.statut === 'focus') {
				if (panneau) {
					panneau.style.width = this.definirLargeurPanneau() + 'px'
					panneau.style.height = this.definirHauteurPanneau() + 'px'
					this.appliquerEchelle()
					this.positionnerFocus(panneau)
				}
				return
			}
			this.positionner()
			if (panneau && this.statut === 'max') {
				panneau.style.width = '100%'
			}
			if (this.panneau.type === 'dessin') {
				this.$nextTick(() => {
					this.dimensionsCanva.w = this.statut === 'max' ? this.largeurPage : this.definirLargeurPanneau()
					this.dimensionsCanva.h = (this.statut === 'max' ? this.hauteurPage : this.definirHauteurPanneau()) - this.convertirRem(3)
				})
			}
		},
		initialiser () {
			setTimeout(() => {
				const panneau = document.querySelector('#' + this.id)
				if (panneau) {
					panneau.setAttribute('tabindex', '0')
					panneau.setAttribute('aria-label', this.titre)
					panneau.querySelector('.jsPanel-content').setAttribute('tabindex', '-1')
					panneau.addEventListener('focus', () => {
						panneau.front()
					})
					panneau.addEventListener('mouseover', () => {
						panneau.querySelector('.jsPanel-controlbar').style.display = 'flex'
					})
					panneau.addEventListener('mouseout', () => {
						panneau.querySelector('.jsPanel-controlbar').style.display = 'none'
					})
					if (this.verifierRedimensionnement()) {
						panneau.resizeit('enable')
					} else {
						panneau.resizeit('disable')
					}
					if (this.redimensionnementProportionnel) {
						panneau.addEventListener('pointerdown', (event) => {
							this.ancrerEchelle(panneau, event)
						}, true)
					}
					this.appliquerEchelle()
					panneau.style.left = this.x + 'px'
					panneau.style.top = this.y + 'px'
					if (this.app.lectureSeule && panneau.querySelector('.jsPanel-btn-close')) {
						panneau.setControlStatus('close', 'hide')
					}
					panneau.querySelector('.jsPanel-title').title = this.$t('modifierTitre')
					panneau.querySelector('.jsPanel-title').addEventListener('dblclick', () => {
						this.afficherRenommer(this.titre)
					})
					panneau.querySelector('.jsPanel-title').addEventListener('keydown', (e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							this.afficherRenommer(this.titre)
						}
					})
					if (panneau && this.app.pages.length > 1 && !panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-send')) && this.panneau.type !== 'modalites' && this.panneau.type !== 'retroaction' && modulesSansEdition.includes(this.panneau.type)) {
						this.ajouterControle(panneau, {
							html: '<span class="material-icons" aria-hidden="true">send</span>',
							name: 'send',
							ariaLabel: this.$t('deplacerPage'),
							handler: () => {
								this.afficherEnvoyer(this.id)
							},
							afterInsert: (control) => {
								control.title = this.$t('deplacerPage')
							}
						})
						if (this.app.lectureSeule) {
							panneau.setControlStatus('send', 'hide')
						}
						panneau.querySelector('.jsPanel-btn-send').addEventListener('keydown', (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								this.afficherEnvoyer(this.id)
							}
						})
					}
					if (modulesAvecFocus.includes(this.panneau.type)) {
						this.ajouterFocus(panneau)
					}
					if (panneau.querySelector('.jsPanel-btn-smallify')) {
						panneau.querySelector('.jsPanel-btn-smallify').title = this.$t('plier')
						panneau.querySelector('.jsPanel-btn-smallify').ariaLabel = this.$t('plier')
						panneau.querySelector('.jsPanel-btn-smallify').addEventListener('keydown', (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								if (panneau.status === 'smallified') {
									panneau.unsmallify()
								} else {
									panneau.smallify()
								}
							}
						})
					}
					if (panneau.querySelector('.jsPanel-btn-normalize')) {
						panneau.querySelector('.jsPanel-btn-normalize').title = this.$t('normaliser')
						panneau.querySelector('.jsPanel-btn-normalize').ariaLabel = this.$t('normaliser')
						panneau.querySelector('.jsPanel-btn-normalize').addEventListener('keydown', (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								panneau.normalize()
							}
						})
					}
					if (panneau.querySelector('.jsPanel-btn-maximize')) {
						panneau.querySelector('.jsPanel-btn-maximize').title = this.$t('maximiser')
						panneau.querySelector('.jsPanel-btn-maximize').ariaLabel = this.$t('maximiser')
						panneau.querySelector('.jsPanel-btn-maximize').addEventListener('keydown', (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								panneau.maximize()
							}
						})
					}
					if (panneau.querySelector('.jsPanel-btn-close')) {
						panneau.querySelector('.jsPanel-btn-close').title = this.$t('fermer')
						panneau.querySelector('.jsPanel-btn-close').ariaLabel = this.$t('fermer')
						panneau.querySelector('.jsPanel-btn-close').addEventListener('keydown', (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								panneau.close()
							}
						})
					}
					this.$nextTick(() => {
						if (this.statut === 'min') {
							panneau.smallify()
						} else if (this.statut === 'max') {
							panneau.maximize()
						}
						panneau.focus()
					})
				}
			}, 0)
		},
		deplacer (donnees) {
			this.deplacement = true
			if (this.donnees && Object.keys(this.donnees).length > 0) {
				this.donnees.x = donnees.left
				this.donnees.y = donnees.top
				this.position = {}
			}
		},
		redimensionner (donnees) {
			this.deplacement = false
			let base = 10
			if (document.body.clientWidth < 1367) {
				base = 9
			}
			this.w = donnees.width / base
			this.h = donnees.height / base
			this.x = donnees.left
			this.y = donnees.top
			this.position = {}
		},
		positionner () {
			if (this.w > document.body.clientWidth) {
				this.w = document.body.clientWidth
			}
			if (this.nav && this.h > document.body.clientHeight - this.convertirRem(7.5)) {
				this.h = document.body.clientHeight - this.convertirRem(7.5)
			} else if (!this.nav && this.h > document.body.clientHeight) {
				this.h = document.body.clientHeight
			}
			if (this.x > document.body.clientWidth - this.definirLargeurPanneau()) {
				this.x = document.body.clientWidth - this.definirLargeurPanneau()
			}
			if (Object.keys(this.position).length > 0 && this.position.x <= (document.body.clientWidth - this.definirLargeurPanneau())) {
				this.x = this.position.x
			}
			if (this.nav && this.y > document.body.clientHeight - (this.convertirRem(7.5) + this.definirHauteurPanneau())) {
				this.y = document.body.clientHeight - (this.convertirRem(7.5) + this.definirHauteurPanneau())
				if (Object.keys(this.position).length > 0 && this.position.y <= (document.body.clientHeight - (this.convertirRem(7.5) + this.definirHauteurPanneau()))) {
					this.y = this.position.y
				}
			} else if (!this.nav && this.y > document.body.clientHeight - this.definirHauteurPanneau()) {
				this.y = document.body.clientHeight - this.definirHauteurPanneau()
				if (Object.keys(this.position).length > 0 && this.position.y <= (document.body.clientHeight - this.definirHauteurPanneau())) {
					this.y = this.position.y
				}
			}
			this.x = Math.max(this.x, 0)
			this.y = Math.max(this.y, 0)
			this.$nextTick(() => {
				const panneau = document.querySelector('#' + this.id)
				this.$nextTick(() => {
					if (panneau && this.statut === '') {
						panneau.resize({
							width: this.definirLargeurPanneau(),
							height: this.definirHauteurPanneau()
						})
						panneau.style.left = this.x + 'px'
						panneau.style.top = this.y + 'px'
					}
					this.appliquerEchelle()
				})
				if (!this.redimensionnementProportionnel) {
					this.options.resizeit.minWidth = this.convertirRem(this.minw)
					this.options.resizeit.minHeight = this.convertirRem(this.minh)
				}
				if (this.nav) {
					this.options.dragit.containment = [0, 0, this.convertirRem(7.5), 0]
					this.options.resizeit.containment = [0, 0, this.convertirRem(7.5), 0]
					if (panneau && this.statut === 'max') {
						this.$nextTick(() => {
							panneau.style.height = (document.body.clientHeight - this.convertirRem(7.5)) + 'px'
						})
					}
				} else {
					this.options.dragit.containment = [0, 0, 0, 0]
					this.options.resizeit.containment = [0, 0, 0, 0]
					if (panneau && this.statut === 'max') {
						this.$nextTick(() => {
							panneau.style.height = '100%'
						})
					}
				}
			})
		},
		verifierRedimensionnement () {
			return this.redimensionnement || (this.redimensionnementProportionnel && !modesSansRedimensionnementProportionnel.includes(this.mode))
		},
		verifierRedimensionnementProportionnel () {
			return this.redimensionnementProportionnel && !modesSansRedimensionnementProportionnel.includes(this.mode) ? this.limiterEchelle() : 1
		},
		definirLargeurPanneau (echelle = this.verifierRedimensionnementProportionnel()) {
			return this.convertirRem(this.w) * echelle
		},
		definirHauteurPanneau (echelle = this.verifierRedimensionnementProportionnel()) {
			if (echelle === 1) {
				return this.convertirRem(this.h)
			}
			const entete = this.convertirRem(3)
			return (this.convertirRem(this.h) - entete) * echelle + entete
		},
		ancrerEchelle (panneau, event) {
			const poignee = event.target.closest?.('.jsPanel-resizeit-handle')
			if (!poignee) {
				return
			}
			const rect = panneau.getBoundingClientRect()
			const coin = ['nw', 'sw', 'se'].find((nom) => poignee.classList.contains('jsPanel-resizeit-' + nom))
			this.ancrageEchelle = { coin: coin, gauche: rect.left, haut: rect.top, droite: rect.right, bas: rect.bottom, echelle: this.verifierRedimensionnementProportionnel() }
		},
		redimensionnerProportionnellement (panneau, event) {
			const ancrage = this.ancrageEchelle
			if (ancrage === null) {
				return
			}
			const point = event.touches?.[0] ?? event
			const entete = this.convertirRem(3)
			const largeurBase = this.convertirRem(this.w)
			const hauteurBase = this.convertirRem(this.h) - entete
			const versGauche = ancrage.coin !== 'se'
			const versHaut = ancrage.coin === 'nw'
			const largeur = versGauche ? ancrage.droite - point.clientX : point.clientX - ancrage.gauche
			const hauteur = versHaut ? ancrage.bas - point.clientY : point.clientY - ancrage.haut
			const largeurMax = versGauche ? ancrage.droite : document.body.clientWidth - ancrage.gauche
			const hauteurMax = versHaut ? ancrage.bas : document.body.clientHeight - (this.nav ? this.convertirRem(7.5) : 0) - ancrage.haut
			const echelleLargeur = largeur / largeurBase
			const echelleHauteur = (hauteur - entete) / hauteurBase
			const echelleCible = Math.abs(echelleLargeur - ancrage.echelle) >= Math.abs(echelleHauteur - ancrage.echelle) ? echelleLargeur : echelleHauteur
			const echelle = Math.min(echelleCible, largeurMax / largeurBase, (hauteurMax - entete) / hauteurBase)
			this.echelle = Math.min(echelleMax, Math.max(echelleMin, echelle))
			const largeurPanneau = this.definirLargeurPanneau()
			const hauteurPanneau = this.definirHauteurPanneau()
			panneau.style.width = largeurPanneau + 'px'
			panneau.style.height = hauteurPanneau + 'px'
			panneau.style.left = (versGauche ? ancrage.droite - largeurPanneau : ancrage.gauche) + 'px'
			panneau.style.top = (versHaut ? ancrage.bas - hauteurPanneau : ancrage.haut) + 'px'
			this.appliquerEchelle()
		},
		limiterEchelle () {
			const entete = this.convertirRem(3)
			const hauteurDisponible = document.body.clientHeight - (this.nav ? this.convertirRem(7.5) : 0) - entete
			const echelle = Math.min(this.echelle, document.body.clientWidth / this.convertirRem(this.w), hauteurDisponible / (this.convertirRem(this.h) - entete))
			return Math.max(echelleMin, echelle)
		},
		appliquerEchelle () {
			const contenu = document.querySelector('#' + this.id + ' .jsPanel-content')
			const interne = contenu?.firstElementChild
			if (!interne) {
				return
			}
			const echelle = this.verifierRedimensionnementProportionnel()
			if (echelle === 1) {
				contenu.style.removeProperty('overflow')
				for (const propriete of ['width', 'height', 'overflow', 'transform', 'transform-origin']) {
					interne.style.removeProperty(propriete)
				}
				return
			}
			contenu.style.overflow = 'hidden'
			interne.style.width = this.convertirRem(this.w) + 'px'
			interne.style.height = (this.convertirRem(this.h) - this.convertirRem(3)) + 'px'
			interne.style.overflow = 'auto'
			interne.style.transformOrigin = '0 0'
			interne.style.transform = 'scale(' + echelle + ')'
		},
		afficherRenommer (titre) {
			const div = document.createElement('div')
			div.id = 'conteneur-modale-panneau'
			div.className = 'conteneur-modale'
			div.innerHTML = DOMPurify.sanitize('<div id="modale-panneau" class="modale" role="dialog" aria-modal="true" aria-label="' + this.$t('modifierTitrePanneau') + '"><div class="conteneur"><div class="contenu"><label for="champ-nouveau-titre-panneau">' + this.$t('nouveauTitre') + '</label><input id="champ-nouveau-titre-panneau" type="text"><div class="actions"><button type="button" id="annuler" class="bouton">' + this.$t('annuler') + '</button><button type="button" id="valider" class="bouton">' + this.$t('valider') + '</button></div></div></div></div>')
			this.app.ouvrirModalePanneau(div)
			document.querySelector('#champ-nouveau-titre-panneau').value = titre
			this.$nextTick(() => {
				document.querySelector('#annuler').addEventListener('click', () => {
					this.app.fermerModalePanneau()
				})
				document.querySelector('#valider').addEventListener('click', () => {
					this.renommer()
				})
				document.querySelector('#modale-panneau input').addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						this.renommer()
					}
				})
			})
		},
		renommer () {
			const input = document.querySelector('#modale-panneau input')
			const titre = input ? input.value : ''
			if (titre) {
				this.titre = titre
				document.querySelector('#' + this.id).setHeaderTitle(titre)
				this.app.fermerModalePanneau()
			}
		},
		afficherEnvoyer (id) {
			const div = document.createElement('div')
			div.id = 'conteneur-modale-panneau'
			div.className = 'conteneur-modale'
			div.innerHTML = DOMPurify.sanitize('<div id="modale-panneau" class="modale" role="dialog" aria-modal="true" aria-label="' + this.$t('deplacerPage') + '"><div class="conteneur"><div class="contenu"><label for="numero-page">' + this.$t('envoyerPage') + '</label><input id="numero-page" type="number" min="1"><div class="choix" role="radiogroup" aria-label="' + this.$t('deplacerPage') + '"><span class="deplacer"><input id="deplacer" type="radio" name="envoyer_panneau" value="deplacer" checked><label for="deplacer">' + this.$t('deplacer') + '</label></span><span class="copier"><input id="copier" type="radio" name="envoyer_panneau" value="copier"><label for="copier">' + this.$t('copier') + '</label></span></div><div class="actions"><button type="button" id="annuler" class="bouton">' + this.$t('annuler') + '</button><button type="button" id="valider" class="bouton">' + this.$t('valider') + '</button></div></div></div></div>')
			this.app.ouvrirModalePanneau(div)
			document.querySelector('#numero-page').value = this.app.page
			this.$nextTick(() => {
				document.querySelector('#annuler').addEventListener('click', () => {
					this.app.fermerModalePanneau()
				})
				document.querySelector('#valider').addEventListener('click', () => {
					this.envoyer(id)
				})
				document.querySelector('#numero-page').addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						this.envoyer(id)
					}
				})
			})
		},
		envoyer (id) {
			const inputPage = document.querySelector('#modale-panneau input#numero-page')
			const page = inputPage ? parseInt(inputPage.value) : NaN
			if (!isNaN(page) && this.app.page !== page && page > 0 && page <= this.app.pages.length) {
				this.app.export = { type: 'panneau', id: id, page: page }
				this.app.exportDonnees = true
				if (this.app.panneauxPage.length === 0) {
					this.app.exportTermine = true
				}
			}
		},
		ajouterControle (panneau, options) {
			panneau.addControl(options)
			panneau.removeAttribute('data-btn' + options.name)
			const barre = panneau.querySelector('.jsPanel-controlbar')
			const suivant = ordreControles.slice(ordreControles.indexOf(options.name) + 1).map((nom) => barre.querySelector('.jsPanel-btn-' + nom)).find((controle) => controle !== null)
			barre.insertBefore(barre.querySelector('.jsPanel-btn-' + options.name), suivant ?? null)
		},
		ajouterFocus (panneau) {
			this.ajouterControle(panneau, {
				html: '<span class="material-icons" aria-hidden="true">highlight</span>',
				name: 'focus',
				ariaLabel: this.$t('activerFocus'),
				handler: () => {
					this.afficherEnFocus(panneau)
				},
				afterInsert: (control) => {
					control.title = this.$t('activerFocus')
				}
			})
			panneau.querySelector('.jsPanel-btn-focus').addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					this.afficherEnFocus(panneau)
				}
			})
		},
		positionnerFocus (panneau) {
			const largeurFenetre = document.body.clientWidth
			let hauteurFenetre
			if (this.nav) {
				hauteurFenetre = document.body.clientHeight - this.convertirRem(7.5)
			} else {
				hauteurFenetre = document.body.clientHeight
			}
			let ratio = hauteurFenetre / this.definirHauteurPanneau()
			if (this.definirLargeurPanneau() * ratio > largeurFenetre) {
				ratio = largeurFenetre / this.definirLargeurPanneau()
			}
			panneau.style.top = ((hauteurFenetre - this.definirHauteurPanneau()) / 2) + 'px'
			panneau.style.left = ((largeurFenetre - this.definirLargeurPanneau()) / 2) + 'px'
			panneau.style.transform = 'scale(' + ratio + ')'
		},
		afficherEnFocus (panneau) {
			if (this.statut === 'min') {
				panneau.unsmallify()
				this.ancienStatut = 'min'
			}
			this.statut = 'focus'
			const panneaux = document.querySelectorAll('.jsPanel')
			panneaux.forEach((p) => {
				if (p.id !== this.id) {
					p.style.display = 'none'
				} else {
					p.resizeit('disable')
					p.dragit('disable')
					p.querySelector('.jsPanel-controlbar').style.display = 'none'
					p.setAttribute('data-x', this.x)
					p.setAttribute('data-y', this.y)
					this.positionnerFocus(p)
					p.style.boxShadow = 'none'
					p.style.background = 'transparent'
					p.querySelector('.jsPanel-hdr').style.visibility = 'hidden'
					p.querySelector('.jsPanel-content').style.background = 'transparent'
				}
			})
			const masque = document.createElement('div')
			masque.id = 'masque'
			if (this.panneau.type === 'modalites' || this.panneau.type === 'mot-mystere' || this.panneau.type === 'retroaction' || this.panneau.type === 'tirage-texte' || this.panneau.type === 'tirage-nombre' || this.panneau.type === 'tirage-image' || this.panneau.type === 'tirage-audio') {
				masque.className = 'blanc'
			}
			masque.innerHTML = DOMPurify.sanitize('<button type="button" title="' + this.$t('fermer') + '" aria-label="' + this.$t('fermer') + '"><i class="material-icons" aria-hidden="true">close</i></button>')
			document.body.appendChild(masque)
			document.querySelector('#masque button').addEventListener('click', () => {
				if (this.ancienStatut === 'min') {
					this.statut = 'min'
					this.ancienStatut = ''
				} else {
					this.statut = ''
				}
			})
			document.querySelector('#' + this.id).addEventListener('keydown', (event) => {
				if (event.key === 'Tab') {
					this.app.piegerFocus(event, document.querySelector('#' + this.id + ' .conteneur'))
				}
			})
			document.querySelector('#' + this.id)?.focus()
			document.body.classList.add('focus')
			if (document.querySelector('nav')) document.querySelector('nav').style.display = 'none'
			if (document.querySelector('.bouton-cadenas')) document.querySelector('.bouton-cadenas').style.display = 'none'
			if (document.querySelector('.nav')) document.querySelector('.nav').style.display = 'none'
			if (document.querySelector('.bouton-export')) document.querySelector('.bouton-export').style.display = 'none'
			if (document.querySelector('.bouton-plein-ecran')) document.querySelector('.bouton-plein-ecran').style.display = 'none'
			if (document.querySelector('.bouton-capture')) document.querySelector('.bouton-capture').style.display = 'none'
			if (document.querySelector('.bouton-annotation')) document.querySelector('.bouton-annotation').style.display = 'none'
		},
		gererClavier (event, touche, id, type) {
			const panneau = document.querySelector('#' + this.id)
			if (id === this.id && this.statut !== 'max' && (touche === 'ArrowLeft' || touche === 'ArrowRight' || touche === 'ArrowUp' || touche === 'ArrowDown')) {
				if (type !== 'galerie' || (type === 'galerie' && !event.target.classList.contains('galerie'))) {
					this.deplacerClavier(touche)
				}
			} else if (panneau && id === this.id && (touche === 'Delete' || touche === 'Escape')) {
				if (this.statut !== 'focus') {
					panneau.close()
				} else if (this.statut === 'focus' && this.ancienStatut === 'min') {
					this.statut = 'min'
					this.ancienStatut = ''
				} else if (this.statut === 'focus' && this.ancienStatut !== 'min') {
					this.statut = ''
				}
			} else if (panneau && id === this.id && this.mode === 'lecture' && (modulesAvecZoom.includes(type) || type === 'image') && touche === '+') {
				if (type === 'image') {
					this.zoomer()
				} else {
					this.augmenterTaille()
				}
			} else if (panneau && id === this.id && this.mode === 'lecture' && (modulesAvecZoom.includes(type) || type === 'image') && touche === '-') {
				if (type === 'image') {
					this.dezoomer()
				} else {
					this.reduireTaille()
				}
			} else if (panneau && id === this.id && this.mode === 'lecture' && (modulesAvecZoom.includes(type) || type === 'image') && touche === 'c') {
				if (type === 'image') {
					this.recadrer()
				} else {
					this.annulerTaille()
				}
			} else if (panneau && id === this.id && touche === 'e' && !modulesSansEdition.includes(type) && ((this.mode === 'lecture' && type !== 'image' && type !== 'video') || (this.mode === 'lecture' && type === 'image' && this.requete !== '') || (this.mode === 'lecture' && type === 'video' && this.videoId !== '') || this.mode === 'decompte' || this.mode === 'pause') && this.statut !== 'focus') {
				if (this.statut === 'min') {
					panneau.unsmallify()
				} else if (this.statut === 'max') {
					panneau.normalize()
				}
				this.editer()
			} else if (panneau && id === this.id && touche === 'f' && (((this.mode === 'lecture' || this.mode === 'decompte' || this.mode === 'pause') && modulesAvecFocusLecture.includes(type)) || (modulesAvecFocus.includes(type))) && this.statut !== 'focus') {
				this.afficherEnFocus(panneau)
			} else if (panneau && id === this.id && touche === 'f' && (((this.mode === 'lecture' || this.mode === 'decompte' || this.mode === 'pause') && modulesAvecFocusLecture.includes(type)) || (modulesAvecFocus.includes(type))) && this.statut === 'focus') {
				if (this.ancienStatut === 'min') {
					this.statut = 'min'
					this.ancienStatut = ''
				} else {
					this.statut = ''
				}
			} else if (panneau && id === this.id && touche === 'm' && this.statut === '' && this.options.headerControls?.smallify !== 'remove') {
				panneau.smallify()
			} else if (panneau && id === this.id && touche === 'm' && this.statut === 'min') {
				panneau.unsmallify()
			} else if (panneau && id === this.id && touche === 's' && this.statut === 'max') {
				panneau.normalize()
			} else if (panneau && id === this.id && touche === 's' && this.statut === '' && this.options.headerControls?.maximize !== 'remove' && ((modulesAvecMax.includes(type)) || (modulesAvecMaxLecture.includes(type) && (this.mode === 'lecture' && type !== 'texte' && type !== 'liste' && type !== 'seyes') || type === 'texte' || type === 'seyes'))) {
				panneau.maximize()
			}
		},
		deplacerClavier (direction) {
			if (direction === 'ArrowLeft') {
				this.x = this.x - 1
			} else if (direction === 'ArrowRight') {
				this.x = this.x + 1
			} else if (direction === 'ArrowUp') {
				this.y = this.y - 1
			} else if (direction === 'ArrowDown') {
				this.y = this.y + 1
			}
			this.$nextTick(() => {
				const panneau = document.querySelector('#' + this.id)
				if (panneau) {
					panneau.style.left = this.x + 'px'
					panneau.style.top = this.y + 'px'
				}
			})
		},
		convertirRem (valeur) {
			const taille = window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size')
			return typeof valeur !== 'undefined' && valeur > 0 ? parseFloat(taille) * valeur : parseFloat(taille)
		},
		verifierURL (lien) {
			let url
			try {
				url = new URL(lien)
			} catch {
				return false
			}
			return url.protocol === 'http:' || url.protocol === 'https:'
		},
		deplacerElement (nom, index, direction, selecteur) {
			const cible = index + direction
			if (cible < 0 || cible > this[nom].length - 1) return
			const liste = [...this[nom]]
			const element = liste.splice(index, 1)[0]
			liste.splice(cible, 0, element)
			this[nom] = liste
			this.$nextTick(() => {
				const element = this.$el.querySelectorAll(selecteur)[cible]
				const bouton = element?.querySelector(direction < 0 ? '.deplacer.avant' : '.deplacer.apres')
				if (bouton && !bouton.disabled) {
					bouton.focus()
				} else {
					element?.querySelector('.deplacer:not(:disabled)')?.focus()
				}
				this.annoncer(this.$t('elementDeplace', { position: cible + 1 }))
			})
		},
		annoncer (texte) {
			const statut = document.querySelector('#statut')
			if (!statut) return
			statut.textContent = ''
			setTimeout(() => {
				statut.textContent = texte
			}, 150)
		},
		activerInput (id) {
			document.querySelector('#' + id)?.click()
		},
		melanger (array) {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1))
				const temp = array[i]
				array[i] = array[j]
				array[j] = temp
			}
			return array
		},
		lancerConfettis () {
			confetti({ angle: 300, spread: 55, particleCount: 150, origin: { x: 0, y: -0.2 }, zIndex: 10010 })
			confetti({ angle: 240, spread: 55, particleCount: 150, origin: { x: 1, y: -0.2 }, zIndex: 10010 })
			confetti({ angle: 270, spread: 70, particleCount: 150, origin: { x: 0.5, y: -0.2 }, zIndex: 10010 })
		},
		convertirDataURL (dataurl) {
			const arr = dataurl.split(',')
			const match = arr[0].match(/:(.*?);/)
			if (!match) return null
			const mime = match[1]
			const bstr = atob(arr[1])
			let n = bstr.length
			const u8arr = new Uint8Array(n)
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n)
			}
			return new Blob([u8arr], { type: mime })
		}
	},
	watch: {
		redimensionnement (redimensionnement) {
			this.$nextTick(() => {
				const panneau = document.querySelector('#' + this.id)
				if (panneau && redimensionnement && this.statut === '') {
					panneau.resizeit('enable')
				} else if (panneau && !redimensionnement && this.statut === '') {
					panneau.resizeit('disable')
				}
			})
		},
		mode (mode) {
			setTimeout(() => {
				const panneau = document.querySelector('#' + this.id)
				const module = this.panneau.type
				if (this.redimensionnementProportionnel) {
					if (panneau && this.statut === '') {
						panneau.resizeit(this.verifierRedimensionnement() ? 'enable' : 'disable')
					}
					this.positionner()
				}
				if (mode === 'lecture' && panneau && modulesAvecMaxLecture.includes(module)) {
					panneau.setControlStatus('maximize', 'show')
				}
				if (mode === 'lecture' || mode === 'decompte' || mode === 'pause') {
					if (panneau && !panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-edit')) && ((module !== 'video' && module !== 'image' && !modulesSansEdition.includes(module)) || (module === 'video' && this.videoId !== '') || (module === 'image' && this.requete !== ''))) {
						this.ajouterControle(panneau, {
							html: '<span class="material-icons" aria-hidden="true">edit</span>',
							name: 'edit',
							ariaLabel: this.$t('modifier'),
							handler: (panel) => {
								if (this.statut === 'min') {
									panel.unsmallify()
								} else if (this.statut === 'max') {
									panel.normalize()
								}
								this.editer()
							},
							afterInsert: (control) => {
								control.title = this.$t('modifier')
							}
						})
						panneau.querySelector('.jsPanel-btn-edit').addEventListener('keydown', (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								if (this.statut === 'min') {
									panneau.unsmallify()
								} else if (this.statut === 'max') {
									panneau.normalize()
								}
								this.editer()
							}
						})
					}
					if (panneau && !panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-focus')) && modulesAvecFocusLecture.includes(this.panneau.type)) {
						this.ajouterFocus(panneau)
					}
					if (panneau && this.app.pages.length > 1 && !panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-send')) && this.panneau.type !== 'modalites' && this.panneau.type !== 'retroaction') {
						this.ajouterControle(panneau, {
							html: '<span class="material-icons" aria-hidden="true">send</span>',
							name: 'send',
							ariaLabel: this.$t('deplacerPage'),
							handler: () => {
								this.afficherEnvoyer(this.id)
							},
							afterInsert: (control) => {
								control.title = this.$t('deplacerPage')
							}
						})
						if (this.app.lectureSeule) {
							panneau.setControlStatus('send', 'hide')
						}
						panneau.querySelector('.jsPanel-btn-send').addEventListener('keydown', (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								this.afficherEnvoyer(this.id)
							}
						})
					}
					if (panneau && (modulesAvecZoom.includes(module) || module === 'image')) {
						if (!panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-zoom-in'))) {
							this.ajouterControle(panneau, {
								html: '<span class="material-icons" aria-hidden="true">add</span>',
								name: 'zoom-in',
								ariaLabel: this.$t('zoomer'),
								handler: () => {
									if (module === 'image') {
										this.zoomer()
									} else {
										this.augmenterTaille()
									}
								},
								afterInsert: (control) => {
									control.title = this.$t('zoomer')
								}
							})
							panneau.querySelector('.jsPanel-btn-zoom-in').addEventListener('keydown', (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									if (module === 'image') {
										this.zoomer()
									} else {
										this.augmenterTaille()
									}
								}
							})
						}
						if (!panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-zoom-out'))) {
							this.ajouterControle(panneau, {
								html: '<span class="material-icons" aria-hidden="true">remove</span>',
								name: 'zoom-out',
								ariaLabel: this.$t('dezoomer'),
								handler: () => {
									if (module === 'image') {
										this.dezoomer()
									} else {
										this.reduireTaille()
									}
								},
								afterInsert: (control) => {
									control.title = this.$t('dezoomer')
								}
							})
							panneau.querySelector('.jsPanel-btn-zoom-out').addEventListener('keydown', (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									if (module === 'image') {
										this.dezoomer()
									} else {
										this.reduireTaille()
									}
								}
							})
						}
						if (!panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-reset'))) {
							this.ajouterControle(panneau, {
								html: '<span class="material-icons" aria-hidden="true">center_focus_strong</span>',
								name: 'reset',
								ariaLabel: this.$t('recentrer'),
								handler: () => {
									if (module === 'image') {
										this.recadrer()
									} else {
										this.annulerTaille()
									}
								},
								afterInsert: (control) => {
									control.title = this.$t('recentrer')
								}
							})
							panneau.querySelector('.jsPanel-btn-reset').addEventListener('keydown', (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									if (module === 'image') {
										this.recadrer()
									} else {
										this.annulerTaille()
									}
								}
							})
						}
						if (!panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-separator'))) {
							this.ajouterControle(panneau, {
								html: '<span></span>',
								name: 'separator'
							})
							panneau.querySelector('.jsPanel-btn-separator').setAttribute('tabindex', '-1')
						}
					}
				}
				if (mode !== 'lecture' && mode !== 'pause' && mode !== 'decompte') {
					if (panneau && !modulesAvecMax.includes(module)) {
						panneau.setControlStatus('maximize', 'hide')
					}
					if (panneau && !modulesSansEdition.includes(module) && panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-edit'))) {
						panneau.setControlStatus('edit', 'remove')
					}
					if (panneau && panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-focus'))) {
						panneau.setControlStatus('focus', 'remove')
					}
					if (panneau && (modulesAvecZoom.includes(module) || module === 'image')) {
						if (panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-zoom-in'))) {
							panneau.setControlStatus('zoom-in', 'remove')
						}
						if (panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-zoom-out'))) {
							panneau.setControlStatus('zoom-out', 'remove')
						}
						if (panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-reset'))) {
							panneau.setControlStatus('reset', 'remove')
						}
						if (panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-separator'))) {
							panneau.setControlStatus('separator', 'remove')
						}
					}
					if (panneau && panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-send'))) {
						panneau.setControlStatus('send', 'remove')
					}
				}
				if (mode === 'stop' && this.statut === 'focus') {
					this.statut = ''
				}
			}, 0)
		},
		pages: {
			handler (pages) {
				if (pages.length > 1) {
					this.$nextTick(() => {
						const panneau = document.querySelector('#' + this.id)
						if (panneau && !panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-send')) && this.panneau.type !== 'modalites' && this.panneau.type !== 'retroaction' && (this.mode === 'lecture' || this.mode === 'decompte' || this.mode === 'pause' || modulesSansEdition.includes(this.panneau.type))) {
							this.ajouterControle(panneau, {
								html: '<span class="material-icons" aria-hidden="true">send</span>',
								name: 'send',
								ariaLabel: this.$t('deplacerPage'),
								handler: () => {
									this.afficherEnvoyer(this.id)
								},
								afterInsert: (control) => {
									control.title = this.$t('deplacerPage')
								}
							})
							if (this.app.lectureSeule) {
								document.querySelector('#' + this.id).setControlStatus('send', 'hide')
							}
							panneau.querySelector('.jsPanel-btn-send').addEventListener('keydown', (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									this.afficherEnvoyer(this.id)
								}
							})
						}
					})
				} else {
					this.$nextTick(() => {
						const panneau = document.querySelector('#' + this.id)
						if (panneau && panneau.contains(document.querySelector('#' + this.id + ' .jsPanel-btn-send'))) {
							panneau.setControlStatus('send', 'remove')
						}
					})
				}
			},
			deep: true
		},
		nav () {
			this.positionner()
		},
		export (valeur) {
			if (valeur === true) {
				if (this.statut === 'focus' && this.ancienStatut === 'min') {
					this.statut = 'min'
					this.ancienStatut = ''
				} else if (this.statut === 'focus') {
					this.statut = ''
				}
			}
		},
		statut (statut, ancienStatut) {
			if (ancienStatut === 'focus' && (statut === '' || statut === 'min')) {
				document.querySelector('#masque').remove()
				const panneaux = document.querySelectorAll('.jsPanel')
				panneaux.forEach((panneau) => {
					if (panneau.id !== this.id) {
						panneau.style.display = 'flex'
					} else {
						if (this.verifierRedimensionnement()) {
							panneau.resizeit('enable')
						}
						panneau.dragit('enable')
						panneau.querySelector('.jsPanel-controlbar').removeAttribute('style')
						panneau.style.transform = 'none'
						panneau.style.boxShadow = '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)'
						panneau.style.background = '#fff'
						panneau.querySelector('.jsPanel-hdr').style.visibility = 'visible'
						panneau.querySelector('.jsPanel-content').style.background = '#fff'
						this.x = parseInt(panneau.getAttribute('data-x'), 10)
						this.y = parseInt(panneau.getAttribute('data-y'), 10)
						panneau.style.left = this.x + 'px'
						panneau.style.top = this.y + 'px'
						panneau.removeAttribute('data-x')
						panneau.removeAttribute('data-y')
						if (statut === 'min') {
							panneau.smallify()
						}
						this.positionner()
					}
				})
				document.querySelector('#' + this.id)?.focus()
				document.body.classList.remove('focus')
				if (document.querySelector('nav')) document.querySelector('nav').style.display = 'flex'
				if (document.querySelector('.bouton-cadenas')) document.querySelector('.bouton-cadenas').style.display = 'flex'
				if (document.querySelector('.nav')) document.querySelector('.nav').style.display = 'flex'
				if (document.querySelector('.bouton-export')) document.querySelector('.bouton-export').style.display = 'flex'
				if (document.querySelector('.bouton-plein-ecran')) document.querySelector('.bouton-plein-ecran').style.display = 'flex'
				if (document.querySelector('.bouton-capture')) document.querySelector('.bouton-capture').style.display = 'flex'
				if (document.querySelector('.bouton-annotation')) document.querySelector('.bouton-annotation').style.display = 'flex'
			}
		},
		evenementClavier ({ event, touche, id }) {
			this.gererClavier(event, touche, id, this.panneau.type)
		}
	}
}
