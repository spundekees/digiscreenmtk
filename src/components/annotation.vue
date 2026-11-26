<template>
	<TransitionGroup name="fondu">
		<div id="annotation" :class="{'curseur': this.outilDeplacer, 'avec-nav': nav}" key="canva">
			<v-stage ref="stage" :config="configStage" @pointerdown="selectionnerDebut" @pointermove="selectionnerMouvement" @pointerup="selectionnerFin" @pointercancel="selectionnerFin">
				<v-layer ref="objets">
					<template v-for="item in items" :key="item.name">
						<v-rect :config="item" v-if="item.objet === 'rectangle' || item.objet === 'rectangle-plein' || item.objet === 'surlignage'" @dragstart="selectionnerObjet" @dragend="deplacerFin" @transformend="redimensionnerFin" />
						<v-ellipse :config="item" v-else-if="item.objet === 'cercle' || item.objet === 'cercle-plein'" @dragend="deplacerFin" @transformend="redimensionnerFin" @dragstart="selectionnerObjet" />
						<v-star :config="item" v-else-if="item.objet === 'etoile'" @dragstart="selectionnerObjet" @dragend="deplacerFin" @transformend="redimensionnerFin" />
						<v-line :config="item" v-else-if="item.objet === 'ligne'" @dragstart="selectionnerObjet" @dragmove="deplacerForme" @dragend="enregistrer" />
						<v-arrow :config="item" v-else-if="item.objet === 'fleche'" @dragstart="selectionnerObjet" @dragmove="deplacerForme" @dragend="enregistrer" />
						<v-circle :config="item" v-else-if="item.objet === 'ancre'" @dragstart="selectionnerObjet" @dragmove="deplacerAncre" @dragend="enregistrer" />
						<v-text :config="item" v-else-if="item.objet === 'texte'" @dragstart="selectionnerObjet" @dragend="deplacerFin" @dblclick="modifierTexte" @dbltap="modifierTexte" @transform="redimensionnerTexte" @transformend="redimensionnerFin" />
						<v-label :config="item" v-else-if="item.objet === 'label'" @dragstart="selectionnerObjet" @dragend="deplacerFin" @dblclick="modifierTexte" @dbltap="modifierTexte" @transformend="redimensionnerFin">
							<v-tag :config="item.tag" />
							<v-text :config="item.text" />
						</v-label>
						<v-line :config="item" v-else-if="item.objet === 'dessin'" @dragstart="selectionnerObjet" @dragend="deplacerFin" />
						<v-line :config="item" v-else-if="item.objet === 'gomme'" />
						<v-path :config="item" v-else-if="item.objet === 'remplissage'" @dragstart="selectionnerObjet" @dragend="deplacerFin" @transformend="redimensionnerFin" />
					</template>
					<v-rect :config="configSelection" @dragend="deplacerFin" @transformend="redimensionnerFin" />
					<v-rect :config="configCreationRectangle" @dragend="deplacerFin" @transformend="redimensionnerFin" />
					<v-rect :config="configCreationRectanglePlein" @dragend="deplacerFin" @transformend="redimensionnerFin" />
					<v-ellipse :config="configCreationCercle" @dragend="deplacerFin" @transformend="redimensionnerFin" />
					<v-ellipse :config="configCreationCerclePlein" @dragend="deplacerFin" @transformend="redimensionnerFin" />
					<v-rect :config="configCreationSurlignage" @dragend="deplacerFin" @transformend="redimensionnerFin" />
					<v-line :config="configCreationLigne" @dragend="deplacerFin" @transformend="redimensionnerFin" />
					<v-arrow :config="configCreationFleche" @dragend="deplacerFin" @transformend="redimensionnerFin" />
					<v-transformer ref="transformer" :config="configTransformer" />
				</v-layer>
				<v-layer ref="calqueStylo" :config="configCalqueStylo" />
			</v-stage>
			<svg id="geodreieck" v-if="geoVisible" :width="dimensionsCanva.w" :height="dimensionsCanva.h">
				<g :transform="'translate(' + geo.x + ' ' + geo.y + ') rotate(' + geoDegres + ')'">
					<polygon class="geo-forme" :points="geoTrianglePoints" />
					<path :d="geoDessin.paralleles" class="geo-paralleles" />
					<path :d="geoDessin.demiParalleles" class="geo-paralleles demi" />
					<path :d="geoDessin.axe" class="geo-axe" />
					<path :d="geoDessin.arcs" class="geo-arc" />
					<path :d="geoDessin.traits" class="geo-traits" />
					<text v-for="(t, i) in geoDessin.textes" :key="'gt' + i" :x="t.x" :y="t.y" :font-size="t.taille" :class="t.classe" text-anchor="middle" dominant-baseline="central">{{ t.texte }}</text>
					<text class="geo-winkel" x="0" :y="geoDessin.yAngle" :font-size="geoDessin.tailleAngle" text-anchor="middle" dominant-baseline="central">{{ geoTexteAngle }}</text>
					<polygon class="geo-corps" :points="geoCorpsPoints" @pointerdown="geoGesteDebut($event, 'deplacer')">
						<title>{{ $t('geoVerschieben') }}</title>
					</polygon>
					<g class="geo-griff" data-geo="echelle" :transform="'translate(0 ' + (-geoL / 2 + geoDessin.u * 0.75) + ')'" @pointerdown="geoGesteDebut($event, 'echelle')">
						<title>{{ $t('geoSkalieren') }}</title>
						<circle r="17" fill="#fff" stroke="#2e63ae" stroke-width="1.5" />
						<path d="M-6 6L6-6M-6 6v-5M-6 6h5M6-6v5M6-6h-5" stroke="#2e63ae" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
					</g>
					<g class="geo-griff" v-for="cote in [-1, 1]" :key="'rot' + cote" :data-geo="'tourner' + cote" :transform="'translate(' + (cote * (geoL / 2 + 26)) + ' -14)'" @pointerdown="geoGesteDebut($event, 'tourner')">
						<title>{{ $t('geoDrehen') }}</title>
						<circle r="17" fill="#fff" stroke="#2e63ae" stroke-width="1.5" />
						<path d="M-7 3a7.5 7.5 0 1 0 1.5-8.5M-5.5-5.5l.4-4.6M-5.5-5.5l4.4.9" stroke="#2e63ae" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
					</g>
				</g>
				<circle v-if="geoSnap" class="zirkel-fang" :cx="geoSnap.x" :cy="geoSnap.y" r="11" />
				<g v-if="geoLongueur" :transform="'translate(' + geoLongueur.x + ' ' + geoLongueur.y + ')'">
					<rect x="-34" y="-13" width="68" height="24" rx="6" fill="#1f3f6e" />
					<text x="0" y="0" fill="#fff" font-size="14" font-weight="700" text-anchor="middle" dominant-baseline="central">{{ geoLongueur.texte }}</text>
				</g>
			</svg>
			<svg id="zirkel" v-if="outilZirkel" :width="dimensionsCanva.w" :height="dimensionsCanva.h">
				<circle v-if="zirkelSnap" class="zirkel-fang" :cx="zirkelSnap.x" :cy="zirkelSnap.y" r="11" />
				<circle :cx="zirkel.x" :cy="zirkel.y" :r="zirkel.r" fill="none" stroke="#2e63ae" stroke-width="1" stroke-dasharray="4 5" opacity="0.45" />
				<line :x1="zirkel.x + Math.cos(zirkel.a) * Math.min(24, zirkel.r)" :y1="zirkel.y + Math.sin(zirkel.a) * Math.min(24, zirkel.r)" :x2="zirkelSpitze.x" :y2="zirkelSpitze.y" stroke="#2e63ae" stroke-width="3" stroke-linecap="round" opacity="0.85" />
				<g class="zirkel-griff" data-zirkel="deplacer" :transform="'translate(' + zirkel.x + ' ' + zirkel.y + ')'" @pointerdown="zirkelGesteDebut($event, 'deplacer')">
					<title>{{ $t('zirkelMittelpunkt') }}</title>
					<circle r="24" fill="rgba(46,99,174,.06)" stroke="#2e63ae" stroke-width="1.2" stroke-opacity=".7" />
					<path d="M0-21V-5M0 5V21M-21 0H-5M5 0H21" stroke="#2e63ae" stroke-width="1" stroke-opacity=".75" fill="none" />
					<path d="M0-21l-3.5 4M0-21l3.5 4M0 21l-3.5-4M0 21l3.5-4M-21 0l4-3.5M-21 0l4 3.5M21 0l-4-3.5M21 0l-4 3.5" stroke="#2e63ae" stroke-width="1.4" stroke-opacity=".8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
					<circle r="2.2" fill="#c8102e" />
				</g>
				<g class="zirkel-griff" data-zirkel="rayon" :transform="'translate(' + (zirkel.x + Math.cos(zirkel.a) * zirkel.r * 0.5) + ' ' + (zirkel.y + Math.sin(zirkel.a) * zirkel.r * 0.5) + ') rotate(' + (zirkel.a * 180 / Math.PI) + ')'" @pointerdown="zirkelGesteDebut($event, 'rayon')">
					<title>{{ $t('zirkelRadius') }}</title>
					<rect x="-13" y="-9" width="26" height="18" rx="5" fill="#fff" stroke="#2e63ae" stroke-width="1.5" />
					<path d="M-7 0h14M-7 0l3-3M-7 0l3 3M7 0l-3-3M7 0l-3 3" stroke="#2e63ae" stroke-width="1.4" fill="none" stroke-linecap="round" />
				</g>
				<g class="zirkel-griff" data-zirkel="dessiner" :transform="'translate(' + zirkelSpitze.x + ' ' + zirkelSpitze.y + ')'" @pointerdown="zirkelGesteDebut($event, 'dessiner')">
					<title>{{ $t('zirkelZeichnen') }}</title>
					<circle r="17" :fill="couleurStylo === '#ffffff' || couleurStylo === '#ffff00' || couleurStylo === '#00ff00' || couleurStylo === '#04fdff' ? '#2e63ae' : couleurStylo" stroke="#fff" stroke-width="2" />
					<circle r="6" cx="9" cy="-9" :fill="couleurStylo" stroke="#fff" stroke-width="1.5" />
					<path d="M-6 6l1.5-4.5 6.5-6.5 3 3-6.5 6.5z" fill="#fff" />
				</g>
				<g class="zirkel-griff" data-zirkel="saisir" :transform="'translate(' + zirkel.x + ' ' + (zirkel.y - 38) + ')'" @pointerdown.stop.prevent @click="zirkelSaisirRayon">
					<title>{{ $t('zirkelRadiusEingeben') }}</title>
					<rect x="-66" y="-13" width="132" height="22" rx="6" fill="#fff" stroke="#2e63ae" stroke-width="1" />
					<text x="-8" y="3" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1f3f6e">r = {{ zirkelTexteRayon }}</text>
					<path d="M53 -4l4 4M50 3l1-3 6-6 3 3-6 6z" fill="none" stroke="#2e63ae" stroke-width="1.1" stroke-linejoin="round" />
				</g>
			</svg>
		</div>

		<div id="outils-annotation" key="outils" :style="styleOutils" :class="{'drei-spalten': outilsDreiSpalten, 'verschoben': outilsPosition}">
			<div class="griff-outils" role="button" tabindex="0" :title="$t('werkzeugleisteVerschieben')" :aria-label="$t('werkzeugleisteVerschieben')" @pointerdown="outilsGesteDebut" @dblclick="outilsPositionReinitialiser" @keydown="outilsClavier">
				<svg viewBox="0 0 24 8" width="24" height="8" aria-hidden="true"><g fill="#888"><circle cx="6" cy="2" r="1.4" /><circle cx="12" cy="2" r="1.4" /><circle cx="18" cy="2" r="1.4" /><circle cx="6" cy="6.5" r="1.4" /><circle cx="12" cy="6.5" r="1.4" /><circle cx="18" cy="6.5" r="1.4" /></g></svg>
			</div>
			<button type="button" class="outil historique" :title="$t('defaire')" :aria-label="$t('defaire')" @click="defaire">
				<img src="@/assets/img/defaire.png" :alt="$t('defaire')">
			</button>
			<button type="button" class="outil historique" :title="$t('refaire')" :aria-label="$t('refaire')" @click="refaire">
				<img src="@/assets/img/refaire.png" :alt="$t('refaire')">
			</button>
			<span class="separateur" />
			<button type="button" class="outil" :title="$t('selectionner')" :aria-label="$t('selectionner')" :aria-pressed="(outilSelectionner) ? 'true' : 'false'" :class="{'actif': outilSelectionner}" @click="definirOutilPrincipal('selectionner')">
				<img src="@/assets/img/curseur.png" :alt="$t('selectionner')">
			</button>
			<button type="button" class="outil" :title="$t('dessiner')" :aria-label="$t('dessiner')" :aria-pressed="(outilDessiner) ? 'true' : 'false'" :class="{'actif': outilDessiner}" @click="definirOutilPrincipal('dessiner')">
				<img src="@/assets/img/stylo.png" :alt="$t('dessiner')">
			</button>
			<button type="button" id="outil-gomme" class="outil" :title="$t('gomme')" :aria-label="$t('gomme')" :aria-pressed="outilGommer ? 'true' : 'false'" :class="{'actif': outilGommer}" @click="definirOutilPrincipal('gommer')">
				<svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true"><g stroke="#000" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M14.5 3.5l6 6-9.5 9.5H6.5l-3-3a1.4 1.4 0 0 1 0-2z" fill="#fff" /><path d="M8.5 9.5l6 6" fill="none" /><path d="M14.5 3.5l6 6-6 6-6-6z" fill="#ff8fa3" /><path d="M11 19h9.5" fill="none" /></g></svg>
			</button>
			<button type="button" id="outil-zirkel" class="outil" :title="$t('zirkel')" :aria-label="$t('zirkel')" :aria-pressed="outilZirkel ? 'true' : 'false'" :class="{'actif': outilZirkel}" @click="definirOutilPrincipal('zirkel')">
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1.6v2.2" /><circle cx="12" cy="5.8" r="2" /><path d="M10.9 7.6L5.4 19.2" /><path d="M13.1 7.6l4.3 9.4" /><path d="M5.4 19.2l-.6 2.4" stroke-width="1.5" /><path d="M4.2 21.6c4.6 1.9 10.6 1.3 14.8-2.6" stroke="#2e63ae" stroke-width="2" /></g><path d="M16.4 16.2l2.2-1 1.1 4.3-.9.4z" fill="#000" /></svg>
			</button>
			<button type="button" id="outil-geodreieck" class="outil" :title="$t('geodreieck')" :aria-label="$t('geodreieck')" :aria-pressed="geoVisible ? 'true' : 'false'" :class="{'actif': geoVisible}" @click="basculerGeodreieck">
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M2 7h20L12 17z" /><path d="M5 7v2M8 7v1.5M12 7v2.5M16 7v1.5M19 7v2M9.5 11.5a3.5 3.5 0 0 1 5 0" /></g></svg>
			</button>
			<button type="button" id="outil-remplir" class="outil" :title="$t('remplir')" :aria-label="$t('remplir')" :aria-pressed="outilRemplir ? 'true' : 'false'" :class="{'actif': outilRemplir}" @click="definirOutilPrincipal('remplir')">
				<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z" /><rect x="2" y="19.5" width="20" height="3.5" rx="1" fill="#f7d000" /></svg>
			</button>
			<button type="button" class="outil" :title="$t('deplacerPanneaux')" :aria-label="$t('deplacerPanneaux')" :aria-pressed="(outilDeplacer) ? 'true' : 'false'" :class="{'actif': outilDeplacer}" @click="definirOutilPrincipal('deplacer')">
				<img src="@/assets/img/pan.png" :alt="$t('deplacerPanneaux')">
			</button>
			<span class="separateur" />
			<button type="button" id="outil-rectangle" class="outil" :title="$t('rectangle')" :aria-label="$t('rectangle')" :aria-pressed="(outilSelectionner && outil === 'rectangle') ? 'true' : 'false'" :class="{'actif': outilSelectionner && outil === 'rectangle'}" @click="selectionnerOutil('rectangle')">
				<img src="@/assets/img/rectangle.png" :alt="$t('rectangle')">
			</button>
			<button type="button" id="outil-rectangle-plein" class="outil" :title="$t('rectanglePlein')" :aria-label="$t('rectanglePlein')" :aria-pressed="(outilSelectionner && outil === 'rectangle-plein') ? 'true' : 'false'" :class="{'actif': outilSelectionner && outil === 'rectangle-plein'}" @click="selectionnerOutil('rectangle-plein')">
				<img src="@/assets/img/rectangle-plein.png" :alt="$t('rectanglePlein')">
			</button>
			<button type="button" id="outil-cercle" class="outil" :title="$t('cercle')" :aria-label="$t('cercle')" :aria-pressed="(outilSelectionner && outil === 'cercle') ? 'true' : 'false'" :class="{'actif': outilSelectionner && outil === 'cercle'}" @click="selectionnerOutil('cercle')">
				<img src="@/assets/img/cercle.png" :alt="$t('cercle')">
			</button>
			<button type="button" id="outil-cercle-plein" class="outil" :title="$t('cerclePlein')" :aria-label="$t('cerclePlein')" :aria-pressed="(outilSelectionner && outil === 'cercle-plein') ? 'true' : 'false'" :class="{'actif': outilSelectionner && outil === 'cercle-plein'}" @click="selectionnerOutil('cercle-plein')">
				<img src="@/assets/img/cercle-plein.png" :alt="$t('cerclePlein')">
			</button>
			<button type="button" id="outil-etoile" class="outil" :title="$t('etoile')" :aria-label="$t('etoile')" :aria-pressed="(outilSelectionner && outil === 'etoile') ? 'true' : 'false'" :class="{'actif': outilSelectionner && outil === 'etoile'}" @click="selectionnerOutil('etoile')">
				<img src="@/assets/img/etoile.png" :alt="$t('etoile')">
			</button>
			<button type="button" id="outil-surlignage" class="outil" :title="$t('surlignage')" :aria-label="$t('surlignage')" :aria-pressed="(outilSelectionner && outil === 'surlignage') ? 'true' : 'false'" :class="{'actif': outilSelectionner && outil === 'surlignage'}" @click="selectionnerOutil('surlignage')">
				<img src="@/assets/img/surligneur.png" :alt="$t('surlignage')">
			</button>
			<button type="button" id="outil-ligne" class="outil" :title="$t('ligne')" :aria-label="$t('ligne')" :aria-pressed="(outilSelectionner && outil === 'ligne') ? 'true' : 'false'" :class="{'actif': outilSelectionner && outil === 'ligne'}" @click="selectionnerOutil('ligne')">
				<img src="@/assets/img/ligne.png" :alt="$t('ligne')">
			</button>
			<button type="button" id="outil-fleche" class="outil" :title="$t('fleche')" :aria-label="$t('fleche')" :aria-pressed="(outilSelectionner && outil === 'fleche') ? 'true' : 'false'" :class="{'actif': outilSelectionner && outil === 'fleche'}" @click="selectionnerOutil('fleche')">
				<img src="@/assets/img/fleche.png" :alt="$t('fleche')">
			</button>
			<button type="button" id="outil-texte" class="outil" :title="$t('texte')" :aria-label="$t('texte')" :aria-pressed="(outilSelectionner && outil === 'texte') ? 'true' : 'false'" :class="{'actif': outilSelectionner && outil === 'texte'}" @click="selectionnerOutil('texte')">
				<img src="@/assets/img/texte.png" :alt="$t('texte')">
			</button>
			<button type="button" id="outil-label" class="outil" :title="$t('label')" :aria-label="$t('label')" :aria-pressed="(outilSelectionner && outil === 'label') ? 'true' : 'false'" :class="{'actif': outilSelectionner && outil === 'label'}" @click="selectionnerOutil('label')">
				<img src="@/assets/img/label.png" :alt="$t('label')">
			</button>
			<span class="separateur" />
			<button type="button" class="outil reinitialiser" :title="$t('reinitialiser')" :aria-label="$t('reinitialiser')" @click="afficherReinitialiser">
				<img src="@/assets/img/reinitialiser.png" :alt="$t('reinitialiser')">
			</button>
			<button type="button" class="outil" :title="$t('fermer')" :aria-label="$t('fermer')" @click="$emit('fermer')">
				<img src="@/assets/img/fermer.png" :alt="$t('fermer')">
			</button>
		</div>

		<div id="options" v-if="nom !== '' || (!outilSelectionner && !outilDeplacer)" key="options">
			<button type="button" class="option zirkel-schalter" role="switch" :aria-checked="zirkelFang ? 'true' : 'false'" :title="zirkelFang ? $t('zirkelEinrastenAn') : $t('zirkelEinrastenAus')" :class="{'actif': zirkelFang}" @click="basculerZirkelFang" v-if="outilZirkel">
				<span class="schiene"><span class="knopf" /></span>
				<span class="beschriftung">{{ $t('zirkelEinrasten') }}</span>
			</button>
			<span class="separateur" v-if="outilZirkel" />
			<button type="button" class="option zirkel-schalter geo-schalter" role="switch" :aria-checked="geoFang ? 'true' : 'false'" :title="geoFang ? $t('geoEinrastenAn') : $t('geoEinrastenAus')" :class="{'actif': geoFang}" @click="basculerGeoFang" v-if="geoVisible">
				<span class="schiene"><span class="knopf" /></span>
				<span class="beschriftung">{{ $t('geoEinrasten') }}</span>
			</button>
			<span class="separateur" v-if="geoVisible" />
			<button type="button" class="option icone" :title="$t('verrouiller')" :aria-label="$t('verrouiller')" @click="verrouiller" v-if="outilSelectionner && !objetVerrouille">
				<span><i class="material-icons" aria-hidden="true">lock</i></span>
			</button>
			<button type="button" class="option icone orange" :title="$t('deverrouiller')" :aria-label="$t('deverrouiller')" @click="deverrouiller" v-else-if="outilSelectionner && objetVerrouille">
				<span><i class="material-icons" aria-hidden="true">lock_open</i></span>
			</button>
			<button type="button" class="option icone" :title="$t('mettreDevant')" :aria-label="$t('mettreDevant')" @click="mettreDevant" v-if="outilSelectionner && objet !== 'selection'">
				<span><i class="material-icons" aria-hidden="true">flip_to_front</i></span>
			</button>
			<button type="button" class="option icone" :title="$t('mettreDerriere')" :aria-label="$t('mettreDerriere')" @click="mettreDerriere" v-if="outilSelectionner && objet !== 'selection'">
				<span><i class="material-icons" aria-hidden="true">flip_to_back</i></span>
			</button>
			<span class="separateur" v-if="outilSelectionner" />
			<button type="button" class="option noir" :title="$t('noir')" :aria-label="$t('noir')" :aria-pressed="((outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#000000') ? 'true' : 'false'" :class="{'actif': (outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#000000'}" @click="modifierCouleur('#000000')" v-if="!outilGommer && nom !== 'selection' && objet !== 'label'">
				<span class="couleur noir" />
			</button>
			<button type="button" class="option blanc" :title="$t('blanc')" :aria-label="$t('blanc')" :aria-pressed="((outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#ffffff') ? 'true' : 'false'" :class="{'actif': (outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#ffffff'}" @click="modifierCouleur('#ffffff')" v-if="!outilGommer && nom !== 'selection' && objet !== 'label'">
				<span class="couleur blanc" />
			</button>
			<button type="button" class="option rouge" :title="$t('rouge')" :aria-label="$t('rouge')" :aria-pressed="((outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#ff0000') ? 'true' : 'false'" :class="{'actif': (outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#ff0000'}" @click="modifierCouleur('#ff0000')" v-if="!outilGommer && nom !== 'selection'">
				<span class="couleur rouge" />
			</button>
			<button type="button" class="option jaune" :title="$t('jaune')" :aria-label="$t('jaune')" :aria-pressed="((outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#ffff00') ? 'true' : 'false'" :class="{'actif': (outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#ffff00'}" @click="modifierCouleur('#ffff00')" v-if="!outilGommer && nom !== 'selection'">
				<span class="couleur jaune" />
			</button>
			<button type="button" class="option vert" :title="$t('vert')" :aria-label="$t('vert')" :aria-pressed="((outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#00ff00') ? 'true' : 'false'" :class="{'actif': (outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#00ff00'}" @click="modifierCouleur('#00ff00')" v-if="!outilGommer && nom !== 'selection'">
				<span class="couleur vert" />
			</button>
			<button type="button" class="option bleu" :title="$t('bleu')" :aria-label="$t('bleu')" :aria-pressed="((outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#04fdff') ? 'true' : 'false'" :class="{'actif': (outilDessiner || outilZirkel || outilRemplir) && couleurStylo === '#04fdff'}" @click="modifierCouleur('#04fdff')" v-if="!outilGommer && nom !== 'selection'">
				<span class="couleur bleu" />
			</button>
			<span class="option icone" v-if="!outilGommer && nom !== 'selection'" @click="definirCouleur">
				<label for="couleur-annotation" :title="$t('selectionnerCouleur')"><i class="material-icons" aria-hidden="true">colorize</i></label>
				<input id="couleur-annotation" type="color" tabindex="0" :aria-label="$t('selectionnerCouleur')" :value="couleurSelecteur">
			</span>
			<span class="separateur" v-if="outilDessiner || outilZirkel || outilRemplir" />
			<span class="option label-epaisseur" v-if="outilDessiner || outilZirkel || outilGommer">
				<span><i class="material-icons" aria-hidden="true">line_weight</i></span>
			</span>
			<button type="button" class="option epaisseur" :title="$t('modifierEpaisseur', { epaisseur: 2 })" :aria-label="$t('modifierEpaisseur', { epaisseur: 2 })" :aria-pressed="(epaisseurActive === 2) ? 'true' : 'false'" :class="{'actif': epaisseurActive === 2}" @click="modifierEpaisseur(2)" v-if="outilDessiner || outilZirkel || outilGommer">
				<span>2</span>
			</button>
			<button type="button" class="option epaisseur" :title="$t('modifierEpaisseur', { epaisseur: 5 })" :aria-label="$t('modifierEpaisseur', { epaisseur: 5 })" :aria-pressed="(epaisseurActive === 5) ? 'true' : 'false'" :class="{'actif': epaisseurActive === 5}" @click="modifierEpaisseur(5)" v-if="outilDessiner || outilZirkel || outilGommer">
				<span>5</span>
			</button>
			<button type="button" class="option epaisseur" :title="$t('modifierEpaisseur', { epaisseur: 10 })" :aria-label="$t('modifierEpaisseur', { epaisseur: 10 })" :aria-pressed="(epaisseurActive === 10) ? 'true' : 'false'" :class="{'actif': epaisseurActive === 10}" @click="modifierEpaisseur(10)" v-if="outilDessiner || outilZirkel || outilGommer">
				<span>10</span>
			</button>
			<button type="button" class="option epaisseur" :title="$t('modifierEpaisseur', { epaisseur: 20 })" :aria-label="$t('modifierEpaisseur', { epaisseur: 20 })" :aria-pressed="(epaisseurActive === 20) ? 'true' : 'false'" :class="{'actif': epaisseurActive === 20}" @click="modifierEpaisseur(20)" v-if="outilDessiner || outilZirkel || outilGommer">
				<span>20</span>
			</button>
			<button type="button" class="option epaisseur" :title="$t('modifierEpaisseur', { epaisseur: 40 })" :aria-label="$t('modifierEpaisseur', { epaisseur: 40 })" :aria-pressed="(epaisseurActive === 40) ? 'true' : 'false'" :class="{'actif': epaisseurActive === 40}" @click="modifierEpaisseur(40)" v-if="outilDessiner || outilZirkel || outilGommer">
				<span>40</span>
			</button>
			<button type="button" class="option epaisseur" :title="$t('modifierEpaisseur', { epaisseur: 80 })" :aria-label="$t('modifierEpaisseur', { epaisseur: 80 })" :aria-pressed="(epaisseurActive === 80) ? 'true' : 'false'" :class="{'actif': epaisseurActive === 80}" @click="modifierEpaisseur(80)" v-if="outilDessiner || outilZirkel || outilGommer">
				<span>80</span>
			</button>
			<span class="option label-transparence" v-if="outilDessiner || outilZirkel || outilRemplir">
				<span><i class="material-icons" aria-hidden="true">opacity</i></span>
			</span>
			<button type="button" class="option transparence" :title="$t('modifierOpacite', { opacite: 0.4 })" :aria-label="$t('modifierOpacite', { opacite: 0.4 })" :aria-pressed="(transparenceStylo === 0.4) ? 'true' : 'false'" :class="{'actif': transparenceStylo === 0.4}" v-if="outilDessiner || outilZirkel || outilRemplir" @click="modifierTransparence(0.4)">
				<span>0.4</span>
			</button>
			<button type="button" class="option transparence" :title="$t('modifierOpacite', { opacite: 0.6 })" :aria-label="$t('modifierOpacite', { opacite: 0.6 })" :aria-pressed="(transparenceStylo === 0.6) ? 'true' : 'false'" :class="{'actif': transparenceStylo === 0.6}" v-if="outilDessiner || outilZirkel || outilRemplir" @click="modifierTransparence(0.6)">
				<span>0.6</span>
			</button>
			<button type="button" class="option transparence" :title="$t('modifierOpacite', { opacite: 1 })" :aria-label="$t('modifierOpacite', { opacite: 1 })" :aria-pressed="(transparenceStylo === 1) ? 'true' : 'false'" :class="{'actif': transparenceStylo === 1}" v-if="outilDessiner || outilZirkel || outilRemplir" @click="modifierTransparence(1)">
				<span>1</span>
			</button>
			<span class="separateur" v-if="outilSelectionner && nom !== 'selection'" />
			<span class="option label-transparence" v-if="outilSelectionner && nom !== 'selection' && (objet === 'rectangle-plein' || objet === 'cercle-plein')">
				<span><i class="material-icons" aria-hidden="true">opacity</i></span>
			</span>
			<button type="button" class="option icone" :title="$t('reduireTransparence')" :aria-label="$t('reduireTransparence')" v-if="outilSelectionner && nom !== 'selection' && (objet === 'rectangle-plein' || objet === 'cercle-plein')" @click="reduireTransparence">
				<span><i class="material-icons" aria-hidden="true">remove</i></span>
			</button>
			<button type="button" class="option icone" :title="$t('augmenterTransparence')" :aria-label="$t('augmenterTransparence')" v-if="outilSelectionner && nom !== 'selection' && (objet === 'rectangle-plein' || objet === 'cercle-plein')" @click="augmenterTransparence">
				<span><i class="material-icons" aria-hidden="true">add</i></span>
			</button>
			<span class="option label-taille" v-if="outilSelectionner && nom !== 'selection' && objet === 'texte'">
				<span><i class="material-icons" aria-hidden="true">format_size</i></span>
			</span>
			<button type="button" class="option icone" :title="$t('reduireTaille')" :aria-label="$t('reduireTaille')" v-if="outilSelectionner && nom !== 'selection' && objet === 'texte'" @click="reduireTailleTexte">
				<span><i class="material-icons" aria-hidden="true">remove</i></span>
			</button>
			<button type="button" class="option icone" :title="$t('augmenterTaille')" :aria-label="$t('augmenterTaille')" v-if="outilSelectionner && nom !== 'selection' && objet === 'texte'" @click="augmenterTailleTexte">
				<span><i class="material-icons" aria-hidden="true">add</i></span>
			</button>
			<span class="separateur" v-if="(outilSelectionner && nom !== 'selection' && (objet === 'texte' || objet === 'rectangle-plein' || objet === 'cercle-plein'))" />
			<button type="button" class="option icone" :title="$t('dupliquer')" :aria-label="$t('dupliquer')" v-if="outilSelectionner && nom !== 'selection'" @click="dupliquer">
				<span><i class="material-icons" aria-hidden="true">content_copy</i></span>
			</button>
			<button type="button" class="option icone rouge" :title="$t('supprimer')" :aria-label="$t('supprimer')" v-if="outilSelectionner && nom !== 'selection'" @click="supprimer">
				<span><i class="material-icons" aria-hidden="true">delete</i></span>
			</button>
			<button type="button" class="option icone rouge" :title="$t('supprimer')" :aria-label="$t('supprimer')" v-else-if="outilSelectionner && nom === 'selection'" @click="supprimerSelection">
				<span><i class="material-icons" aria-hidden="true">delete</i></span>
			</button>
		</div>

		<div id="annotation-texte" class="conteneur-modale" v-if="modale" key="modale">
			<div class="modale" role="dialog" aria-modal="true" :aria-label="$t('monTexte')">
				<div class="conteneur">
					<div class="contenu">
						<textarea :value="texte" :aria-label="$t('monTexte')" @input="texte = $event.target.value" :placeholder="$t('monTexte')" />
						<div class="actions">
							<button type="button" class="bouton" @click="fermerModale">{{ $t('annuler') }}</button>
							<button type="button" class="bouton" @click="ajouterTexte" v-if="outil === 'texte' || outil === 'label'">{{ $t('valider') }}</button>
							<button type="button" class="bouton" @click="enregistrerTexte" v-else>{{ $t('valider') }}</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div id="confirmation" class="conteneur-modale" v-if="confirmation" key="confirmation">
			<div class="modale" role="alertdialog" aria-modal="true" aria-labelledby="texte-confirmation-annotations">
				<div class="conteneur">
					<div class="contenu">
						<p id="texte-confirmation-annotations" v-html="$t('reinitialiserAnnotations')" />
						<div class="actions">
							<button type="button" class="bouton" @click="annulerReinitialiser">{{ $t('annuler') }}</button>
							<button type="button" class="bouton" @click="reinitialiser">{{ $t('valider') }}</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</TransitionGroup>
