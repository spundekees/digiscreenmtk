import pictogrammes from '@/pictogrammes'

const ressources = {}
let donneesLecteur = null

const element = document.querySelector('#donnees-lecteur')

export const lecteur = element !== null

if (element) {
	try {
		const contenu = JSON.parse(element.textContent)
		donneesLecteur = contenu.donnees
		Object.assign(ressources, contenu.ressources)
	} catch {}
	element.remove()
}

export function recupererDonneesLecteur () {
	return donneesLecteur
}

export function recupererRessource (chemin) {
	if (typeof chemin !== 'string' || !chemin.startsWith('./static/')) {
		return chemin
	}
	return ressources[chemin] || chemin
}

const ressourcesModules = {
	des: ['carre', 'rectangle', 'cercle', 'ellipse', 'triangle', 'trapeze', 'pentagone', 'hexagone', 'octogone'].map((forme) => './static/img/formes/' + forme + '.png').concat(['./static/audio/des.mp3']),
	histoire: pictogrammes.map((pictogramme) => './static/img/pictogrammes/' + pictogramme),
	humeur: ['soleil', 'soleil-nuage', 'nuage', 'pluie', 'orage', 'tres-content', 'content', 'neutre', 'triste', 'en-pleurs', 'en-colere', 'fatigue'].map((humeur) => './static/img/humeurs/' + humeur + '.svg'),
	lien: ['./static/img/lien.png'],
	modalites: ['silence', 'ecoutez', 'chuchotez', 'parlez', 'communiquez'].map((modalite) => './static/img/modalites/' + modalite + '.png'),
	plateau: Array.from({ length: 12 }, (_, index) => './static/img/plateau/pion' + (index + 1) + '.png').concat(['./static/img/plateau/plateau.png']),
	rebours: ['bip', 'cartoon', 'clave', 'djembe', 'goutte', 'maraca', 'mbira', 'metronome', 'triangle'].map((son) => './static/audio/' + son + '.mp3'),
	retroaction: ['confettis', 'applaudissements', 'victoire', 'dommage', 'vrai', 'faux', 'pouce-haut', 'pouce-bas'].map((retroaction) => './static/img/retroactions/' + retroaction + '.svg').concat(['applaudissements', 'victoire', 'dommage', 'vrai', 'faux'].map((son) => './static/audio/' + son + '.mp3')),
	sonometre: ['./static/audio/cloche.mp3']
}

const fonds = ['digitale.jpg', 'lavande.jpg', 'plage.jpg', 'lac.jpg', 'feuilles.jpg', 'arbre.jpg', 'aurore.jpg', 'points.png', 'lignes-horizontales.png', 'seyes.png', 'quadrillage.png', 'quadrillage-grand.png', 'quadrillage-gris.png', 'quadrillage-gris-grand.png', 'partition.png'].map((fond) => './static/img/' + fond)

function listerRessources (texte) {
	const chemins = new Set(['./static/audio/photo.mp3', ...fonds, ...Object.values(ressourcesModules).flat()])
	const references = texte.match(/\.\/static\/[^"'()\s\\]+\.[a-z0-9]+/gi) || []
	references.forEach((chemin) => chemins.add(chemin))
	return Array.from(chemins)
}

function convertirDataURL (blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result)
		reader.onerror = reject
		reader.readAsDataURL(blob)
	})
}

export async function genererHtml (donnees) {
	const texte = JSON.stringify(donnees)
	const chemins = listerRessources(texte)
	const reponse = await fetch('./static/lecteur/index.html', { cache: 'no-cache' })
	if (!reponse.ok) {
		throw new Error('lecteur_indisponible')
	}
	const modele = await reponse.text()
	const ressourcesExport = {}
	await Promise.all(chemins.map(async (chemin) => {
		try {
			const fichier = await fetch(chemin)
			if (fichier.ok) {
				ressourcesExport[chemin] = await convertirDataURL(await fichier.blob())
			}
		} catch {}
	}))
	// Échappement de < pour que le contenu ne puisse pas fermer la balise script
	const json = ('{"donnees":' + texte + ',"ressources":' + JSON.stringify(ressourcesExport) + '}').replace(/</g, '\\u003c')
	const marqueur = '<!--' + 'DONNEES_LECTEUR' + '-->'
	if (!modele.includes(marqueur)) {
		throw new Error('lecteur_invalide')
	}
	return modele.replace(marqueur, () => '<script type="application/json" id="donnees-lecteur">' + json + '</script>')
}
