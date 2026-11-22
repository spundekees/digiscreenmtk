<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-calendrier">
			<div class="contenu">
				<div :id="'calendrier_' + id" />
			</div>
		</div>
		<div class="conteneur-droite" />
		<div class="conteneur-bas" />
	</JsPanel>
</template>

<script>
import JsPanel from '@/components/jspanel.vue'
import VanillaCalendar from 'vanilla-calendar-pro'
import Panneau from '@/panneau'

export default {
	name: 'PCalendrier',
	inject: ['app'],
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
			redimensionnement: false,
			redimensionnementProportionnel: true,
			titre: '',
			id: '',
			w: 0,
			h: 0,
			x: 0,
			y: 0,
			minw: 40,
			minh: 34,
			statut: '',
			dimensions: {},
			position: {}
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: '', echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('calendrier')
		this.genererOptions('calendrier')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		this.$nextTick(() => {
			const options = {
				settings: {
					lang: this.app.langue,
					visibility: {
						weekNumbers: true,
						theme: 'light'
					}
				}
			}
			const calendrier = new VanillaCalendar('#calendrier_' + this.id, options)
			calendrier.init()
			const conteneur = document.querySelector('#calendrier_' + this.id)
			if (!conteneur) return
			const libeller = () => {
				for (const [classe, cle] of [['.vanilla-calendar-arrow_prev', 'moisPrecedent'], ['.vanilla-calendar-arrow_next', 'moisSuivant']]) {
					conteneur.querySelectorAll(classe + ':not([aria-label])').forEach((fleche) => {
						fleche.setAttribute('aria-label', this.$t(cle))
						fleche.setAttribute('title', this.$t(cle))
					})
				}
			}
			libeller()
			this.observateurCalendrier = new MutationObserver(libeller)
			this.observateurCalendrier.observe(conteneur, { childList: true, subtree: true })
		})
	},
	beforeUnmount () {
		this.observateurCalendrier?.disconnect()
	}
}
</script>

<style>
.panneau .panneau-calendrier {
	overflow: hidden!important;
}

.panneau .panneau-calendrier .vc-container {
	border: none;
	color: #001d1d;
}

.panneau .panneau-calendrier [data-calendar-theme=light] .vanilla-calendar-week__day_weekend,
.panneau .panneau-calendrier [data-calendar-theme=light] .vanilla-calendar-day__btn_weekend,
.panneau .panneau-calendrier [data-calendar-theme=light] .vanilla-calendar-day__btn_holiday {
	color: #be123c;
}

.panneau .panneau-calendrier [data-calendar-theme=light] .vanilla-calendar-day__btn_prev,
.panneau .panneau-calendrier [data-calendar-theme=light] .vanilla-calendar-day__btn_next {
	color: #64748b;
}

.panneau .panneau-calendrier [data-calendar-theme=light] .vanilla-calendar-day__btn_today,
.panneau .panneau-calendrier [data-calendar-theme=light] .vanilla-calendar-day__btn_today:hover {
	color: #0e7490;
}
</style>
