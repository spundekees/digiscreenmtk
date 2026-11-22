import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const racine = fileURLToPath(new URL('./', import.meta.url))
const marqueur = '<!--DONNEES_LECTEUR-->'

const echapperScript = (code) => code.replace(/<(!--|\/?script)/gi, '\\x3C$1')

const lireFichierPublic = (chemin) => readFileSync(resolve(racine, 'public', chemin))

export default defineConfig({
	base: './',
	publicDir: false,
	envDir: false,
	plugins: [
		vue(),
		{
			name: 'preparer-lecteur',
			transformIndexHtml: {
				order: 'pre',
				handler: (html) => html
					.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n\t\t' + marqueur)
					.replace('<%- umami %>', '')
					.replace('href="./static/img/favicon.png"', () => 'href="data:image/png;base64,' + lireFichierPublic('static/img/favicon.png').toString('base64') + '"')
					.replace(/<script src="\.\/(static\/js\/[a-z-]+\.js)(?:\?[^"]*)?"( async)?><\/script>/g, (_, chemin) => '<script>' + echapperScript(lireFichierPublic(chemin).toString()) + '</script>')
			}
		},
		{
			name: 'integrer-lecteur',
			enforce: 'post',
			generateBundle (_, bundle) {
				const html = bundle['index.html']
				let source = html.source
				Object.keys(bundle).forEach((nom) => {
					const fichier = bundle[nom]
					if (nom.endsWith('.js') && fichier.type === 'chunk') {
						source = source.replace(new RegExp('<script type="module" crossorigin src="\\./' + nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"></script>'), () => '<script type="module">' + echapperScript(fichier.code) + '</script>')
						delete bundle[nom]
					} else if (nom.endsWith('.css')) {
						source = source.replace(new RegExp('<link rel="stylesheet" crossorigin href="\\./' + nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '">'), () => '<style>' + fichier.source.toString().replace(/<\/style/gi, '\\3C/style') + '</style>')
						delete bundle[nom]
					}
				})
				if (Object.keys(bundle).length > 1 || /src="\.\/static|href="\.\/static/.test(source) || !source.includes(marqueur)) {
					this.error('Le lecteur contient encore des fichiers externes : ' + Object.keys(bundle).join(', '))
				}
				html.source = source
			}
		}
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	define: {
		'app_version': JSON.stringify(process.env.npm_package_version),
		'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(''),
		'import.meta.env.VITE_PIXABAY_API_KEY': JSON.stringify('')
	},
	build: {
		target: ['es2019'],
		outDir: 'public/static/lecteur',
		emptyOutDir: true,
		assetsDir: 'static/assets',
		assetsInlineLimit: () => true,
		cssCodeSplit: false,
		chunkSizeWarningLimit: 10000,
		rolldownOptions: {
			output: {
				codeSplitting: false
			}
		}
	}
})
