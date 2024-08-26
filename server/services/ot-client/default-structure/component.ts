/** @format */
export function getDefaultComponentStructure(componentId: string) {
    return {
        id: componentId,
        path: "/library/frame",
        slots: ["children"],
        library: {},
    }
}
