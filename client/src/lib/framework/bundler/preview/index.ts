/** @format */

import type { Component } from "$framework/component"
import { INJECTED_SRCDOC_SYMBOL, srcdoc, type File } from "$lib/components/utils/bundler"
import { renameElementId } from "$shared/sharedb"
import Matic from "../library/Matic.js?raw"
import App from "./template/App.svelte?raw"
import Page from "./template/Page.svelte?raw"
import TreeTemplate from "./template/Tree.svelte?raw"

export function getPreviewInjectedCode(index: number) {
    return srcdoc.replace(
        INJECTED_SRCDOC_SYMBOL,
        `
            Object.defineProperty(window, 'Matic', {
                value: {
                    type: "preview",
                    index: ${index}
                },
                writable: false,
                configurable: false
            });
        `
    )
}

export function getPreviewFiles(components: Component[]): File[] {
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
            name: "Tree",
            type: "svelte",
            source: TreeTemplate,
        },
        {
            name: "Preloader",
            type: "js",
            source: getPreloadComponentsCode(components.map(({ id }) => renameElementId(id ?? ""))),
        },
        ...components
            .map(component => [component.id, component.codeLoader?.getCode()])
            .map(([id, code]) => ({
                name: renameElementId(id ?? ""),
                type: "svelte",
                source: code ?? "",
            })),
    ]
}

function getPreloadComponentsCode(componentIds): string {
    const imports = componentIds.map(componentId => `import ${componentId} from "./${componentId}.svelte";`).join("")
    return `
        ${imports}
        export default {${componentIds.join(", ")}};
    `
}

function getComponentSlotsCode(slotLength: number): string {
    const slotsCode = new Array(slotLength)
        .fill(0)
        .map(
            (_, i) => `
            <svelte:fragment slot="${i}">
                {#each (content[${i}] ?? []) as child}
                    <svelte:self instanceId={child.id} content={child.children} />
                {/each}
            </svelte:fragment>
        `
        )
        .join("")
    return `
            <script>
                import Matic from "./Matic"
                import Preloader from "./Preloader"
                import Tree from "./Tree.svelte"

                export let instanceId
                export let content = [];
                $: component = Matic.getVariable(instanceId)
            </script>
            {#if $component.type == "file"}
                <svelte:component this={Preloader[instanceId]}>
                    ${slotsCode}
                </svelte:component>
            {:else}
                {#each $component.children as slot}
                    {#each slot as child}
                        <svelte:self instanceId={child.id} content={child.children} />
                    {/each}
                {/each}
            {/if}
        `
}
