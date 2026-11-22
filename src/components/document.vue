<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" :class="{'masque': mode === 'lecture' && type === 'pdf'}" />
		<div class="conteneur panneau-document" v-if="mode === 'edition'">
			<div class="contenu" v-if="!chargementDocument">
				<label :id="'libelle-document-1_' + id">{{ $t('documentAppareil') }}</label>
				<span :aria-describedby="'libelle-document-1_' + id" role="button" class="bouton" tabindex="0" @keydown.enter.space.prevent="activerInput('selectionner_document_' + id)" @click="activerInput('selectionner_document_' + id)">{{ $t('selectionnerPDF') }}</span>
				<input :id="'selectionner_document_' + id" type="file" @change="televerserDocument" style="display: none" accept=".pdf">
			</div>
			<div class="contenu" v-else>
				<div class="conteneur-chargement">
					<div class="chargement"><span class="lecteur-ecran">{{ $t('chargementEnCours') }}</span></div>
				</div>
			</div>
		</div>
		<div class="conteneur panneau-document" :class="{'large': type === 'pdf'}" v-else>
			<iframe :title="titre || $t('document')" :src="document" allowfullscreen v-if="type === 'pdf' && app.lecteur"></iframe>
			<iframe :title="titre || $t('document')" :src="'./static/pdfjs/web/viewer.html?lang=' + $i18n.locale + '&file=' + document" allowfullscreen crossorigin v-else-if="type === 'pdf'"></iframe>
			<div class="telechargement" v-else>
				<a class="bouton" :href="document" :download="nomDocument">{{ $t('telechargerDocument') }}</a>
			</div>
		</div>
		<div class="conteneur-droite" :class="{'masque': mode === 'lecture' && type === 'pdf'}" />
		<div class="conteneur-bas" :class="{'masque': mode === 'lecture' && type === 'pdf'}" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import Panneau from '@/panneau'

