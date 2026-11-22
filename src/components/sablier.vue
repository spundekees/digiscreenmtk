<template>
	<JsPanel class="panneau" :visible="!chargement" :options="options" :class="{'fond': (mode === 'decompte' || mode === 'lecture' || mode === 'pause') && statut !== 'focus'}">
		<div class="conteneur-gauche" />
		<div class="conteneur panneau-sablier">
			<div class="contenu" v-if="mode === 'edition'">
				<div class="sablier edition">
					<div class="minutes">
						<label :for="'minutes_' + id">{{ $t('minutes') }}</label>
						<input :id="'minutes_' + id" type="number" :value="minutes" :min="0" @input="minutes = $event.target.value">
					</div>
					<div class="secondes">
						<label :for="'secondes_' + id">{{ $t('secondes') }}</label>
						<input :id="'secondes_' + id" type="number" :value="secondes" :min="0" :max="59" @input="secondes = $event.target.value">
					</div>
				</div>
				<div class="actions">
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
			<div class="contenu" v-else>
				<div class="lecteur-ecran" role="timer">{{ $t('tempsRestant') }} {{ texteTempsRestant }}</div>
				<div class="sablier" aria-hidden="true">
					<div class="cadre">
						<div class="haut"></div>
						<div class="bas">
							<div class="ecoulement" v-show="affichageEcoulement"></div>
							<div class="verre"></div>
						</div>
					</div>
				</div>
				<div class="actions">
					<span class="bouton danger" role="alert" v-if="tempsEcoule">{{ $t('tempsEcoule') }}</span>
					<button type="button" class="bouton redemarrer" @click="redemarrer" v-if="tempsEcoule && mode === 'lecture'">{{ $t('redemarrer') }}</button>
					<button type="button" class="bouton demarrer" @click="demarrer(0)" v-else-if="!tempsEcoule && mode === 'lecture'">{{ $t('demarrer') }}</button>
					<button type="button" class="bouton pause" :title="$t('pause')" :aria-label="$t('pause')" @click="pause" v-else-if="!tempsEcoule && mode === 'decompte'"><i class="material-icons" aria-hidden="true">pause</i></button>
					<button type="button" class="bouton continuer" :title="$t('demarrer')" :aria-label="$t('demarrer')" @click="continuer" v-else-if="!tempsEcoule && mode === 'pause'"><i class="material-icons" aria-hidden="true">play_arrow</i></button>
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
	name: 'PSablier',
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
			minh: 20,
			statut: '',
			dimensions: {},
			position: {},
			minutes: 0,
			secondes: 0,
			duree: '',
			dureeMs: 0,
			dureeAnimation: '0ms',
			statutAnimation: 'paused',
			affichageEcoulement: false,
			decompte: '',
			tempsRestant: '',
			secondesRestantes: 0,
			tempsEcoule: false
		}
	},
	computed: {
		texteTempsRestant () {
			const minutes = Math.floor(this.secondesRestantes / 60)
			const secondes = this.secondesRestantes % 60
			return (minutes < 10 ? '0' + minutes : minutes) + ':' + (secondes < 10 ? '0' + secondes : secondes)
		}
	},
	watch: {
		export (valeur) {
			if (valeur === true) {
				this.position = { x: this.x, y: this.y }
				this.$emit('export', { id: this.id, titre: this.titre, mode: this.mode, statut: this.statut, dimensions: this.dimensions, position: this.position, contenu: { minutes: this.minutes, secondes: this.secondes }, echelle: this.echelle, w: this.w, h: this.h, x: this.x, y: this.y })
			}
		}
	},
	created () {
		this.definirCaracteristiques('sablier')
		if (this.panneau.contenu !== '') {
			this.minutes = this.panneau.contenu.minutes
			this.secondes = this.panneau.contenu.secondes
		}
		if (this.mode === 'lecture' || this.mode === 'decompte' || this.mode === 'pause') {
			this.generer()
		}
		this.genererOptions('sablier')
	},
	mounted () {
		this.initialiser()
		this.positionner()
		this.chargement = false
		if (this.mode === 'edition' && this.statut !== 'min') {
			setTimeout(() => {
				document.querySelector('#' + this.id + ' .minutes input')?.focus()
			}, 0)
		}
	},
	methods: {
		generer () {
			if (this.minutes >= 1 || this.secondes >= 1) {
				this.mode = 'lecture'
				this.dureeMs = (((parseInt(this.minutes) * 60) + parseInt(this.secondes)) * 1000) - 1000
				this.dureeAnimation = this.dureeMs + 'ms'
				this.secondesRestantes = (parseInt(this.minutes) * 60) + parseInt(this.secondes)
				this.w = 40
				this.h = 40
				setTimeout(() => {
					if (this.statut !== 'min') {
						document.querySelector('#' + this.id + ' .bouton')?.focus()
					}
				}, 20)
				this.positionner()
			}
		},
		editer () {
			this.mode = 'edition'
			this.duree = ''
			this.dureeMs = 0
			this.dureeAnimation = '0ms'
			this.statutAnimation = 'paused'
			this.affichageEcoulement = false
			this.tempsEcoule = false
			if (this.decompte !== '') {
				clearInterval(this.decompte)
				this.decompte = ''
			}
			this.w = 40
			this.h = 20
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' .minutes input')?.focus()
			})
			this.positionner()
		},
		demarrer (duree) {
			if (duree === 0) {
				const date = Date.parse(new Date())
				this.duree = new Date(date + this.dureeMs)
			} else {
				this.duree = duree
			}
			this.decompter()
			this.decompte = setInterval(this.decompter, 1000)
			this.mode = 'decompte'
			this.statutAnimation = 'running'
			this.affichageEcoulement = true
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' .bouton.pause')?.focus()
			})
		},
		redemarrer () {
			if (this.decompte !== '') {
				clearInterval(this.decompte)
			}
			const sablierEl = document.querySelector('#' + this.id + ' .sablier')
			if (sablierEl) sablierEl.style.display = 'none'
			setTimeout(() => {
				const sablierElDelayed = document.querySelector('#' + this.id + ' .sablier')
				if (sablierElDelayed) sablierElDelayed.style.display = 'block'
			}, 0)
			this.tempsEcoule = false
			this.mode = 'decompte'
			this.dureeMs = (((parseInt(this.minutes) * 60) + parseInt(this.secondes)) * 1000) - 1000
			this.dureeAnimation = this.dureeMs + 'ms'
			this.demarrer(0)
		},
		decompter () {
			const tempsRestant = Date.parse(this.duree) - Date.parse(new Date())
			this.secondesRestantes = Math.max(0, Math.ceil(tempsRestant / 1000))
			if (tempsRestant <= 0) {
				clearInterval(this.decompte)
				this.tempsEcoule = true
				this.mode = 'lecture'
				this.dureeMs = 0
			}
		},
		pause () {
			clearInterval(this.decompte)
			this.tempsRestant = Date.parse(this.duree) - Date.parse(new Date())
			this.mode = 'pause'
			this.statutAnimation = 'paused'
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' .bouton.continuer')?.focus()
			})
		},
		continuer () {
			this.duree = new Date(Date.parse(new Date()) + this.tempsRestant)
			this.demarrer(this.duree)
			this.mode = 'decompte'
			this.$nextTick(() => {
				document.querySelector('#' + this.id + ' .bouton.pause')?.focus()
			})
		}
	}
}
</script>

