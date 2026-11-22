<template>
    <div v-if="visible" ref="default">
        <slot name="default" />
        <slot name="headerToolbar" />
    </div>
</template>

<script>
import { jsPanel } from 'jspanel4/es6module/jspanel.min.js'

export default {
	name: 'JsPanel',
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		options: {
			type: Object,
			default: () => ({})
		}
	},
	computed: {
		panelOptions () {
			return Object.assign({ onclosed: this.close }, this.options)
		}
	},
	watch: {
		visible (isVisible) {
			if (isVisible) {
				this.createPanel()
			}
		}
	},
	mounted () {
		if (this.visible) {
			this.createPanel()
		}
	},
	beforeUnmount () {
		this.observateurTaille?.disconnect()
		this.observateurContenu?.disconnect()
	},
	methods: {
		async createPanel () {
			await this.$nextTick()
			let options = Object.assign({ content: this.$refs.default }, this.panelOptions)
			if (this.$slots.headerToolbar) {
				options = Object.assign({ headerToolbar: this.$slots.headerToolbar()[0].el }, options)
			}
			const panneau = jsPanel.create(options)
			this.surveillerDefilement(panneau?.content)
		},
		surveillerDefilement (contenu) {
			if (!contenu) return
			const ajuster = () => {
				const defilable = contenu.scrollHeight > contenu.clientHeight + 1 || contenu.scrollWidth > contenu.clientWidth + 1
				const focalisable = contenu.querySelector('a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]')
				if (defilable && !focalisable) {
					if (contenu.getAttribute('tabindex') !== '0') contenu.setAttribute('tabindex', '0')
				} else if (contenu.hasAttribute('tabindex')) {
					contenu.removeAttribute('tabindex')
				}
			}
			this.observateurTaille = new ResizeObserver(ajuster)
			this.observateurTaille.observe(contenu)
			this.observateurContenu = new MutationObserver(ajuster)
			this.observateurContenu.observe(contenu, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled'] })
			ajuster()
		},
		close () {
			this.$emit('close')
			this.$emit('update:visible', false)
		}
	}
}
</script>
