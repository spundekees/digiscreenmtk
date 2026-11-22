<template>
	<div class="conteneur-modale" @keydown="gererClavierInfo">
		<div id="modale-info" class="modale" role="dialog" aria-modal="true" :aria-label="$t('aProposDigiscreen')" :inert="hub">
			<header>
				<span class="titre">{{ $t('aProposDigiscreen') }}</span>
				<button type="button" class="fermer" :title="$t('fermer')" :aria-label="$t('fermer')" @click="app.fermerModale"><i class="material-icons" aria-hidden="true">close</i></button>
			</header>
			<div class="conteneur">
				<div class="contenu">
					<p><b>Digiscreen</b> {{ $t('digiscreen') }} <span><a href="https://ladigitale.dev/" target="_blank" rel="noreferrer"><u><b>La Digitale</b></u><span class="lecteur-ecran"> ({{ $t('nouvelOnglet') }})</span></a></span>.</p>
					<p class="contact">{{ $t('contact') }} <a href="https://ladigitale.dev/emmanuel-zimmert.html" target="_blank" rel="noreferrer">Emmanuel ZIMMERT<span class="lecteur-ecran"> ({{ $t('nouvelOnglet') }})</span></a><span aria-hidden="true"> // </span>ez[at]ladigitale.dev</p>
					<p><a href="https://ladigitale.dev/contribuer.html" target="_blank" rel="noreferrer">{{ $t('soutien') }}<span class="lecteur-ecran"> ({{ $t('nouvelOnglet') }})</span></a></p>
					<p class="version-mtk">{{ $t('versionMtk') }} <a href="https://github.com/spundekees/digiscreenmtk" target="_blank" rel="noreferrer"><u>{{ $t('codeSourceMtk') }}</u><span class="lecteur-ecran"> ({{ $t('nouvelOnglet') }})</span></a></p>
					<p class="credits">{{ new Date().getFullYear() }}<span aria-hidden="true"> - </span><a href="https://ladigitale.dev" target="_blank" rel="noreferrer">La Digitale<span class="lecteur-ecran"> ({{ $t('nouvelOnglet') }})</span></a><span aria-hidden="true"> - </span><a href="https://codeberg.org/ladigitale/digiscreen" target="_blank" rel="noreferrer">{{ $t('codeSource') }}<span class="lecteur-ecran"> ({{ $t('nouvelOnglet') }})</span></a><span aria-hidden="true"> - </span><a href="https://codeberg.org/ladigitale/digiscreen/releases" target="_blank" rel="noreferrer">v{{ version }}<span class="lecteur-ecran"> ({{ $t('nouvelOnglet') }})</span></a><span aria-hidden="true"> - </span><a class="doc" href="https://doc.ladigitale.dev/doku.php?id=digiscreen" target="_blank" rel="noreferrer" :title="$t('voirDocumentation')" :aria-label="$t('voirDocumentation') + ' (' + $t('nouvelOnglet') + ')'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="30px" height="30px" fill="#001d1d" aria-hidden="true"><path d="M511.83-256.83Q524-269 524-286.67q0-17.66-12.17-29.83-12.16-12.17-29.83-12.17-17.67 0-29.83 12.17Q440-304.33 440-286.67q0 17.67 12.17 29.84 12.16 12.16 29.83 12.16 17.67 0 29.83-12.16Zm-65.16-136.5h64q0-28.34 6.83-49 6.83-20.67 41.17-50.34 29.33-26 43-50.5 13.66-24.5 13.66-55.5 0-54-36.66-85.33-36.67-31.33-93.34-31.33-51.66 0-88.5 26.33Q360-662.67 344-620l57.33 22q9-24.67 29.5-42t52.5-17.33q33.34 0 52.67 18.16 19.33 18.17 19.33 44.5 0 21.34-12.66 40.17-12.67 18.83-35.34 37.83-34.66 30.34-47.66 54-13 23.67-13 69.34ZM480-80q-82.33 0-155.33-31.5-73-31.5-127.34-85.83Q143-251.67 111.5-324.67T80-480q0-83 31.5-156t85.83-127q54.34-54 127.34-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82.33-31.5 155.33-31.5 73-85.5 127.34Q709-143 636-111.5T480-80Zm0-66.67q139.33 0 236.33-97.33t97-236q0-139.33-97-236.33t-236.33-97q-138.67 0-236 97-97.33 97-97.33 236.33 0 138.67 97.33 236 97.33 97.33 236 97.33ZM480-480Z"/></svg></a><span aria-hidden="true"> - </span><button type="button" class="hub" :title="$t('afficherHub')" :aria-label="$t('afficherHub')" @click="ouvrirHub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" width="30px" height="30px" fill="#001d1d" aria-hidden="true"><path d="M180.5-180.5Q160-201 160-230.67q0-29.66 20.5-50.16 20.5-20.5 50.17-20.5 29.66 0 50.16 20.5 20.5 20.5 20.5 50.16 0 29.67-20.5 50.17T230.67-160q-29.67 0-50.17-20.5Zm249.33 0q-20.5-20.5-20.5-50.17 0-29.66 20.5-50.16 20.5-20.5 50.17-20.5t50.17 20.5q20.5 20.5 20.5 50.16 0 29.67-20.5 50.17T480-160q-29.67 0-50.17-20.5Zm249.34 0q-20.5-20.5-20.5-50.17 0-29.66 20.5-50.16 20.5-20.5 50.16-20.5 29.67 0 50.17 20.5t20.5 50.16q0 29.67-20.5 50.17T729.33-160q-29.66 0-50.16-20.5ZM180.5-429.83Q160-450.33 160-480t20.5-50.17q20.5-20.5 50.17-20.5 29.66 0 50.16 20.5 20.5 20.5 20.5 50.17t-20.5 50.17q-20.5 20.5-50.16 20.5-29.67 0-50.17-20.5Zm249.33 0q-20.5-20.5-20.5-50.17t20.5-50.17q20.5-20.5 50.17-20.5t50.17 20.5q20.5 20.5 20.5 50.17t-20.5 50.17q-20.5 20.5-50.17 20.5t-50.17-20.5Zm249.34 0q-20.5-20.5-20.5-50.17t20.5-50.17q20.5-20.5 50.16-20.5 29.67 0 50.17 20.5T800-480q0 29.67-20.5 50.17t-50.17 20.5q-29.66 0-50.16-20.5ZM180.5-679.17q-20.5-20.5-20.5-50.16 0-29.67 20.5-50.17t50.17-20.5q29.66 0 50.16 20.5 20.5 20.5 20.5 50.17 0 29.66-20.5 50.16-20.5 20.5-50.16 20.5-29.67 0-50.17-20.5Zm249.33 0q-20.5-20.5-20.5-50.16 0-29.67 20.5-50.17T480-800q29.67 0 50.17 20.5t20.5 50.17q0 29.66-20.5 50.16-20.5 20.5-50.17 20.5t-50.17-20.5Zm249.34 0q-20.5-20.5-20.5-50.16 0-29.67 20.5-50.17t50.16-20.5q29.67 0 50.17 20.5t20.5 50.17q0 29.66-20.5 50.16-20.5 20.5-50.17 20.5-29.66 0-50.16-20.5Z"/></svg></button></p>
				</div>
			</div>
		</div>
		<div id="hub" :class="{'ouvert': hub}" role="dialog" aria-modal="true" aria-label="Le Hub by La Digitale" :inert="!hub || null">
			<button type="button" :title="$t('fermer')" :aria-label="$t('fermer')" @click="fermerHub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" width="36px" height="36px" aria-hidden="true"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
			<iframe src="https://ladigitale.dev/hub.html" title="Le Hub by La Digitale"></iframe>
		</div>
	</div>
