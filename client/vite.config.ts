/** @format */

import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import commonjs from "vite-plugin-commonjs"
import { nodePolyfills } from "vite-plugin-node-polyfills"

export default defineConfig({
    plugins: [sveltekit(), commonjs(), nodePolyfills()],
    resolve: {
        alias: {
            "@shared": "../shared",
            "@library": "../library",
        },
    },
    server: {
        fs: {
            allow: ["../shared", "../library"],
        },
    },
    optimizeDeps: {
        exclude: ["@rollup/browser"],
    },
})
