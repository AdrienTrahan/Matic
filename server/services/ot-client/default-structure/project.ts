/** @format */

export function getDefaultProjectStructure(projectId: string, componentId: string) {
    return {
        id: projectId,
        pages: {
            "/": 0,
        },
        components: [0],
    }
}