<style>
.panneau.fond {
	background: #052f5f;
}

.sablier .minutes,
.sablier .secondes {
	display: inline-block;
}

.sablier .minutes {
	margin-right: 2rem;
}

.sablier + .actions {
	display: flex;
	justify-content: center;
	align-items: center;
}

.sablier + .actions .bouton {
	margin-right: 2rem;
}

.sablier + .actions .bouton:last-child {
	margin-right: 0;
}

.sablier .bouton.danger:hover,
.sablier .bouton.danger {
	color: #001d1d!important;
	background: #ff7575!important;
	cursor: default;
}

.sablier.edition + .actions {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 2rem;
}

.sablier.edition + .actions .bouton {
	margin-top: 0;
}

.sablier:not(.edition) {
	position: relative;
	display: block;
	margin: 2rem auto;
	width: 18rem;
	height: 22rem;
	overflow: hidden;
	box-sizing: content-box;
}

.sablier .cadre {
	position: absolute;
	width: 18rem;
	height: 20rem;
	border-top: 1rem solid #c19875;
	border-bottom: 1rem solid #c19875;
	box-sizing: content-box;
}

.sablier .haut {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	width: 16rem;
	height: 10rem;
	clip-path: polygon(45% 100%, 55% 100%, 100% 0, 0 0);
}

