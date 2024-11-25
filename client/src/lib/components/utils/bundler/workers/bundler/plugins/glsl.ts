/** @format */

import type { Plugin } from "@rollup/browser"
export default {
    name: "glsl",
    transform: (code, id) => {
        if (!id.endsWith(".glsl")) return

        return {
            code: `export default ${JSON.stringify(code)};`,
            map: null,
        }
    },
} as Plugin