</template>

<script>
export default {
	name: 'MInfo',
	inject: ['app'],
	data () {
		return {
			hub: false,
			elementPrecedent: null,
			version: app_version
		}
	},
	mounted () {
		this.$nextTick(() => {
			document.querySelector('#modale-info button')?.focus()
		})
		this.elementPrecedent = (document.activeElement || document.body)
		window.addEventListener('message', this.gererMessageHub, false)
	},
	beforeUnmount () {
		window.removeEventListener('message', this.gererMessageHub, false)
	},
	methods: {
		gererClavierInfo (event) {
			if (this.hub && event.key === 'Escape') {
				this.fermerHub()
			} else if (event.key === 'Tab') {
				const modale = document.querySelector(this.hub ? '#hub' : '#modale-info')
				this.app.piegerFocus(event, modale)
			}
		},
		gererFocus () {
			this.$nextTick(() => {
				if (this.elementPrecedent) {
					this.elementPrecedent.focus()
					this.elementPrecedent = null
				}
			})
		},
		ouvrirHub () {
			this.elementPrecedent = (document.activeElement || document.body)
			this.hub = true
			this.$nextTick(() => {
				document.querySelector('#hub button')?.focus()
			})
		},
		gererMessageHub (event) {
			if (event.origin !== 'https://ladigitale.dev') return
			if (typeof event.data !== 'object' || event.data === null) return
			if (event.data.message === 'fermer-hub') {
				this.fermerHub()
			}
		},
		fermerHub () {
			this.hub = false
			this.gererFocus()
		}
	}
}
</script>

<style scoped>
p.version-mtk {
	padding-top: 1rem;
	border-top: 1px solid #ddd;
	font-size: 0.9em;
}

p.credits {
	display: flex;
	justify-content: center;
	align-items: center;
}

p.credits a {
	margin: 0 5px;
}

p.credits a.doc,
p.credits .hub {
	display: inline-flex;
	font-size: 0;
	line-height: 0;
}

p.credits a.doc {
	margin: 0 3px;
}

p.credits .hub {
	margin-left: 3px;
	cursor: pointer;
}

#hub {
	position: fixed;
	visibility: hidden;
	opacity: 0;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
	z-index: 100000;
}

#hub.ouvert {
	visibility: visible;
	opacity: 1;
    animation: fonduEntrant linear 0.1s;
}

#hub iframe {
	width: 100%;
    height: 100%;
}

#hub button {
	font-size: 0;
	color: #fff;
	position: absolute;
	top: 15px;
	right: 15px;
	cursor: pointer;
}

@media screen and (max-width: 599px) {
	#hub button {
		top: 5px;
		right: 5px;
	}
	
	#hub button svg {
		width: 24px;
		height: 24px;
	}
}
</style>