</template>

<script>
import zirkel from './annotation/zirkel.js'
import gomme from './annotation/gomme.js'
import werkzeugleiste from './annotation/werkzeugleiste.js'
import geodreieck from './annotation/geodreieck.js'
import remplir from './annotation/remplir.js'
import arrierePlan from './annotation/arrierePlan.js'
import '../assets/css/annotation-werkzeuge.css'
import Konva from 'konva'
import { markRaw, toRaw } from 'vue'

const tailleMaxHistorique = 50

export default {
	name: 'CAnnotation',
	inject: ['app'],
	mixins: [zirkel, geodreieck, remplir, arrierePlan, gomme, werkzeugleiste],
	props: {
		panneaux: { type: Array, required: true },
		annotations: { type: Object, required: true },
		largeur: { type: Number, required: true },
		hauteur: { type: Number, required: true },
		nav: { type: Boolean, default: false }
	},
	emits: {
		outilDeplacer: null,
		fermer: null
	},
	data () {
		return {
			modale: false,
			confirmation: false,
			dimensionsCanva: { w: 0, h: 0 },
			texte: '',
			id: 0,
			nom: '',
			objet: '',
			objetVerrouille: false,
			outilSelectionner: true,
			outilDeplacer: false,
			outilDessiner: false,
			items: [],
			positionHistorique: 0,
			selection: false,
			positionX1: 0,
			positionY1: 0,
			positionX2: 0,
			positionY2: 0,
			positionSelectionX: 0,
			positionSelectionY: 0,
			largeurSelection: 0,
			hauteurSelection: 0,
			couleurStylo: '#000000',
			couleurSelecteur: '#000000',
			epaisseurStylo: 2,
			transparenceStylo: 1,
			outil: '',
			creation: false,
			positionObjetX: 0,
			positionObjetY: 0,
			largeurObjet: 0,
			hauteurObjet: 0
		}
	},
	computed: {
		indexItems () {
			return new Map(this.items.map(item => [item.name, item]))
		},
		configStage () {
			return { width: this.dimensionsCanva.w, height: this.dimensionsCanva.h }
		},
		configCalqueStylo () {
			return { listening: false }
		},
		configSelection () {
			return { name: 'selection', fill: 'rgba(1, 206, 209, 0.2)', visible: this.selection, x: this.positionSelectionX, y: this.positionSelectionY, width: this.largeurSelection, height: this.hauteurSelection }
		},
		configCreationRectangle () {
			return { name: 'objet-rectangle', fill: 'transparent', visible: this.creation && this.outil === 'rectangle', x: this.positionObjetX, y: this.positionObjetY, width: this.largeurObjet, height: this.hauteurObjet, stroke: '#ff0000', strokeWidth: 3, dash: [7, 5] }
		},
		configCreationRectanglePlein () {
			return { name: 'objet-rectangle', fill: '#cccccc', visible: this.creation && this.outil === 'rectangle-plein', x: this.positionObjetX, y: this.positionObjetY, width: this.largeurObjet, height: this.hauteurObjet }
		},
		configCreationCercle () {
			return { name: 'objet-cercle', fill: 'transparent', visible: this.creation && this.outil === 'cercle', x: this.positionObjetX + (this.largeurObjet / 2), y: this.positionObjetY + (this.hauteurObjet / 2), width: this.largeurObjet, height: this.hauteurObjet, stroke: '#ff0000', strokeWidth: 3, dash: [7, 5] }
		},
		configCreationCerclePlein () {
			return { name: 'objet-cercle', fill: '#cccccc', visible: this.creation && this.outil === 'cercle-plein', x: this.positionObjetX + (this.largeurObjet / 2), y: this.positionObjetY + (this.hauteurObjet / 2), width: this.largeurObjet, height: this.hauteurObjet }
		},
		configCreationSurlignage () {
			return { name: 'objet-surlignage', fill: '#ffff00', opacity: 0.5, visible: this.creation && this.outil === 'surlignage', x: this.positionObjetX, y: this.positionObjetY, width: this.largeurObjet, height: this.hauteurObjet }
		},
		configCreationLigne () {
			return { name: 'objet-ligne', visible: this.creation && this.outil === 'ligne', x: 0, y: 0, points: [this.positionX1, this.positionY1, this.positionX2, this.positionY2], fill: '#ff0000', stroke: '#ff0000', strokeWidth: 3 }
		},
		configCreationFleche () {
			return { name: 'objet-fleche', visible: this.creation && this.outil === 'fleche', x: 0, y: 0, points: [this.positionX1, this.positionY1, this.positionX2, this.positionY2], pointerLength: 15, pointerWidth: 12, fill: '#ff0000', stroke: '#ff0000', strokeWidth: 3 }
		},
		configTransformer () {
			return { anchorStroke: '#ff0000', anchorFill: '#ffff00', anchorSize: 10, anchorCornerRadius: 10, borderStroke: this.definirCouleurBordure(), borderDash: [3, 3], borderStrokeWidth: 1, enabledAnchors: this.definirAncres(), padding: 7.5, rotateEnabled: false, keepRatio: true, boundBoxFunc: this.definirLimites }
		}
	},
	watch: {
		panneaux () {
			this.reinitialiserOutils()
			this.definirOutilPrincipal('deplacer')
		},
		largeur () {
			this.$nextTick(() => {
				const rect = document.querySelector('#annotation')?.getBoundingClientRect()
				if (rect) this.dimensionsCanva.w = rect.width
			})
		},
		hauteur () {
			this.$nextTick(() => {
				const rect = document.querySelector('#annotation')?.getBoundingClientRect()
				if (rect) this.dimensionsCanva.h = rect.height
			})
		},
		outilSelectionner (valeur) {
			if (valeur === true) {
				this.activerDeplacement()
			}
			this.reinitialiserSelection()
		},
		outilDeplacer (valeur) {
			if (valeur === true) {
				this.desactiverDeplacement()
			}
			this.reinitialiserSelection()
		},
		outilDessiner (valeur) {
			if (valeur === true) {
				this.desactiverDeplacement()
				this.couleurStylo = '#000000'
				this.couleurSelecteur = '#000000'
			} else {
				this.couleurSelecteur = '#000000'
			}
			this.validerDessin()
			this.reinitialiserSelection()
		},
		outil (valeur) {
			if (valeur === '') {
				this.activerDeplacement()
			} else {
				this.desactiverDeplacement()
			}
		}
	},
	created () {
		this.historique = []
		this.traitStylo = null
		this.traitGomme = null
		this.curseurGomme = null
		this.pointeurStylo = null
	},
	mounted () {
		if (Object.keys(this.annotations).length > 0) {
			this.id = this.annotations.id
			if (this.annotations.hasOwnProperty('rectangles')) {
				const items = this.annotations.rectangles.concat(this.annotations.cercles, this.annotations.etoiles, this.annotations.lignes, this.annotations.fleches, this.annotations.ancres, this.annotations.textes, this.annotations.dessins)
				this.items = this.normaliserItems(items)
			} else {
				this.items = this.normaliserItems(this.annotations.items)
			}
			this.activerDeplacement()
		}
		this.enregistrer()
		const rect = document.querySelector('#annotation')?.getBoundingClientRect()
		if (rect) {
			this.dimensionsCanva.w = rect.width
			this.dimensionsCanva.h = rect.height
		}
		document.addEventListener('keydown', this.gererClavierAnnotation, false)
		// Schulschrift für Texte nachladen und danach neu zeichnen
		if (document.fonts && document.fonts.load) {
			Promise.all([document.fonts.load('30px "Playwrite DE Grund"'), document.fonts.load('30px Andika')]).then(() => {
				this.$refs.objets?.getNode()?.batchDraw()
			}).catch(() => {})
		}
	},
	beforeUnmount () {
		if (document.querySelector('#couleur-annotation')) {
			document.querySelector('#couleur-annotation').removeEventListener('change', this.modifierCouleurSelecteur)
		}
		document.removeEventListener('keydown', this.gererClavierAnnotation, false)
		if (this.traitStylo) {
			this.traitStylo.destroy()
			this.traitStylo = null
		}
	},
	methods: {
		definirOutilPrincipal (type) {
			this.outilSelectionner = false
			this.outilDeplacer = false
			this.outilDessiner = false
			this.outilZirkel = false
			this.outilRemplir = false
			this.outilGommer = false
			if (type === 'selectionner') {
				this.outilSelectionner = true
				this.$emit('outilDeplacer', false)
				this.desactiverSelecteur()
			} else if (type === 'deplacer') {
				this.outilDeplacer = true
				this.$emit('outilDeplacer', true)
				this.desactiverSelecteur()
			} else if (type === 'dessiner') {
				this.outilDessiner = true
				this.$emit('outilDeplacer', false)
				this.activerSelecteur()
			} else if (type === 'gommer') {
				this.outilGommer = true
				this.$emit('outilDeplacer', false)
				this.desactiverSelecteur()
			} else if (type === 'remplir') {
				this.outilRemplir = true
				this.$emit('outilDeplacer', false)
				this.activerSelecteur()
			} else if (type === 'zirkel') {
				this.zirkelInitialiser()
				this.outilZirkel = true
				this.$emit('outilDeplacer', false)
				this.activerSelecteur()
			}
		},
		selectionnerOutil (type) {
			const outils = document.querySelectorAll('#outils-annotation .outil.actif')
			let actif = ''
			outils.forEach((outil) => {
				if (outil.id) {
					actif = outil.id
				}
			})
			this.definirOutilPrincipal('selectionner')
			this.reinitialiserOutils()
			if ('outil-' + type !== actif) {
				this.outil = type
			}
		},
		ajouter (type) {
			this.definirOutilPrincipal('selectionner')
			this.objetVerrouille = false
			this.id++
			switch (type) {
			case 'rectangle':
				this.items.push({ name: 'rect' + this.id, objet: 'rectangle', x: this.positionObjetX, y: this.positionObjetY, scaleX: 1, scaleY: 1, width: this.largeurObjet, height: this.hauteurObjet, rotation: 0, fill: 'transparent', stroke: '#ff0000', strokeWidth: 3, strokeScaleEnabled: false, opacity: 1, draggable: true, verrouille: false })
				this.nom = 'rect' + this.id
				this.objet = 'rectangle'
				break
			case 'rectangle-plein':
				this.items.push({ name: 'rect' + this.id, objet: 'rectangle-plein', x: this.positionObjetX, y: this.positionObjetY, scaleX: 1, scaleY: 1, width: this.largeurObjet, height: this.hauteurObjet, rotation: 0, fill: '#cccccc', opacity: 1, draggable: true, verrouille: false })
				this.nom = 'rect' + this.id
				this.objet = 'rectangle-plein'
				break
			case 'cercle':
				this.items.push({ name: 'circ' + this.id, objet: 'cercle', x: this.positionObjetX + (this.largeurObjet / 2), y: this.positionObjetY + (this.hauteurObjet / 2), scaleX: 1, scaleY: 1, width: this.largeurObjet, height: this.hauteurObjet, rotation: 0, fill: 'transparent', stroke: '#ff0000', strokeWidth: 3, strokeScaleEnabled: false, opacity: 1, draggable: true, verrouille: false })
				this.nom = 'circ' + this.id
				this.objet = 'cercle'
				break
			case 'cercle-plein':
				this.items.push({ name: 'circ' + this.id, objet: 'cercle-plein', x: this.positionObjetX + (this.largeurObjet / 2), y: this.positionObjetY + (this.hauteurObjet / 2), scaleX: 1, scaleY: 1, width: this.largeurObjet, height: this.hauteurObjet, rotation: 0, fill: '#cccccc', opacity: 1, draggable: true, verrouille: false })
				this.nom = 'circ' + this.id
				this.objet = 'cercle-plein'
				break
			case 'etoile':
				this.items.push({ name: 'star' + this.id, objet: 'etoile', x: this.positionX1, y: this.positionY1, scaleX: 1, scaleY: 1, width: this.convertirRem(12), height: this.convertirRem(12), rotation: 0, fill: '#ffff00', stroke: 'black', strokeWidth: 3, strokeScaleEnabled: false, numPoints: 5, innerRadius: 20, outerRadius: 45, opacity: 1, draggable: true, verrouille: false })
				this.nom = 'star' + this.id
				this.objet = 'etoile'
				break
			case 'surlignage':
				this.items.push({ name: 'rect' + this.id, objet: 'surlignage', x: this.positionObjetX, y: this.positionObjetY, scaleX: 1, scaleY: 1, width: this.largeurObjet, height: this.hauteurObjet, rotation: 0, fill: '#ffff00', opacity: 0.5, draggable: true, verrouille: false })
				this.nom = 'rect' + this.id
				this.objet = 'surlignage'
				break
			case 'ligne':
				this.items.push({ name: 'line' + this.id, objet: 'ligne', x: 0, y: 0, scaleX: 1, scaleY: 1, points: [this.positionX1, this.positionY1, this.positionX2, this.positionY2], fill: '#ff0000', stroke: '#ff0000', strokeWidth: 3, hitStrokeWidth: 50, opacity: 1, draggable: true, verrouille: false })
				this.items.push({ name: 'ancr_line' + this.id + '_1', objet: 'ancre', x: this.positionX1, y: this.positionY1, radius: 10, width: 10, height: 10, fill: '#ffff00', stroke: '#ff0000', strokeWidth: 2, visible: true, opacity: 1, draggable: true })
				this.items.push({ name: 'ancr_line' + this.id + '_2', objet: 'ancre', x: this.positionX2, y: this.positionY2, radius: 10, width: 10, height: 10, fill: '#ffff00', stroke: '#ff0000', strokeWidth: 2, visible: true, opacity: 1, draggable: true })
				this.nom = 'line' + this.id
				this.objet = 'ligne'
				break
			case 'fleche':
				this.items.push({ name: 'flec' + this.id, objet: 'fleche', x: 0, y: 0, scaleX: 1, scaleY: 1, points: [this.positionX1, this.positionY1, this.positionX2, this.positionY2], pointerLength: 15, pointerWidth: 12, fill: '#ff0000', stroke: '#ff0000', strokeWidth: 3, hitStrokeWidth: 50, opacity: 1, draggable: true, verrouille: false })
				this.items.push({ name: 'ancr_flec' + this.id + '_1', objet: 'ancre', x: this.positionX1, y: this.positionY1, radius: 10, width: 10, height: 10, fill: '#ffff00', stroke: '#ff0000', strokeWidth: 2, visible: true, opacity: 1, draggable: true })
				this.items.push({ name: 'ancr_flec' + this.id + '_2', objet: 'ancre', x: this.positionX2, y: this.positionY2, radius: 10, width: 10, height: 10, fill: '#ffff00', stroke: '#ff0000', strokeWidth: 2, visible: true, opacity: 1, draggable: true })
				this.nom = 'flec' + this.id
				this.objet = 'fleche'
				break
			case 'texte':
				this.items.push({ name: 'text' + this.id, objet: 'texte', text: this.texte, fontFamily: 'Andika', fontSize: 30, lineHeight: 1.25, verticalAlign: 'middle', padding: 10, x: this.positionX1, y: this.positionY1, rotation: 0, scaleX: 1, scaleY: 1, fill: '#ff0000', opacity: 1, wrap: 'word', draggable: true, verrouille: false })
				this.nom = 'text' + this.id
				this.objet = 'texte'
				break
			case 'label':
				this.items.push({ name: 'labl' + this.id, objet: 'label', x: this.positionX1, y: this.positionY1, rotation: 0, opacity: 1, draggable: true, verrouille: false, tag: { name: 'labl' + this.id, objet: 'label', shadowColor: '#222222', shadowBlur: 10, shadowOffset: [7, 7], shadowOpacity: 0.2, fill: '#ffff00' }, text: { fontFamily: 'Andika', name: 'labl' + this.id, objet: 'label', text: this.texte, fontSize: 25, lineHeight: 1.25, verticalAlign: 'middle', fill: '#000000', padding: 15, wrap: 'word', align: 'center' } })
				this.nom = 'labl' + this.id
				this.objet = 'label'
				break
			}
			this.enregistrer()
			this.$nextTick(() => {
				this.transformer()
			})
		},
		verrouiller () {
			let item
			if (this.objet !== 'selection') {
				item = this.indexItems.get(this.nom)
				if (item) {
					item.draggable = false
					item.verrouille = true
				}
			} else {
				const objets = this.$refs.transformer.getNode().nodes()
				for (let i = 0; i < objets.length; i++) {
					item = this.indexItems.get(objets[i].getAttrs().name)
					if (item) {
						item.draggable = false
						item.verrouille = true
					}
				}
			}
			this.objetVerrouille = true
			this.masquerAncres()
			if (this.objet !== 'selection') {
				this.transformer()
			} else {
				const transformer = this.$refs.transformer.getNode()
				transformer.getLayer().batchDraw()
			}
			this.enregistrer()
		},
		deverrouiller () {
			let item
			if (this.objet !== 'selection') {
				item = this.indexItems.get(this.nom)
				if (item) {
					item.draggable = true
					item.verrouille = false
				}
			} else {
				const objets = this.$refs.transformer.getNode().nodes()
				for (let i = 0; i < objets.length; i++) {
					item = this.indexItems.get(objets[i].getAttrs().name)
					if (item) {
						item.draggable = true
						item.verrouille = false
					}
				}
			}
			this.nom = item.name
			this.objet = item.objet
			this.objetVerrouille = false
			const type = this.nom.substring(0, 4)
			if (type === 'flec' || type === 'line') {
				const ancre1 = this.indexItems.get('ancr_' + this.nom + '_1')
				const ancre2 = this.indexItems.get('ancr_' + this.nom + '_2')
				ancre1.visible = true
				ancre2.visible = true
			}
			if (this.objet !== 'selection') {
				this.transformer()
			} else {
				const transformer = this.$refs.transformer.getNode()
				transformer.getLayer().batchDraw()
			}
			this.enregistrer()
		},
		mettreDevant () {
			this.items.forEach((item, index) => {
				if (item.name === this.nom && index < this.items.length) {
					this.items.splice(index, 1)
					this.items.splice(index + 1, 0, item)
				}
			})
			this.enregistrer()
			this.$nextTick(() => {
				this.transformer()
			})
		},
		mettreDerriere () {
			this.items.forEach((item, index) => {
				if (item.name === this.nom && index > 0) {
					this.items.splice(index, 1)
					this.items.splice(index - 1, 0, item)
				}
			})
			this.enregistrer()
			this.$nextTick(() => {
				this.transformer()
			})
		},
		reduireTransparence () {
			const item = this.indexItems.get(this.nom)
			const transparence = parseFloat(item.opacity.toFixed(1))
			if (transparence > 0.1) {
				item.opacity = transparence - 0.1
			}
			this.enregistrer()
		},
		augmenterTransparence () {
			const item = this.indexItems.get(this.nom)
			const transparence = parseFloat(item.opacity.toFixed(1))
			if (transparence < 1) {
				item.opacity = transparence + 0.1
			}
			this.enregistrer()
		},
		dupliquer () {
			const id = Date.now() + Math.random().toString(16).slice(10)
			const items = []
			let nom, objet
			JSON.parse(JSON.stringify(this.items)).forEach((item) => {
				if (item.name.includes(this.nom)) {
					items.push(item)
				}
			})
			items.forEach((item) => {
				const type = item.name.substring(0, 4)
				if (type === 'ancr') {
					item.name = item.name.substring(0, 9) + id + item.name.substring(item.name.length - 2)
					item.x = item.x + 20
					item.y = item.y + 20
				} else {
					nom = type + id
					objet = item.objet
					item.name = nom
					item.x = item.x + 20
					item.y = item.y + 20
				}
				if (type === 'labl') {
					item.tag.name = type + id
					item.text.name = type + id
				}
			})
			this.masquerAncres()
			this.$nextTick(() => {
				this.items.push(...this.normaliserItems(items))
				this.nom = nom
				this.objet = objet
				this.enregistrer()
				this.$nextTick(() => {
					this.transformer()
				})
			})
		},
		supprimer () {
			const type = this.nom.substring(0, 4)
			const nom = this.nom
			if (type === 'ancr') {
				this.items = this.items.filter(r => !r.name.includes(nom.split('_')[1]))
			} else {
				this.items = this.items.filter(r => !r.name.includes(nom))
			}
			this.nom = ''
			this.objet = ''
			this.enregistrer()
			this.transformer()
		},
		supprimerSelection () {
			const objets = this.$refs.transformer.getNode().nodes()
			for (let i = 0; i < objets.length; i++) {
				this.nom = objets[i].getAttrs().name
				this.supprimer()
			}
		},
		gererClavierAnnotation (event) {
			if (event.key === 'Escape' && this.modale === 'texte') {
				this.fermerModale()
			} else if (event.ctrlKey && event.key === 'd' && this.modale !== 'texte') {
				event.preventDefault()
				this.dupliquer()
			} else if ((event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Escape') && this.modale !== 'texte') {
				if (this.nom !== '' && this.objet !== 'selection') {
					this.supprimer()
				} else if (this.nom !== '' && this.objet === 'selection') {
					this.supprimerSelection()
				}
			} else if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
				let item, type, ancre1, ancre2
				if (this.objet !== 'selection') {
					item = this.indexItems.get(this.nom)
					type = this.nom.substring(0, 4)
					if (item && event.key === 'ArrowDown') {
						item.y = item.y + 2
						if (type === 'flec' || type === 'line') {
							ancre1 = this.indexItems.get('ancr_' + this.nom + '_1')
							ancre2 = this.indexItems.get('ancr_' + this.nom + '_2')
							ancre1.y = ancre1.y + 2
							ancre2.y = ancre2.y + 2
						}
					} else if (item && event.key === 'ArrowUp') {
						item.y = item.y - 2
						if (type === 'flec' || type === 'line') {
							ancre1 = this.indexItems.get('ancr_' + this.nom + '_1')
							ancre2 = this.indexItems.get('ancr_' + this.nom + '_2')
							ancre1.y = ancre1.y - 2
							ancre2.y = ancre2.y - 2
						}
					} else if (item && event.key === 'ArrowLeft') {
						item.x = item.x - 2
						if (type === 'flec' || type === 'line') {
							ancre1 = this.indexItems.get('ancr_' + this.nom + '_1')
							ancre2 = this.indexItems.get('ancr_' + this.nom + '_2')
							ancre1.x = ancre1.x - 2
							ancre2.x = ancre2.x - 2
						}
					} else if (item && event.key === 'ArrowRight') {
						item.x = item.x + 2
						if (type === 'flec' || type === 'line') {
							ancre1 = this.indexItems.get('ancr_' + this.nom + '_1')
							ancre2 = this.indexItems.get('ancr_' + this.nom + '_2')
							ancre1.x = ancre1.x + 2
							ancre2.x = ancre2.x + 2
						}
					}
				} else {
					const objets = this.$refs.transformer.getNode().nodes()
					for (let i = 0; i < objets.length; i++) {
						item = this.indexItems.get(objets[i].getAttrs().name)
						type = objets[i].getAttrs().name.substring(0, 4)
						if (item && event.key === 'ArrowDown') {
							item.y = item.y + 2
							if (type === 'flec' || type === 'line') {
								ancre1 = this.indexItems.get('ancr_' + objets[i].getAttrs().name + '_1')
								ancre2 = this.indexItems.get('ancr_' + objets[i].getAttrs().name + '_2')
								ancre1.y = ancre1.y + 2
								ancre2.y = ancre2.y + 2
							}
						} else if (item && event.key === 'ArrowUp') {
							item.y = item.y - 2
							if (type === 'flec' || type === 'line') {
								ancre1 = this.indexItems.get('ancr_' + objets[i].getAttrs().name + '_1')
								ancre2 = this.indexItems.get('ancr_' + objets[i].getAttrs().name + '_2')
								ancre1.y = ancre1.y - 2
								ancre2.y = ancre2.y - 2
							}
						} else if (item && event.key === 'ArrowLeft') {
							item.x = item.x - 2
							if (type === 'flec' || type === 'line') {
								ancre1 = this.indexItems.get('ancr_' + objets[i].getAttrs().name + '_1')
								ancre2 = this.indexItems.get('ancr_' + objets[i].getAttrs().name + '_2')
								ancre1.x = ancre1.x - 2
								ancre2.x = ancre2.x - 2
							}
						} else if (item && event.key === 'ArrowRight') {
							item.x = item.x + 2
							if (type === 'flec' || type === 'line') {
								ancre1 = this.indexItems.get('ancr_' + objets[i].getAttrs().name + '_1')
								ancre2 = this.indexItems.get('ancr_' + objets[i].getAttrs().name + '_2')
								ancre1.x = ancre1.x + 2
								ancre2.x = ancre2.x + 2
							}
						}
					}
				}
			}
		},
		afficherReinitialiser () {
			this.confirmation = true
		},
		annulerReinitialiser () {
			this.confirmation = false
			this.$nextTick(() => {
				document.querySelector('#outils-annotation .outil.reinitialiser')?.focus()
			})
		},
		reinitialiser () {
			this.definirOutilPrincipal('selectionner')
			this.id = 0
			this.nom = ''
			this.objet = ''
			this.objetVerrouille = false
			this.items = []
			this.historique = []
			this.positionHistorique = 0
			this.transformer()
			this.enregistrer()
			this.confirmation = false
		},
		deplacerFin (event) {
			let item
			if (this.objet !== 'selection') {
				item = this.indexItems.get(this.nom)
				if (item) {
					item.x = event.target.x()
					item.y = event.target.y()
				}
			} else {
				const objets = this.$refs.transformer.getNode().nodes()
				for (let i = 0; i < objets.length; i++) {
					item = this.indexItems.get(objets[i].getAttrs().name)
					if (item) {
						item.x = objets[i].getAttrs().x
						item.y = objets[i].getAttrs().y
					}
				}
			}
			this.enregistrer()
		},
		redimensionnerTexte (event) {
			const type = this.nom.substring(0, 4)
			if (type === 'text') {
				event.target.setAttrs({
					width: Math.max(event.target.width() * event.target.scaleX(), 70),
					scaleX: 1,
					scaleY: 1
				})
			}
		},
		redimensionnerFin (event) {
			const item = this.indexItems.get(this.nom)
			if (item) {
				item.x = event.target.x()
				item.y = event.target.y()
				item.width = event.target.width()
				item.height = event.target.height()
				item.scaleX = event.target.scaleX()
				item.scaleY = event.target.scaleY()
			}
			this.enregistrer()
		},
		selectionnerDebut (event) {
			if (event.evt.isPrimary === false) {
				return
			}
			const stage = event.target.getStage()
			if (this.outilSelectionner) {
				if (this.outil !== '' && this.creation === true) {
					this.selectionnerFin()
					return
				}
				this.positionX1 = stage.getPointerPosition().x
				this.positionY1 = stage.getPointerPosition().y
				this.positionX2 = stage.getPointerPosition().x
				this.positionY2 = stage.getPointerPosition().y
				this.largeurSelection = 0
				this.hauteurSelection = 0
				this.largeurObjet = 0
				this.hauteurObjet = 0
				if (this.outil === '') {
					if (event.target.getParent() && event.target.getParent().className === 'Transformer') {
						return
					}
					if (event.target !== event.target.getStage()) {
						this.selectionnerObjet(event)
						return
					}
					this.selection = true
					this.nom = ''
					this.objet = ''
					this.masquerAncres()
					this.transformer()
				} else {
					this.creation = true
					this.nom = ''
					this.objet = ''
					this.masquerAncres()
					if (this.outil === 'etoile') {
						this.dessinerForme('etoile')
						this.creation = false
						this.activerSelecteur()
					} else if (this.outil === 'texte' || this.outil === 'label') {
						this.modale = true
						this.creation = false
						setTimeout(() => {
							document.querySelector('#annotation-texte textarea')?.focus()
						}, 10)
					}
					this.transformer()
				}
			} else if (this.outilGommer) {
				this.gommeDebut(event, stage)
			} else if (this.outilRemplir) {
				this.remplir(stage.getPointerPosition())
			} else if (this.outilZirkel) {
				const p = stage.getPointerPosition()
				const fang = this.zirkelTrouverFang(p.x, p.y)
				this.zirkel.x = fang ? fang.x : p.x
				this.zirkel.y = fang ? fang.y : p.y
			} else if (this.outilDessiner) {
				this.validerDessin()
				let position = stage.getPointerPosition()
				// Geodreieck: Setzt der Stift an einer Kante an, wird eine gerade Linie entlang dieser Kante gezeichnet
				this.geoLineal = null
				if (this.geoVisible) {
					const kante = this.geoKanteProche(position.x, position.y)
					if (kante) {
						const debut = this.geoPointSurKante(kante, position.x, position.y)
						this.geoLineal = { kante: kante, debut: debut }
						position = { x: debut.x, y: debut.y }
					}
				}
				this.pointeurStylo = event.evt.pointerId
				try {
					event.evt.target.setPointerCapture(event.evt.pointerId)
				} catch {}
				this.traitStylo = new Konva.Line({ points: [position.x, position.y, position.x, position.y], tension: this.geoLineal ? 0 : 0.5, globalCompositeOperation: 'source-over', stroke: this.couleurStylo, strokeWidth: this.epaisseurStylo, opacity: this.transparenceStylo, lineJoin: 'round', lineCap: 'round', listening: false, perfectDrawEnabled: false, shadowForStrokeEnabled: false })
				const calque = this.$refs.calqueStylo.getNode()
				calque.add(this.traitStylo)
				calque.batchDraw()
			}
		},
		selectionnerMouvement (event) {
			if (event.evt.isPrimary === false) {
				return
			}
			const stage = event.target.getStage()
			if (this.outilSelectionner) {
				if (this.outil === '') {
					if (!this.selection) {
						return
					}
					this.positionX2 = stage.getPointerPosition().x
					this.positionY2 = stage.getPointerPosition().y
					this.positionSelectionX = Math.min(this.positionX1, this.positionX2)
					this.positionSelectionY = Math.min(this.positionY1, this.positionY2)
					this.largeurSelection = Math.abs(this.positionX2 - this.positionX1)
					this.hauteurSelection = Math.abs(this.positionY2 - this.positionY1)
				} else {
					if (!this.creation) {
						return
					}
					this.positionX2 = stage.getPointerPosition().x
					this.positionY2 = stage.getPointerPosition().y
					this.positionObjetX = Math.min(this.positionX1, this.positionX2)
					this.positionObjetY = Math.min(this.positionY1, this.positionY2)
					this.largeurObjet = Math.abs(this.positionX2 - this.positionX1)
					this.hauteurObjet = Math.abs(this.positionY2 - this.positionY1)
				}
			} else if (this.outilGommer) {
				this.gommeMouvement(event, stage)
			} else if (this.outilDessiner) {
				if (!this.traitStylo || event.evt.pointerId !== this.pointeurStylo) {
					return
				}
				if (this.geoLineal) {
					// Gerade Linie entlang der Geodreieck-Kante, mit Längenanzeige
					const zeiger = stage.getPointerPosition()
					const fin = this.geoPointSurKante(this.geoLineal.kante, zeiger.x, zeiger.y)
					const debut = this.geoLineal.debut
					this.traitStylo.points([debut.x, debut.y, fin.x, fin.y])
					this.traitStylo.getLayer().batchDraw()
					const k = this.geoLineal.kante
					const longueur = Math.hypot(fin.x - debut.x, fin.y - debut.y) / this.zirkelPxParCm
					this.geoLongueur = { x: fin.x - k.nx * 30, y: fin.y - k.ny * 30, texte: longueur.toFixed(1).replace('.', ',') + ' cm' }
					return
				}
				const evenements = typeof event.evt.getCoalescedEvents === 'function' ? event.evt.getCoalescedEvents() : []
				const position = stage.getPointerPosition()
				const decalageX = position.x - event.evt.clientX
				const decalageY = position.y - event.evt.clientY
				const points = this.traitStylo.points()
				let pointAjoute = false
				for (const evenement of (evenements.length > 0 ? evenements : [event.evt])) {
					const x = evenement.clientX + decalageX
					const y = evenement.clientY + decalageY
					const dx = x - points[points.length - 2]
					const dy = y - points[points.length - 1]
					if (dx * dx + dy * dy >= 4) {
						points.push(x, y)
						pointAjoute = true
					}
				}
				if (pointAjoute) {
					this.traitStylo.points(points)
					this.traitStylo.getLayer().batchDraw()
				}
			}
		},
		selectionnerFin (event) {
			if (event && event.evt && event.evt.isPrimary === false) {
				return
			}
			if (this.outilSelectionner) {
				if (this.outil === '') {
					if (!this.selection) {
						return
					}
					if (this.largeurSelection < 10 && this.hauteurSelection < 10) {
						this.selection = false
						return
					}
					this.selection = false
					const transformer = this.$refs.transformer.getNode()
					const stage = transformer.getStage()
					const objets = stage.find((item) => {
						return item.getAttrs().objet && item.getAttrs().objet !== 'gomme' && item.getAttrs().name.substring(0, 4) !== 'ancr'
					})
					const rect = stage.findOne('.selection').getClientRect()
					const selection = objets.filter(item => Konva.Util.haveIntersection(rect, item.getClientRect()))
					if (selection.length > 1) {
						this.nom = 'selection'
						this.objet = 'selection'
						const objetsVerrouilles = selection.filter(item => item.getAttrs().verrouille === true)
						if (objetsVerrouilles.length === selection.length) {
							this.objetVerrouille = true
						} else {
							this.objetVerrouille = false
						}
						transformer.nodes(selection)
						transformer.getLayer().batchDraw()
						this.desactiverSelecteur()
					} else if (selection.length === 1) {
						const nom = selection[0].getAttrs().name
						this.selectionner(nom)
						this.transformer()
					} else {
						this.nom = ''
						this.objet = ''
						this.objetVerrouille = false
						this.desactiverSelecteur()
					}
				} else if (this.outil !== '' && this.outil !== 'etoile' && this.outil !== 'texte' && this.outil !== 'label' && ((this.largeurObjet > 0 && this.hauteurObjet > 0) || ((this.outil === 'ligne' || this.outil === 'fleche') && (this.largeurObjet > 0 || this.hauteurObjet > 0)))) {
					if (!this.creation) {
						return
					}
					this.dessinerForme(this.outil)
					this.activerSelecteur()
				}
			} else if (this.outilGommer) {
				this.gommeFin(event)
			} else if (this.outilDessiner) {
				if (event && event.evt && event.evt.pointerId !== this.pointeurStylo) {
					return
				}
				this.validerDessin()
			}
		},
		validerDessin () {
			if (!this.traitStylo) {
				return
			}
			const ligne = this.traitStylo
			const calque = ligne.getLayer()
			// Am Geodreieck gezeichnete Linien exakt übernehmen (nicht vereinfachen) und als Strecke markieren
			const lineal = this.geoLineal
			this.geoLineal = null
			this.geoLongueur = null
			const points = lineal ? ligne.points().slice(0, 4) : this.reduirePoints(ligne.points(), 0.5)
			this.traitStylo = null
			this.pointeurStylo = null
			this.id++
			const element = { name: 'dess' + this.id, objet: 'dessin', points: markRaw(points), globalCompositeOperation: 'source-over', stroke: ligne.stroke(), strokeWidth: ligne.strokeWidth(), opacity: ligne.opacity(), hitStrokeWidth: 25, lineJoin: 'round', lineCap: 'round', draggable: false, verrouille: false }
			if (!lineal) {
				// Weiche Kurve durch die Abtastpunkte statt eckiger Teilstrecken (Medienzentrum MTK)
				element.tension = 0.5
			}
			if (lineal) {
				element.droite = true
				element.geoAussen = { x: -lineal.kante.nx, y: -lineal.kante.ny, d: ligne.strokeWidth() / 2 }
			}
			this.items.push(element)
			this.nom = 'dess' + this.id
			this.objet = 'dessin'
			this.enregistrer()
			this.$nextTick(() => {
				ligne.destroy()
				calque?.batchDraw()
			})
		},
		reduirePoints (points, tolerance) {
			const total = points.length / 2
			const arrondir = valeur => Math.round(valeur * 10) / 10
			if (total <= 2) {
				return points.map(arrondir)
			}
			const pointsConserves = new Uint8Array(total)
			pointsConserves[0] = 1
			pointsConserves[total - 1] = 1
			const toleranceCarree = tolerance * tolerance
			const pile = [[0, total - 1]]
			while (pile.length > 0) {
				const [debut, fin] = pile.pop()
				const ax = points[debut * 2]
				const ay = points[debut * 2 + 1]
				const dx = points[fin * 2] - ax
				const dy = points[fin * 2 + 1] - ay
				const longueurCarree = dx * dx + dy * dy
				let distanceMax = 0
				let indexMax = -1
				for (let i = debut + 1; i < fin; i++) {
					let px = points[i * 2] - ax
					let py = points[i * 2 + 1] - ay
					if (longueurCarree > 0) {
						const t = Math.max(0, Math.min(1, (px * dx + py * dy) / longueurCarree))
						px -= t * dx
						py -= t * dy
					}
					const distance = px * px + py * py
					if (distance > distanceMax) {
						distanceMax = distance
						indexMax = i
					}
				}
				if (distanceMax > toleranceCarree) {
					pointsConserves[indexMax] = 1
					pile.push([debut, indexMax], [indexMax, fin])
				}
			}
			const resultat = []
			for (let i = 0; i < total; i++) {
				if (pointsConserves[i]) {
					resultat.push(arrondir(points[i * 2]), arrondir(points[i * 2 + 1]))
				}
			}
			return resultat
		},
		normaliserItems (items) {
			if (Array.isArray(items)) {
				toRaw(items).forEach((item) => {
					const itemBrut = toRaw(item)
					if (itemBrut && (itemBrut.objet === 'dessin' || itemBrut.objet === 'gomme') && Array.isArray(itemBrut.points)) {
						itemBrut.points = markRaw(toRaw(itemBrut.points))
					}
				})
			}
			return items
		},
		masquerAncres () {
			this.items.forEach((item) => {
				if (item.objet === 'ancre' && item.visible) {
					item.visible = false
				}
			})
		},
		dessinerForme (type) {
			this.ajouter(type)
			this.reinitialiserOutils()
			this.creation = false
		},
		reinitialiserOutils () {
			this.outil = ''
			this.largeurObjet = 0
			this.hauteurObjet = 0
			this.positionX1 = 0
			this.positionY1 = 0
			this.positionX2 = 0
			this.positionY2 = 0
		},
		reinitialiserSelection () {
			this.nom = ''
			this.objet = ''
			this.objetVerrouille = false
			this.masquerAncres()
			this.transformer()
		},
		selectionnerObjet (event) {
			if (this.outilSelectionner) {
				if (event.target === event.target.getStage()) {
					this.reinitialiserSelection()
					return
				}
				if (this.objet === 'selection' && event.target.getAttrs().objet && event.target.getAttrs().name.substring(0, 4) !== 'ancr') {
					return
				}
				if (event.target.getParent().className === 'Transformer') {
					this.reinitialiserSelection()
					return
				}
				this.selectionner(event.target.name())
				this.transformer()
			}
		},
		selectionner (nom) {
			let ancre1, ancre2
			const type = nom.substring(0, 4)
			const item = this.indexItems.get(nom)
			if (item) {
				this.nom = nom
				this.objet = item.objet
				if (!item.draggable) {
					this.objetVerrouille = true
				} else {
					this.objetVerrouille = false
				}
				if (!this.outilDessiner) {
					this.definirCouleurSelecteur(this.objet, item)
				}
				this.activerSelecteur()
			} else {
				this.nom = ''
				this.objet = ''
				this.objetVerrouille = false
				this.desactiverSelecteur()
			}
			if (type === 'flec' || type === 'line') {
				this.masquerAncres()
				ancre1 = this.indexItems.get('ancr_' + nom + '_1')
				ancre2 = this.indexItems.get('ancr_' + nom + '_2')
				if (!item.verrouille) {
					ancre1.visible = true
					ancre2.visible = true
				} else {
					ancre1.visible = false
					ancre2.visible = false
				}
			} else if (type !== 'ancr') {
				this.masquerAncres()
			}
		},
		transformer () {
			const transformer = this.$refs.transformer.getNode()
			const stage = transformer.getStage()
			const noeud = stage.findOne('.' + this.nom)
			if (noeud && this.nom.substring(0, 4) !== 'ancr') {
				transformer.nodes([noeud])
			} else {
				transformer.nodes([])
			}
			transformer.getLayer().batchDraw()
		},
		ajouterTexte () {
			this.ajouter(this.outil)
			this.reinitialiserOutils()
			this.fermerModale()
			this.selection = false
			this.activerSelecteur()
		},
		modifierTexte (event) {
			this.texte = event.target.text()
			this.modale = true
			setTimeout(() => {
				document.querySelector('#annotation-texte textarea')?.focus()
			}, 10)
		},
		enregistrerTexte () {
			const type = this.nom.substring(0, 4)
			const item = this.indexItems.get(this.nom)
			const texte = this.texte
			if (type === 'text') {
				item.text = texte
			} else {
				item.text.text = texte
				this.$nextTick(() => {
					this.transformer()
				})
			}
			this.fermerModale()
			this.enregistrer()
		},
		fermerModale () {
			this.texte = ''
			this.modale = false
		},
		reduireTailleTexte () {
			const item = this.indexItems.get(this.nom)
			let taille = item.fontSize
			taille = taille - 2
			item.fontSize = taille
			this.enregistrer()
		},
		augmenterTailleTexte () {
			const item = this.indexItems.get(this.nom)
			let taille = item.fontSize
			taille = taille + 2
			item.fontSize = taille
			this.enregistrer()
		},
		definirCouleurSelecteur (objet, item) {
			switch (objet) {
			case 'rectangle':
			case 'cercle':
			case 'ligne':
			case 'fleche':
			case 'dessin':
				if (['#000000', '#ffffff', '#ff0000', '#ffff00', '#00ff00', '#04fdff', '#cccccc'].includes(item.stroke) === false) {
					this.couleurSelecteur = item.stroke
				}
				break
			case 'rectangle-plein':
			case 'cercle-plein':
			case 'etoile':
			case 'surlignage':
			case 'texte':
				if (['#000000', '#ffffff', '#ff0000', '#ffff00', '#00ff00', '#04fdff', '#cccccc'].includes(item.fill) === false) {
					this.couleurSelecteur = item.fill
				}
				break
			case 'label':
				if (['#000000', '#ffffff', '#ff0000', '#ffff00', '#00ff00', '#04fdff', '#cccccc'].includes(item.tag.fill) === false) {
					this.couleurSelecteur = item.tag.fill
				}
				break
			}
		},
		definirCouleur () {
			const couleur = document.querySelector('#couleur-annotation').value
			if (this.outilDessiner && this.couleurSelecteur !== '#000000') {
				this.couleurStylo = couleur
			} else if (!this.outilDessiner && this.couleurSelecteur !== '#000000') {
				this.modifierCouleur(couleur)
			}
		},
		modifierCouleurSelecteur (event) {
			this.couleurSelecteur = event.target.value
			this.modifierCouleur(event.target.value)
		},
		modifierCouleur (couleur) {
			if (this.outilSelectionner) {
				let item = this.indexItems.get(this.nom)
				if (this.objet === 'ancre') {
					item = this.indexItems.get(this.nom.split('_')[1])
				}
				switch (this.objet) {
				case 'rectangle':
				case 'cercle':
				case 'dessin':
					item.stroke = couleur
					break
				case 'rectangle-plein':
				case 'cercle-plein':
				case 'etoile':
				case 'surlignage':
				case 'texte':
					item.fill = couleur
					break
				case 'ligne':
				case 'fleche':
				case 'ancre':
					item.stroke = couleur
					item.fill = couleur
					break
				case 'label':
					item.tag.fill = couleur
					break
				case 'remplissage':
					item.fill = couleur
					break
				}
			} else if (this.outilDessiner || this.outilZirkel || this.outilRemplir) {
				this.couleurStylo = couleur
			}
			this.enregistrer()
		},
		modifierEpaisseur (epaisseur) {
			if (this.outilGommer) {
				this.epaisseurGomme = epaisseur
				return
			}
			this.epaisseurStylo = epaisseur
		},
		modifierTransparence (transparence) {
			this.transparenceStylo = transparence
		},
		definirAncres () {
			let ancres = []
			if (this.objetVerrouille === false) {
				const type = this.nom.substring(0, 4)
				switch (type) {
				case 'rect':
				case 'circ':
					ancres = ['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']
					break
				case 'labl':
				case 'fill':
				case 'imag':
				case 'star':
					ancres = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
					break
				case 'text':
					ancres = ['middle-right', 'middle-left']
					break
				}
			}
			return ancres
		},
		definirCouleurBordure () {
			if (this.objet === 'selection' && !this.objetVerrouille) {
				return '#01ced1'
			} else {
				return '#ddd'
			}
		},
		definirLimites (ancien, nouveau) {
			const type = this.nom.substring(0, 4)
			if (type === 'text') {
				if (nouveau.width < 70) {
					return ancien
				}
				return nouveau
			} else {
				return nouveau
			}
		},
		deplacerForme (event) {
			let item, ancre1, ancre2
			if (this.objet !== 'selection') {
				item = this.indexItems.get(this.nom)
				if (item) {
					item.points = event.target.points()
					item.x = event.target.x()
					item.y = event.target.y()
					item.scaleX = event.target.scaleX()
					item.scaleY = event.target.scaleY()
					ancre1 = this.indexItems.get('ancr_' + this.nom + '_1')
					ancre2 = this.indexItems.get('ancr_' + this.nom + '_2')
					ancre1.x = event.target.points()[0] + event.target.x()
					ancre1.y = event.target.points()[1] + event.target.y()
					ancre1.scaleX = event.target.scaleX()
					ancre1.scaleY = event.target.scaleY()
					ancre2.x = event.target.points()[2] + event.target.x()
					ancre2.y = event.target.points()[3] + event.target.y()
					ancre2.scaleX = event.target.scaleX()
					ancre2.scaleY = event.target.scaleY()
				}
			} else {
				const objets = this.$refs.transformer.getNode().nodes()
				for (let i = 0; i < objets.length; i++) {
					if (objets[i].getAttrs().name.substring(0, 4) === 'flec' || objets[i].getAttrs().name.substring(0, 4) === 'line') {
						item = this.indexItems.get(objets[i].getAttrs().name)
					}
					if (item) {
						item.points = objets[i].getAttrs().points
						item.x = objets[i].getAttrs().x
						item.y = objets[i].getAttrs().y
						item.scaleX = objets[i].getAttrs().scaleX
						item.scaleY = objets[i].getAttrs().scaleY
						ancre1 = this.indexItems.get('ancr_' + objets[i].getAttrs().name + '_1')
						ancre2 = this.indexItems.get('ancr_' + objets[i].getAttrs().name + '_2')
						ancre1.x = objets[i].getAttrs().points[0] + objets[i].getAttrs().x
						ancre1.y = objets[i].getAttrs().points[1] + objets[i].getAttrs().y
						ancre1.scaleX = objets[i].getAttrs().scaleX
						ancre1.scaleY = objets[i].getAttrs().scaleY
						ancre2.x = objets[i].getAttrs().points[2] + objets[i].getAttrs().x
						ancre2.y = objets[i].getAttrs().points[3] + objets[i].getAttrs().y
						ancre2.scaleX = objets[i].getAttrs().scaleX
						ancre2.scaleY = objets[i].getAttrs().scaleY
					}
					item = null
				}
			}
		},
		deplacerAncre (event) {
			let nom, index, item, ancre, points, ancreActive
			if (this.objet !== 'selection') {
				nom = this.nom.split('_')
				index = parseInt(nom[2])
				item = this.indexItems.get(nom[1])
				if (item) {
					if (index === 1) {
						ancre = this.indexItems.get('ancr_' + nom[1] + '_2')
						points = [
							event.target.x() - item.x,
							event.target.y() - item.y,
							ancre.x - item.x,
							ancre.y - item.y
						]
					} else {
						ancre = this.indexItems.get('ancr_' + nom[1] + '_1')
						points = [
							ancre.x - item.x,
							ancre.y - item.y,
							event.target.x() - item.x,
							event.target.y() - item.y
						]
					}
					item.points = points
					ancreActive = this.indexItems.get('ancr_' + nom[1] + '_' + index)
					ancreActive.x = event.target.x()
					ancreActive.y = event.target.y()
					ancreActive.scaleX = event.target.scaleX()
					ancreActive.scaleY = event.target.scaleY()
				}
			} else {
				const objets = this.$refs.transformer.getNode().nodes()
				for (let i = 0; i < objets.length; i++) {
					nom = objets[i].getAttrs().name.split('_')
					index = parseInt(nom[2])
					if (nom[1].substring(0, 4) === 'flec' || nom[1].substring(0, 4) === 'line') {
						item = this.indexItems.get(nom[1])
					}
					if (item) {
						if (index === 1) {
							ancre = this.indexItems.get('ancr_' + nom[1] + '_2')
							points = [
								objets[i].getAttrs().x - item.x,
								objets[i].getAttrs().y - item.y,
								ancre.x - item.x,
								ancre.y - item.y
							]
						} else {
							ancre = this.indexItems.get('ancr_' + nom[1] + '_1')
							points = [
								ancre.x - item.x,
								ancre.y - item.y,
								objets[i].getAttrs().x - item.x,
								objets[i].getAttrs().y - item.y
							]
						}
						item.points = points
						ancreActive = this.indexItems.get('ancr_' + nom[1] + '_' + index)
						ancreActive.x = objets[i].getAttrs().x
						ancreActive.y = objets[i].getAttrs().y
						ancreActive.scaleX = objets[i].getAttrs().scaleX
						ancreActive.scaleY = objets[i].getAttrs().scaleY
					}
				}
			}
		},
		enregistrer () {
			this.app.pages[this.app.page - 1].annotations = { id: this.id, items: this.items }
			const donnees = JSON.parse(JSON.stringify(this.items))
			this.historique.length = this.positionHistorique
			this.historique.push(donnees)
			if (this.historique.length > tailleMaxHistorique) {
				this.historique.shift()
			}
			this.positionHistorique = this.historique.length
		},
		defaire () {
			if (this.positionHistorique <= 1) {
				return
			}
			this.positionHistorique -= 1
			this.restaurerHistorique(this.historique[this.positionHistorique - 1])
		},
		refaire () {
			if (this.positionHistorique >= this.historique.length) {
				return
			}
			this.restaurerHistorique(this.historique[this.positionHistorique])
			this.positionHistorique += 1
		},
		restaurerHistorique (etat) {
			const donnees = this.normaliserItems(JSON.parse(JSON.stringify(etat)))
			this.items = donnees
			this.app.pages[this.app.page - 1].annotations = { id: this.id, items: donnees }
			this.$nextTick(() => {
				this.reinitialiserSelection()
			})
		},
		convertirRem (valeur) {
			const taille = window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size')
			return typeof valeur !== 'undefined' && valeur > 0 ? parseFloat(taille) * valeur : parseFloat(taille)
		},
		activerDeplacement () {
			this.items.forEach((item) => {
				item.verrouille ? item.draggable = false : item.draggable = true
			})
		},
		desactiverDeplacement () {
			this.items.forEach((item) => {
				item.draggable = false
			})
		},
		activerSelecteur () {
			this.$nextTick(() => {
				if (document.querySelector('#couleur-annotation')) {
					document.querySelector('#couleur-annotation').addEventListener('change', this.modifierCouleurSelecteur)
				}
			})
		},
		desactiverSelecteur () {
			this.$nextTick(() => {
				if (document.querySelector('#couleur-annotation')) {
					document.querySelector('#couleur-annotation').removeEventListener('change', this.modifierCouleurSelecteur)
				}
			})
		}
	}
}
</script>

