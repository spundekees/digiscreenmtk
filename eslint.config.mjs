import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'

export default [
	{
		ignores: ['dist/**', 'node_modules/**', 'public/**', '_resources/**']
	},
	js.configs.recommended,
	...pluginVue.configs['flat/essential'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				app_version: 'readonly',
				confetti: 'readonly',
				pell: 'readonly',
				QRCode: 'readonly',
				flexImages: 'readonly',
				Panzoom: 'readonly'
			}
		},
		rules: {
			'no-prototype-builtins': 'off',
			'no-empty': ['error', { allowEmptyCatch: true }],
			'generator-star-spacing': 'off',
			'@stylistic/indent': ['error', 'tab', { SwitchCase: 0 }],
			'no-tabs': 0,
			'no-console': 0
		}
	},
	{
		plugins: {
			'@stylistic': stylistic
		},
		rules: {
			'@stylistic/space-before-function-paren': ['error', 'always'],
			'@stylistic/comma-dangle': ['error', 'never'],
			'@stylistic/quotes': ['error', 'single', { avoidEscape: false }]
		}
	},
	{
		files: ['*.config.{js,mjs,cjs}'],
		languageOptions: {
			globals: {
				...globals.node
			}
		}
	}
]
