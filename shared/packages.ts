/** @format */

import { ComponentTypes } from "./sharedb"

export const Components = {
    IH_0: {
        type: ComponentTypes.FILE,
        file: "/frame.svelte",
        name: "Frame",
        slots: ["children"],
        plugins: [],
    },
}

export const Plugins = {
    BH_0: {
        drawable: "/hover/drawable.svelte",
        preview: "/hover/preview.svelte",
    },
    BH_1: {
        drawable: "/page-knob/drawable.svelte",
        preview: "/page-knob/preview.svelte",
    },
    BH_2: {
        drawable: "/viewport-manager/drawable.svelte",
        preview: "/viewport-manager/preview.svelte",
    },
}
