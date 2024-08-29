import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
/** @type {import('@sveltejs/kit').Config} */


const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			assets: "../public/site",
			pages: '../public/site',
		}),
		alias: {
			$assets: "src/lib/assets",
			$shared: "../shared",
			$framework: "src/lib/framework"
		},
		csp: {
			mode: "hash",
			directives: {
				'script-src': ['self', 'unsafe-eval', 'nonce-{%NONCE%}'],
			},
		}
	}
};

export default config;