<style>
#annotation  {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: transparent;
	z-index: 10000;
	touch-action: none;
}

#annotation.curseur {
	pointer-events: none;
	z-index: 99;
}

#annotation.avec-nav {
	bottom: 7.5rem;
}

#annotation .konvajs-content {
	touch-action: none;
}

#outils-annotation {
	position: fixed;
	top: 7rem;
	left: 0.6rem;
	display: grid;
	grid-template-columns: repeat(2, 34px);
	gap: 3px;
	align-content: start;
	background: #fff;
	padding: 4px 6px 6px;
	margin: 0;
	border-radius: 12px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
	z-index: 10001;
	user-select: none;
}

#outils-annotation.drei-spalten {
	grid-template-columns: repeat(3, 34px);
}

#outils-annotation .griff-outils {
	grid-column: 1 / -1;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 16px;
	border-radius: 6px;
	cursor: grab;
	touch-action: none;
}

#outils-annotation .griff-outils:hover,
#outils-annotation .griff-outils:focus-visible {
	background: #eef6f6;
}

#outils-annotation .griff-outils:active {
	cursor: grabbing;
}

#outils-annotation .outil {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 34px;
	height: 34px;
	margin: 0;
	padding: 0;
	border-radius: 7px;
	cursor: pointer;
}

