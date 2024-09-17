/** @format */

export const INHOUSE_PREFIX = "IH_"
export const BEHAVORIAL_PREFIX = "BH_"

export function getProjectDocumentId(projectId: string) {
    return `PR_${projectId}`
}

export function getComponentDocumentIdPrefix(projectId: string) {
    return `CP_${projectId}-`
}

export function isElementInHouseFromId(elementId: string) {
    return (elementId ?? "").startsWith(INHOUSE_PREFIX) || (elementId ?? "").startsWith(BEHAVORIAL_PREFIX)
}

export function getComponentDocumentId(projectId: string, componentId: string) {
    return `${getComponentDocumentIdPrefix(projectId)}${componentId}`
}

export const PROJECT_COLLECTION = "PR"
export const COMPONENT_COLLECTION = "CP"
export const DEFAULT_COMPONENT_NAME = "Component"
export const PLUGIN_COLLECTION = "PL"

export enum ComponentTypes {
    TREE = "tree",
    FILE = "file",
}

export function createSvelteFile(imports: string, bindings: string, code: string) {
    return `<script>${imports};${bindings}</script>${code}`
}

export function renameElementId(id: string) {
    return (id ?? "").replace(/[\W]+/, "_")
}

export function generateSvelteComponentOpening(id: string, component: any) {
    return `<${renameElementId(id)} bind:this={bindings["${component.unique}"]}>`
}

export function generateSvelteElementClosing(id: string) {
    return `</${renameElementId(id)}>`
}

export function generateSvelteDrawablePluginTag(id: string, unique: string) {
    return `<${renameElementId(id)} component="${unique}" />`
}

export function generateSvelteInjectedPluginTag(id: string, component: string) {
    return `<${renameElementId(id)} component={components["${component}"]} {components} />`
}

export function generateSvelteFragmentSlotOpening(index: number) {
    return `<svelte:fragment slot="${index}">`
}

export function generateSvelteFragmentSlotClosing() {
    return `</svelte:fragment>`
}

export function findSvelteImports(slots: any[], imports = new Set<string>()): Set<string> {
    for (const slot of slots) {
        for (const child of slot) {
            imports.add(child.id)
            findSvelteImports(child.children, imports)
        }
    }
    return imports
}

export function findComponentUniqueIds(slots: any[], ids = new Set<string>()) {
    for (const slot of slots) {
        for (const child of slot) {
            ids.add(child.unique)
            findComponentUniqueIds(child.children, ids)
        }
    }
    return Array.from(ids)
}

export function createBindingsObject(slots: any[]) {
    const uniqueIds = findComponentUniqueIds(slots)
    const bindingsObject = uniqueIds.reduce((acc: any, key: string) => {
        acc[key] = null
        return acc
    }, {})

    return `export let bindings = ${JSON.stringify(bindingsObject)};`
}

export function compileSvelteImports(imports: string[]): string {
    return imports.map(component => `import ${renameElementId(component)} from "./${component}.svelte";`).join("\n")
}

export function compileComponentList2SvelteList(slots: any[]): any {
    const compiledList = compileList2SvelteList(slots)
    for (const list of compiledList) {
        list.pop()
        list.shift()
    }
    return compiledList
}

export function compileList2SvelteList(slots: any[]): any {
    return slots.map((children, slotIndex) => [
        generateSvelteFragmentSlotOpening(slotIndex),
        children.map((child: any) => [
            generateSvelteComponentOpening(child.id, child),
            compileList2SvelteList(child.children),
            generateSvelteElementClosing(child.id),
        ]),
        generateSvelteFragmentSlotClosing(),
    ])
}

export function flattenHMTL(htmlComponents: any[]): string {
    let flatHTML: string[] = []
    function flatten(element: any) {
        if (Array.isArray(element)) {
            element.forEach(flatten) // Recursively call flatten on each item
        } else {
            flatHTML.push(element) // Push non-array elements to the flat array
        }
    }

    flatten(htmlComponents)
    return flatHTML.join("")
}

export function generateEntrySvelteComponent(entryComponentId: string) {
    return `<script>
                ${getDefaultImportsCode()}
                ${compileSvelteImports([entryComponentId])};
                let bindings;
                ${getPageLoadingHandlingCode()}
            </script>
            <${renameElementId(entryComponentId)} bind:bindings/>
            <Plugins components={bindings} />
            `
}

export function getDefaultImportsCode() {
    return `
        import { onMount, setContext } from "svelte"
        import { writable, get } from "svelte/store"
        import Plugins from "./Plugins.svelte";
    `
}
export function getPageLoadingHandlingCode() {
    return `
        onMount(() => {
            parent.postMessage({
                action: "loaded",
            }, "*") 
        })
    `
}

export function flattenComponentWithIds(parentComponent: any, uniques: { [key: string]: any } = {}) {
    uniques[parentComponent.unique] = parentComponent
    for (const slot of parentComponent.children) {
        for (const child of slot) {
            flattenComponentWithIds(child, uniques)
        }
    }
    return uniques
}
