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

export function createSvelteFile(imports: string, code: string) {
    return `<script>${imports}</script>${code}`
}

export function renameComponentId(id: string) {
    return (id ?? "").replace(/[\W]+/, "_")
}

export function generateSvelteComponentOpening(id: string) {
    return `<${renameComponentId(id)}>`
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

export function compileSvelteImports(imports: string[]): string {
    return imports
        .map(component => `import ${renameComponentId(component)} from "./${renameComponentId(component)}.svelte";`)
        .join("\n")
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
        children.map(({ id, children: content }: any) => [
            generateSvelteComponentOpening(id),
            compileList2SvelteList(content),
            generateSvelteComponentClosing(id),
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