#outils-annotation .outil:hover {
	background: #eef6f6;
}

#outils-annotation .outil.actif {
	background: #01ced1;
}

#outils-annotation .outil.historique:active {
	opacity: 0.7;
}

#options .option img {
	width: auto;
	height: auto;
	max-width: 16px;
	max-height: 16px;
}

#outils-annotation .outil img {
	width: auto;
	height: auto;
	max-width: 20px;
	max-height: 20px;
}

#outils-annotation .separateur {
	grid-column: 1 / -1;
	height: 0;
	margin: 2px 3px;
	border: 0;
	border-top: 1px solid #ddd;
}

#options {
	position: absolute;
	left: 40px;
	top: 0;
	display: flex;
    justify-content: flex-start;
	align-items: center;
    background: #fff;
    padding: 5px;
    margin: 0;
    border-bottom-left-radius: 10px;
	border-bottom-right-radius: 10px;
	z-index: 10001;
	max-width: calc(100% - 100px);
	overflow-x: auto;
	overflow-y: hidden;
	user-select: none;
}

#options .option {
	display: flex;
    align-items: center;
    justify-content: center;
	width: 20px;
    height: 20px;
	margin: 0 5px;
	border-radius: 4px;
    cursor: pointer;
}

#options .option.label-transparence,
#options .option.label-taille,
#options .option.label-epaisseur {
	font-size: 24px;
	width: auto;
	cursor: default;
}

