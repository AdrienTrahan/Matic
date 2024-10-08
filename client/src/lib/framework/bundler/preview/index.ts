/** @format */

import type { Component } from "$framework/component"
import type { Plugin } from "$framework/plugin"
import { INJECTED_SRCDOC_SYMBOL, srcdoc, type File } from "$lib/components/utils/bundler"
import { renameElementId } from "$shared/sharedb"
import { getPreloadElementsCode } from ".."
import Matic from "../library/Matic.js?raw"
import App from "./template/App.svelte?raw"
import Page from "./template/Page.svelte?raw"
import PluginInjector from "./template/PluginInjector.svelte?raw"

export function getPreviewInjectedCode(index: number) {
    return srcdoc.replace(
        INJECTED_SRCDOC_SYMBOL,
        `
            Object.defineProperty(window, 'Matic', {
                value: Object.freeze({
                    type: "preview",
                    index: ${index}
                }),
                writable: false,
                configurable: false
            });
        `
    )
}

export function getPreviewFiles(components: Component[], plugins: Plugin[]): File[] {
    const maxSlotLength = components.reduce((maxSlotCount, component) => {
        const slotCount = component?.documentData?.slots?.length ?? 0
        return slotCount > maxSlotCount ? slotCount : maxSlotCount
    }, 0)

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
            name: "Component",
            type: "svelte",
            source: getComponentSlotsCode(maxSlotLength),
        },
        {
            name: "PluginInjector",
            type: "svelte",
            source: PluginInjector,
        },
        {
            name: "Preloader",
            type: "js",
            source: getPreloadElementsCode([
                ...components.map(({ id }) => renameElementId(id ?? "")),
                ...plugins.map(({ id }) => renameElementId(id ?? "")),
            ]),
        },
        ...components
            .map(component => [component.id, component.codeLoader?.getCode()])
            .map(([id, code]) => ({
                name: renameElementId(id ?? ""),
                type: "svelte",
                source: code ?? "",
            })),
        ...plugins
            .map(plugin => [plugin.id, plugin.codeLoader?.getCode().preview])
            .map(([id, code]) => ({
                name: renameElementId(id ?? ""),
                type: "svelte",
                source: code ?? "",
            })),
    ]
}

function getComponentSlotsCode(slotLength: number): string {
    const slotsCode = new Array(slotLength)
        .fill(0)
        .map(
            (_, i) => `
            <svelte:fragment slot="${i}">
                {#each (component.children[${i}] ?? []) as child}
                    <PluginInjector component={child} />
                {/each}
            </svelte:fragment>
        `
        )
        .join("")
    return `
            <script>
                import Matic from "./Matic"
                import Preloader from "./Preloader"
                import PluginInjector from "./PluginInjector.svelte"

                export let component;
                let componentDeclaration = Matic.getVariable(component.id);
                $: componentDeclaration = Matic.getVariable(component.id);

            </script>
            {#if $componentDeclaration.type == "file"}
                <svelte:component this={Preloader[component.id]}>
                    ${slotsCode}
                </svelte:component>
            {:else if $componentDeclaration.type == "tree"}
                {#each component.children as slot}
                    {#each slot as child}
                        <PluginInjector component={child} />
                    {/each}
                {/each}
            {/if}
        `
}
