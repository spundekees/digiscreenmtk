// Automatische Sicherung im Browser + Speichern-Erinnerung (Medienzentrum MTK)
//
// - Die Tafel wird regelmäßig in der IndexedDB dieses Browsers gesichert (nicht auf dem Server).
// - Beim nächsten Öffnen wird angeboten, die letzte Sicherung wiederherzustellen.
// - Sicherungen verfallen nach 7 Tagen (geteilte Schulrechner).
// - Wurde länger gearbeitet, ohne die Tafel als Datei zu speichern, erscheint ein Hinweis.
const DB_NAME = 'digiscreen-mtk'
const STORE = 'sauvegarde'
const CLE = 'derniere'
const INTERVALLE_SAUVEGARDE = 30 * 1000
const DUREE_VIE = 7 * 24 * 60 * 60 * 1000
const DELAI_RAPPEL = 15 * 60 * 1000

function ouvrirBase () {
	return new Promise((resolve, reject) => {
		if (!window.indexedDB) {
			reject(new Error('IndexedDB nicht verfügbar'))
			return
		}
		const requete = window.indexedDB.open(DB_NAME, 1)
		requete.onupgradeneeded = () => requete.result.createObjectStore(STORE)
		requete.onsuccess = () => resolve(requete.result)
		requete.onerror = () => reject(requete.error)
	})
}

async function operation (mode, action) {
	const base = await ouvrirBase()
	return new Promise((resolve, reject) => {
		const transaction = base.transaction(STORE, mode)
		const requete = action(transaction.objectStore(STORE))
		transaction.oncomplete = () => {
			base.close()
			resolve(requete ? requete.result : undefined)
		}
		transaction.onerror = () => {
			base.close()
			reject(transaction.error)
		}
	})
}

