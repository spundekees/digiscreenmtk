<template>
	<div class="conteneur-modale" @keydown="gererClavierGrille">
		<div id="modale-grille" class="modale" role="dialog" aria-modal="true" :aria-label="$t('grille')">
			<header>
				<span class="titre">{{ $t('grille') }}</span>
				<button type="button" class="fermer" :title="$t('fermer')" :aria-label="$t('fermer')" @click="app.fermerModale"><i class="material-icons" aria-hidden="true">close</i></button>
			</header>
			<div class="conteneur modale-grille">
				<div class="contenu">
					<div class="grille">
						<div class="colonnes">
							<label for="nombre-colonnes">{{ $t('nombreColonnes') }} (max. 5)</label>
							<input id="nombre-colonnes" type="number" :value="colonnes" :min="2" :max="5" @input="colonnes = $event.target.value">
						</div>
						<div class="lignes">
							<label for="nombre-lignes">{{ $t('nombreLignes') }} (max. 5)</label>
							<input id="nombre-lignes" type="number" :value="lignes" :min="1" :max="5" @input="lignes = $event.target.value">
						</div>
					</div>
					<div class="fond">
						<label id="libelle-couleur-grille">{{ $t('couleurFond') }}</label>
						<div class="couleurs" role="group" aria-labelledby="libelle-couleur-grille">
							<button type="button" class="blanc" :aria-pressed="couleur === 'blanc' ? 'true' : 'false'" :class="{'selectionne': couleur === 'blanc'}" :title="$t('blanc')" :aria-label="$t('blanc')" @click="couleur = 'blanc'" ></button>
							<button type="button" class="gris" :aria-pressed="couleur === 'gris' ? 'true' : 'false'" :class="{'selectionne': couleur === 'gris'}" :title="$t('gris')" :aria-label="$t('gris')" @click="couleur = 'gris'" ></button>
							<button type="button" class="vert" :aria-pressed="couleur === 'vert' ? 'true' : 'false'" :class="{'selectionne': couleur === 'vert'}" :title="$t('vert')" :aria-label="$t('vert')" @click="couleur = 'vert'" ></button>
							<button type="button" class="bleu" :aria-pressed="couleur === 'bleu' ? 'true' : 'false'" :class="{'selectionne': couleur === 'bleu'}" :title="$t('bleu')" :aria-label="$t('bleu')" @click="couleur = 'bleu'" ></button>
							<button type="button" class="jaune" :aria-pressed="couleur === 'jaune' ? 'true' : 'false'" :class="{'selectionne': couleur === 'jaune'}" :title="$t('jaune')" :aria-label="$t('jaune')" @click="couleur = 'jaune'" ></button>
							<button type="button" class="rouge" :aria-pressed="couleur === 'rouge' ? 'true' : 'false'" :class="{'selectionne': couleur === 'rouge'}" :title="$t('rouge')" :aria-label="$t('rouge')" @click="couleur = 'rouge'" ></button>
							<button type="button" class="transparent" :aria-pressed="couleur === 'transparent' ? 'true' : 'false'" :class="{'selectionne': couleur === 'transparent'}" :title="$t('transparent')" :aria-label="$t('transparent')" @click="couleur = 'transparent'" ></button>
						</div>
					</div>
					<button type="button" class="bouton" @click="generer">{{ $t('valider') }}</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'MGrille',
	inject: ['app'],
	data () {
		return {
			titre: '',
			colonnes: 2,
			lignes: 1,
			couleur: 'blanc'
		}
	},
	mounted () {
		this.titre = this.$t('grille')
		this.$nextTick(() => {
			document.querySelector('#nombre-colonnes')?.focus()
		})
	},
	methods: {
		generer () {
			if (this.colonnes >= 2 && this.colonnes <= 5 && this.lignes >= 1 && this.lignes <= 5) {
				this.app.pages[this.app.page - 1].grille = { colonnes: this.colonnes, lignes: this.lignes, couleur: this.couleur }
				this.app.fermerModale()
			}
		},
		gererClavierGrille (event) {
			if (this.hub && event.key === 'Escape') {
				this.fermerHub()
			} else if (event.key === 'Tab') {
				const modale = document.querySelector('#modale-grille')
				this.app.piegerFocus(event, modale)
			}
		}
	}
}
</script>

<style>
.modale-grille .grille {
	display: flex;
    justify-content: space-evenly;
    margin-bottom: 2rem;
}

.modale-grille .couleurs {
	display: flex;
    justify-content: space-evenly;
}

.modale-grille .couleurs button {
	display: inline-block;
	width: 4rem;
	height: 4rem;
	border: 2px solid #aaa;
	border-radius: 50%;
	cursor: pointer;
}

.modale-grille .couleurs button.selectionne {
	border: 0.4rem solid #444;
}

.modale-grille .couleurs button.gris {
	background: #ddd;
}

.modale-grille .couleurs button.bleu {
	background: #97fdff;
}

.modale-grille .couleurs button.vert {
	background: #9ffbc9;
}

.modale-grille .couleurs button.jaune {
	background: #eeec8e;
}

.modale-grille .couleurs button.rouge {
	background: #fcbcc9;
}

.modale-grille .couleurs button.transparent {
	background-image: url('@/assets/img/transparent.png');
	background-repeat: no-repeat;
	background-size: cover;
	background-position: center;
}
</style>
