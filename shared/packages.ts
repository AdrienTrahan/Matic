/** @format */

import { ComponentTypes } from "./sharedb"

export const Components = {
    IH_0: {
        type: ComponentTypes.FILE,
        file: "/frame.svelte",
        name: "Frame",
        slots: ["children"],
        plugins: ["BH_0"],
    },
}

export const Plugins = {
    BH_0: {
        drawable: "/hover/drawable.svelte",
        injected: "/hover/injected.svelte",
    },
}