#options .option.transparence,
#options .option.epaisseur {
	line-height: 1;
}

#options .option.transparence,
#options .option.epaisseur {
	border: 1px solid #ddd;
	font-size: 12px;
}

#options .option.transparence.actif,
#options .option.epaisseur.actif {
	border: 1px solid #000;
}

#options .option.icone span:active {
	opacity: 0.5;
}

#options .option.transparence {
	width: 22px;
}

#options .option .couleur {
	display: block;
	width: 20px;
	height: 20px;
	border-radius: 50%;
}

#options .option.noir.actif,
#options .option .couleur.noir {
	background: black;
}

#options .option.blanc.actif,
#options .option .couleur.blanc {
	background: white;
	border: 1px solid #ddd;
}

#options .option.blanc.actif .couleur.blanc {
	border: 1px solid transparent;
	width: 18px;
	height: 18px;
}

#options .option.rouge.actif,
#options .option .couleur.rouge {
	background: #ff0000;
}

#options .option.jaune.actif,
#options .option .couleur.jaune {
	background: #ffff00;
}

#options .option.vert.actif,
#options .option .couleur.vert {
	background: #00ff00;
}

#options .option.bleu.actif,
#options .option .couleur.bleu {
	background: #04fdff;
}

#options .separateur {
    margin: 5px 5px;
    border: 1px solid #ddd;
	height: 10px;
}

