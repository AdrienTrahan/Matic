/** @format */

export function getPreloadElementsCode(elementIds): string {
    const imports = elementIds.map(elementId => `import ${elementId} from "./${elementId}.svelte";`).join("")
    return `
        ${imports}
        export default {${elementIds.join(", ")}};
    `
}
