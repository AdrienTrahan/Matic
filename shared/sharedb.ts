/** @format */

export const INHOUSE_PREFIX = "IH_"

export function getProjectDocumentId(projectId: string) {
    return `PR_${projectId}`
}

export function getComponentDocumentIdPrefix(projectId: string) {
    return `CP_${projectId}-`
}

export function isComponentInHouseFromId(componentId: string) {
    return (componentId ?? "").startsWith(INHOUSE_PREFIX)
}

export function getComponentDocumentId(projectId: string, componentId: string) {
    return `${getComponentDocumentIdPrefix(projectId)}${componentId}`
}

export const PROJECT_COLLECTION = "PR"
export const COMPONENT_COLLECTION = "CP"
export const DEFAULT_COMPONENT_NAME = "Component"

export enum ComponentTypes {
    TREE = "tree",
    FILE = "file",
}

export function createSvelteFile(imports: string, bindings: string, code: string) {
    return `<script>${imports};${bindings}</script>${code}`
}

export function renameComponentId(id: string) {
    return (id ?? "").replace(/[\W]+/, "_")
}

export function generateSvelteComponentOpening(id: string, component: any) {
    return `<${renameComponentId(id)} unique={"${component.unique}"} bind:this={bindings["${component.unique}"]}>`
}

export function generateSvelteComponentClosing(id: string) {
    return `</${renameComponentId(id)}>`
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
    return imports.map(component => `import ${renameComponentId(component)} from "./${component}.svelte";`).join("\n")
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
            generateSvelteComponentClosing(child.id),
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
                ${compileSvelteImports([entryComponentId])};
                let bindings;
                ${getEditorComponentHandlingCode()}
            </script>
            <${renameComponentId(entryComponentId)} bind:bindings/>
            `
}

export function getEditorComponentHandlingCode() {
    return `
                import { onMount, setContext } from "svelte";
                import { writable, get } from "svelte/store";
                function updateHitboxes(id, hitboxes){
                    parent.postMessage({
                        action: "update_hitboxes",
                        data: {
                            id,
                            hitboxes
                        }
                    }, "*")
                }
                function updateOutlines(id, outlines){
                    parent.postMessage({
                        action: "update_outlines",
                        data: {
                            id,
                            outlines
                        }
                    }, "*")
                }

                onMount(() => {
                    for (const [id, component] of Object.entries(bindings)) {
                        if (component.hitboxes !== undefined){
                            const hitboxes = component.hitboxes;
                            hitboxes.subscribe((hitboxes) => updateHitboxes(id, hitboxes))
                        }
                        if (component.outlines !== undefined){
                            const outlines = component.outlines;
                            outlines.subscribe((outlines) => updateOutlines(id, outlines))
                        }
                    }
                })
            `
}