#annotation-texte .modale .conteneur textarea {
    background: #fff;
    border: 1px solid #ddd;
    max-width: 100%;
    width: 100%;
    resize: none;
    padding: 1.5rem;
	text-align: left;
	line-height: 1.4;
	font-size: 1.6rem;
	height: 12rem;
}

#options .option.icone {
	width: auto;
}

#options .option.icone.orange span {
	color: #ff6600;
}

#options .option.icone.rouge span {
	color: #c9372c;
}

#options .option.icone span,
#options .option.icone label {
	font-size: 24px;
}

#options .option.icone input[type="color"] {
	width: 20px;
	height: 20px;
	border: none;
	margin-left: 5px;
	cursor: pointer;
}

#options .option.icone input[type="color"]::-moz-color-swatch {
	border: 1px solid #ddd;
	border-radius: 50%;
}

#options .option.icone input[type="color"]:focus::-moz-color-swatch {
	border: 1px solid #001d1d;
}

#options .option.icone input[type="color"]::-webkit-color-swatch {
	border: 1px solid #ddd;
	border-radius: 50%;
}

#options .option.icone input[type="color"]:focus::-webkit-color-swatch {
	border: 1px solid #001d1d;
}

#options .option.icone input[type="color"]::-webkit-color-swatch-wrapper {
	padding: 0;
}

/* Media queries
–––––––––––––––––––––––––––––––––––––––––––––––––– */
@media screen and (max-height: 720px) {
	#outils-annotation {
		top: 4.5rem;
	}
}
</style>
