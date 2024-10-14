/** @format */

import type { Plugin } from "$framework/plugin"
import { INJECTED_SRCDOC_SYMBOL, srcdoc, type File } from "$lib/components/utils/bundler"
import { renameElementId } from "$shared/sharedb"
import { getPreloadElementsCode } from ".."
import Matic from "../library/Matic?raw"
import App from "./template/App.svelte?raw"
import Page from "./template/Page.svelte?raw"
import PositionalWrapper from "./template/PositionalWrapper.svelte?raw"

export function getDrawableInjectedCode() {
    return srcdoc.replace(
        INJECTED_SRCDOC_SYMBOL,
        `
            Object.defineProperty(window, 'Matic', {
                value: Object.freeze({
                    type: "drawable",
                    index: 0,
                }),
                writable: false,
                configurable: false
            });
        `
    )
}

export function getDrawableFiles(plugins: Plugin[]): File[] {
    
    return [
        {
            name: "App",
            type: "svelte",
            source: App,
        },
        {
            name: "Matic",
            type: "js",
            source: Matic,
        },
        {
            name: "Page",
            type: "svelte",
            source: Page,
        },
        {
            name: "PositionalWrapper",
            type: "svelte",
            source: PositionalWrapper,
        },
        {
            name: "Preloader",
            type: "js",
            source: getPreloadElementsCode([...plugins.map(({ id }) => renameElementId(id ?? ""))]),
        },
        ...plugins
            .map(plugin => [plugin.id, plugin.codeLoader?.getCode().drawable])
            .map(([id, code]) => ({
                name: renameElementId(id ?? ""),
                type: "svelte",
                source: code ?? "",
            })),
    ]
}