export default {
	data () {
		return {
			sauvegardeTrouvee: null,
			rappelSauvegarde: false,
			sauvegardeEmpreinte: '',
			empreinteFichier: '',
			debutModifications: 0,
			rappelMasqueJusqua: 0
		}
	},
	watch: {
		// Jede Änderung (Zeichnung, Seite, Panel) kurz danach sichern – nicht erst nach 30 Sekunden
		pages: {
			handler () {
				this.planifierSauvegarde()
			},
			deep: true
		},
		panneaux: {
			handler () {
				this.planifierSauvegarde()
			},
			deep: true
		}
	},
	computed: {
		dateSauvegardeTrouvee () {
			if (!this.sauvegardeTrouvee) {
				return ''
			}
			return new Date(this.sauvegardeTrouvee.date).toLocaleString(this.langue || 'de', { dateStyle: 'medium', timeStyle: 'short' })
		}
	},
	mounted () {
		this.intervalleSauvegarde = setInterval(this.sauvegarderAuto, INTERVALLE_SAUVEGARDE)
		document.addEventListener('visibilitychange', this.sauvegarderSiCache, false)
		window.addEventListener('pagehide', this.sauvegarderImmediat, false)
	},
	beforeUnmount () {
		clearInterval(this.intervalleSauvegarde)
		clearTimeout(this.minuterieSauvegarde)
		document.removeEventListener('visibilitychange', this.sauvegarderSiCache, false)
		window.removeEventListener('pagehide', this.sauvegarderImmediat, false)
	},
	methods: {
		donneesSauvegarde () {
			return {
				pages: this.pages,
				page: this.page,
				panneaux: this.panneaux.filter(panneau => !this.corbeille.map(p => p.id).includes(panneau.id)),
				modules: this.modules,
				langue: this.langue,
				nav: this.nav,
				lectureSeule: this.lectureSeule,
				ecran: { largeur: this.largeur, hauteur: this.hauteur },
				fonte: this.fonte
			}
		},
		tafelHatInhalt (donnees) {
			if (donnees.panneaux && donnees.panneaux.length > 0) {
				return true
			}
			return (donnees.pages || []).some(page => page.annotations && Array.isArray(page.annotations.items) && page.annotations.items.length > 0)
		},
		sauvegardePossible () {
			return !this.lectureSeule && !this.chargement && !this.chargementPage && !this.importDonnees && !this.sauvegardeTrouvee && !(this.export && this.export.type)
		},
		sauvegarderAuto () {
			if (!this.sauvegardePossible() || document.hidden) {
				return
			}
			// Offene Panels liefern ihren aktuellen Inhalt nur über den Export-Mechanismus
			this.export = { type: 'sauvegarde' }
			this.exportDonnees = true
			if (this.panneauxPage.length === 0) {
				this.exportTermine = true
			}
			// Sicherheitsnetz: antwortet ein Panel nicht, den Export-Zustand nicht blockiert lassen
			setTimeout(() => {
				if (this.export && this.export.type === 'sauvegarde') {
					this.exportDonnees = false
					this.export = {}
					this.exportTermine = false
					this.panneauxExportes = 0
				}
			}, 5000)
		},
		planifierSauvegarde () {
			if (this.lectureSeule || this.chargement || this.importDonnees || this.sauvegardeTrouvee) {
				return
			}
			clearTimeout(this.minuterieSauvegarde)
			this.minuterieSauvegarde = setTimeout(this.sauvegarderImmediat, 800)
		},
		sauvegarderSiCache () {
			if (document.hidden) {
				this.sauvegarderImmediat()
			}
		},
		sauvegarderImmediat () {
			// Beim Verlassen bleibt keine Zeit für den Export der Panels: aktuellen Stand direkt sichern
			if (this.lectureSeule || this.chargement || this.sauvegardeTrouvee) {
				return
			}
			this.ecrireSauvegarde(this.donneesSauvegarde())
		},
		terminerSauvegardeAuto () {
			const donnees = this.donneesSauvegarde()
			this.exportDonnees = false
			this.export = {}
			this.exportTermine = false
			this.panneauxExportes = 0
			this.ecrireSauvegarde(donnees)
		},
		ecrireSauvegarde (donnees) {
			let texte
			try {
				texte = JSON.stringify(donnees)
			} catch {
				return
			}
			if (!this.tafelHatInhalt(donnees)) {
				return
			}
			this.verifierRappel(texte)
			if (texte === this.sauvegardeEmpreinte) {
				return
			}
			this.sauvegardeEmpreinte = texte
			operation('readwrite', store => store.put({ date: Date.now(), donnees: texte }, CLE)).catch(() => {})
		},
		verifierRappel (texte) {
			// Hinweis, wenn seit 15 Minuten ungespeicherte Änderungen bestehen
			if (texte === this.empreinteFichier) {
				this.debutModifications = 0
				this.rappelSauvegarde = false
				return
			}
			const maintenant = Date.now()
			if (!this.debutModifications) {
				this.debutModifications = maintenant
			}
			if (maintenant - this.debutModifications >= DELAI_RAPPEL && maintenant >= this.rappelMasqueJusqua) {
				this.rappelSauvegarde = true
			}
		},
		marquerFichierEnregistre () {
			try {
				this.empreinteFichier = JSON.stringify(this.donneesSauvegarde())
			} catch {}
			this.debutModifications = 0
			this.rappelSauvegarde = false
		},
		enregistrerTafel () {
			this.rappelSauvegarde = false
			this.exporter('pages')
		},
		rappelPlusTard () {
			this.rappelSauvegarde = false
			this.rappelMasqueJusqua = Date.now() + 30 * 60 * 1000
		},
		async chercherSauvegarde () {
			if (this.lectureSeule || /[?&](dgs|dgt|id)=/.test(window.location.search)) {
				return
			}
			try {
				const sauvegarde = await operation('readonly', store => store.get(CLE))
				if (!sauvegarde || !sauvegarde.donnees) {
					return
				}
				if (Date.now() - sauvegarde.date > DUREE_VIE) {
					await operation('readwrite', store => store.delete(CLE))
					return
				}
				const donnees = JSON.parse(sauvegarde.donnees)
				if (this.tafelHatInhalt(donnees)) {
					this.sauvegardeTrouvee = { date: sauvegarde.date, donnees }
				}
			} catch {}
		},
		restaurerSauvegarde () {
			const donnees = this.sauvegardeTrouvee.donnees
			this.sauvegardeTrouvee = null
			this.chargerDonneesImport(donnees)
		},
		ignorerSauvegarde () {
			this.sauvegardeTrouvee = null
			this.sauvegardeEmpreinte = ''
			operation('readwrite', store => store.delete(CLE)).catch(() => {})
		}
	}
}