.sablier .haut:before {
	content: '';
	position: absolute;
	width: 16rem;
	height: 9rem;
	left: 0;
	bottom: 0;
	background: #edd0aa;
	animation: descenteSableHaut v-bind('dureeAnimation') linear 0s 1 normal forwards v-bind('statutAnimation');
	box-sizing: content-box;
}

@keyframes descenteSableHaut {
	0% {
		transform: translateY(0);
	}
	100% {
		transform: translateY(9rem);
	}
}

.sablier .haut:after {
	content: '';
	position: absolute;
	top: 0;
	left: -1.5rem;
	width: 19rem;
	height: 19rem;
	transform: rotate(-90deg);
	background: conic-gradient(from 0deg, white 0deg, transparent 90deg, white 180deg);
	box-sizing: content-box;
}

.sablier .bas {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	top: 10rem;
	width: 16rem;
	height: 10rem;
	clip-path: polygon(45% 0, 55% 0, 100% 100%, 0 100%);
}

.sablier .bas:before {
	content: '';
	position: absolute;
	transform: translateX(-50%);
	left: 50%;
	width: 16rem;
	height: 8rem;
	bottom: 0;
	background: #edd0aa;
	animation: monteeSableBas v-bind('dureeAnimation') linear 0s 1 normal forwards v-bind('statutAnimation');
	box-sizing: content-box;
}

@keyframes monteeSableBas {
	0% {
		transform: translate(-50%, 8rem);
		border-radius: 0;
	}
	100% {
		transform: translateX(-50%);
		border-radius: 50% 50% 0 0;
	}
}

.sablier .ecoulement {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	width: 0;
	height: 0;
	border-left: 0.8rem solid transparent;
	border-right: 0.8rem solid transparent;
	border-top: 1rem solid #edd0aa;
	animation: fonduEcoulement v-bind('dureeAnimation') linear 0s 1 normal forwards v-bind('statutAnimation');
}

@keyframes fonduEcoulement {
	0% {
		opacity: 1;
	}
	85% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}

.sablier .ecoulement:before {
	content: '';
	position: absolute;
	left: -0.1rem;
	width: 0.2rem;
	height: 25rem;
	background: repeating-linear-gradient(to bottom, #edd0aa, #edd0aa 0.5rem, transparent 0.5rem, transparent 1rem);
	animation: ecoulement 5s linear 0s infinite normal v-bind('statutAnimation');
	box-sizing: content-box;
}

@keyframes ecoulement {
	0% {
		transform: translateY(-15rem);
		opacity: 1;
	}
	99% {
		opacity: 1;
	}
	100% {
		transform: translateY(0);
	}
}

.sablier .verre {
	position: absolute;
	top: -9rem;
	left: -1.5rem;
	width: 19rem;
	height: 19rem;
	transform: rotate(-270deg);
	background: conic-gradient(
		from 0deg, 
		white 0deg, 
		transparent 90deg,
		white 180deg
	);
}
</style>