export default {
	name: 'PDocument',
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
			minw: 40,
			minh: 16,
			statut: '',
			dimensions: {},
			position: {},
			document: '',
			dataURL: '',
			type: '',
			chrono: null,
			chargementDocument: false
		}
	},
	computed: {
		nomDocument () {
			const extensions = { text: 'odt', presentation: 'odp', spreadsheet: 'ods', graphics: 'odg' }
			const separateur = this.document.indexOf(',')
			let entete = ''
			try {
				entete = atob(this.document.substring(separateur + 1, separateur + 161))
			} catch {}
			const format = (this.document.substring(0, separateur) + entete).match(/opendocument\.(text|presentation|spreadsheet|graphics)/)
			return (this.titre || 'document') + '.' + (format ? extensions[format[1]] : 'odt')
		}
	},
	watch: {
		chargementDocument (valeur) {
			if (valeur) this.annoncer(this.$t('chargementEnCours'))
		},
		async export (valeur) {
			if (valeur === true && this.type === 'pdf' && !this.app.lecteur) {
				const iframe = document.querySelector('#' + this.id + ' iframe')
				if (iframe && iframe.contentWindow.PDFViewerApplication.pdfDocument !== null) {
					const annotations = iframe.contentWindow.PDFViewerApplication.pdfDocument._transport.annotationStorage.getAll()
					if (annotations === null) {
						this.position = { x: this.x, y: this.y }
						this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { document: this.document, dataURL: this.dataURL, type: this.type }, w: this.w, h: this.h, x: this.x, y: this.y })
					} else {
						const donnees = await iframe.contentWindow.PDFViewerApplication.pdfDocument._transport.saveDocument()
						const blob = new Blob([donnees], { type: 'application/pdf' })
						const reader = new FileReader()
						reader.readAsDataURL(blob)
						reader.onloadend = (e) => {
							this.dataURL = e.target.result
							this.position = { x: this.x, y: this.y }
							this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { document: this.document, dataURL: this.dataURL, type: this.type }, w: this.w, h: this.h, x: this.x, y: this.y })
						}
					}
				} else {
					this.position = { x: this.x, y: this.y }
					this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { document: this.document, dataURL: this.dataURL, type: this.type }, w: this.w, h: this.h, x: this.x, y: this.y })
				}
			} else if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { document: this.document, dataURL: this.dataURL, type: this.type }, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('document')
		if (this.panneau.contenu !== '') {
			this.type = this.panneau.contenu.type
			if (this.type === 'pdf') {
				this.dataURL = this.panneau.contenu.dataURL
				const blob = this.convertirDataURL(this.dataURL)
				this.document = window.URL.createObjectURL(blob)
			} else {
				this.document = this.panneau.contenu.document
				this.statut = ''
			}
		}
		this.genererOptions('document')
		if (this.type === 'doc') {
			this.options.headerControls.maximize = 'remove'
			this.options.headerControls.smallify = 'remove'
		}
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'lecture') {
			this.redimensionnement = true
		}
		if (this.type === 'pdf') {
			this.$nextTick(() => {
				this.enregistrerAnnotations()
			})
		} else if (this.type === 'doc' && this.mode === 'lecture') {
			setTimeout(() => {
				this.ajusterTailleBouton()
			}, 0)
		}
	},
	methods: {
		generer () {
			this.mode = 'lecture'
			this.redimensionnement = true
			this.w = 50
			this.h = 35
			this.$nextTick(() => {
				document.querySelector('#' + this.id)?.focus()
				if (this.type === 'pdf') {
					this.enregistrerAnnotations()
				}
			})
			this.positionner()
		},
		televerserDocument (event) {
			const fichier = event.target.files[0]
			if (fichier) {
				const extension = fichier.name.substring(fichier.name.lastIndexOf('.') + 1)
				if (extension.toLowerCase() === 'pdf') {
					this.chargementDocument = true
					this.type = 'pdf'
					const reader = new FileReader()
					reader.readAsDataURL(fichier)
					reader.onloadend = (e) => {
						this.chargementDocument = false
						this.dataURL = e.target.result
						this.document = window.URL.createObjectURL(fichier)
						this.generer()
					}
				}
			}
		},
		ajusterTailleBouton () {
			const panneau = document.querySelector('#' + this.id)
			const bouton = document.querySelector('#' + this.id + ' .telechargement .bouton')
			if (!panneau || !bouton || bouton.offsetWidth === 0) return
			const entete = panneau.querySelector('.jsPanel-hdr')?.offsetHeight || 0
			const marge = this.convertirRem(2)
			this.w = Math.ceil((bouton.offsetWidth + marge * 2) / this.convertirRem(1))
			this.h = Math.ceil((bouton.offsetHeight + this.convertirRem(0.3) + entete * 2) / this.convertirRem(1))
			this.minw = this.w
			this.minh = this.h
			this.positionner()
		},
		enregistrerAnnotations () {
			if (this.app.lecteur) return
			const iframe = document.querySelector('#' + this.id + ' iframe')
			if (iframe) {
				iframe.addEventListener('load', () => {
					iframe.contentWindow.PDFViewerApplication.initializedPromise.then(() => {
						iframe.contentWindow.PDFViewerApplication.eventBus.on('documentloaded', () => {
							iframe.contentWindow.PDFViewerApplication.eventBus.on('annotationeditorparamschanged', () => {
								const annotations = iframe.contentWindow.PDFViewerApplication.pdfDocument._transport.annotationStorage.getAll()
								if (annotations) {
									if (this.chrono) {
										clearTimeout(this.chrono)
										this.chrono = null
									}
									this.chrono = setTimeout(async () => {
										const donnees = await iframe.contentWindow.PDFViewerApplication.pdfDocument._transport.saveDocument()
										const blob = new Blob([donnees], { type: 'application/pdf' })
										const reader = new FileReader()
										reader.readAsDataURL(blob)
										reader.onloadend = (e) => {
											this.dataURL = e.target.result
										}
										this.chrono = null
									}, 1000)
								}
							})
						})
					}).catch(() => {})
				})
			}
		}
	}
}
</script>

<style>
.panneau .panneau-document.large {
	width: 100%!important;
	height: 100%!important;
	border-bottom-left-radius: 0.7rem;
	border-bottom-right-radius: 0.7rem;
}

.panneau .panneau-document .conteneur-chargement {
	font-size: 0;
	line-height: 1;
	text-align: center;
}

.panneau .panneau-document .chargement {
	display: inline-block;
	border: 7px solid #ddd;
	border-top: 7px solid #00ced1;
	border-radius: 50%;
	width: 45px;
	height: 45px;
	animation: rotation 0.7s linear infinite;
}

.panneau .panneau-document span:where([role="button"]).bouton {
	margin-top: 0;
	margin-bottom: 0!important;
}

.panneau .panneau-document .telechargement {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
}

.panneau .panneau-document .telechargement .bouton {
	margin: 0;
}
</style>
