import { fileURLToPath, URL } from 'node:url'
import { cpSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dotenv from 'dotenv'

export default defineConfig(({ mode }) => {
	let env = '.env.production'
	if (mode === 'dist' || mode === 'development') {
		env = '.env'
	}
	dotenv.config({ path: './' + env })
	let umami = ''
	if (process.env.VITE_UMAMI_SCRIPT_URL && process.env.VITE_UMAMI_SCRIPT_URL !== '' && process.env.VITE_UMAMI_WEBSITE_ID && process.env.VITE_UMAMI_WEBSITE_ID !== '') {
		const echapperStr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
		umami = '<script defer crossorigin src="' + echapperStr(process.env.VITE_UMAMI_SCRIPT_URL) + '" data-website-id="' + echapperStr(process.env.VITE_UMAMI_WEBSITE_ID) + '"></script>'
	}
	let dossierSortie = ''
	return {
		base: './',
		plugins: [
			vue(),
			{
				name: 'injecter-donnees-html',
				transformIndexHtml: {
					order: 'pre',
					handler: (html) => html.replace('<%- umami %>', umami)
				}
			},
			{
				name: 'copier-fichiers',
				apply: 'build',
				configResolved (config) {
					dossierSortie = resolve(config.root, config.build.outDir)
				},
				closeBundle () {
					const racine = fileURLToPath(new URL('./', import.meta.url))
					const copier = (source, destination = source) => cpSync(resolve(racine, source), resolve(dossierSortie, destination), { recursive: true })
					copier('README.md')
					copier('LICENSE')
					copier('.htaccess')
					readdirSync(resolve(racine, 'inc')).filter((fichier) => !/\.db$/.test(fichier)).forEach((fichier) => copier('inc/' + fichier))
					copier('vendor')
					copier(env, '.env')
				}
			}
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
			}
		},
		define: {
			'app_version': JSON.stringify(process.env.npm_package_version)
		},
		server: {
			port: 8080,
			proxy: {
				'^/inc': {
					target: 'http://127.0.0.1:8000',
					changeOrigin: true
				}
			}
		},
		build: {
			target: ['es2019'],
			assetsDir: 'static/assets'
		}
	}
})
