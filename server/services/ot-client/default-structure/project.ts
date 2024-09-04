/** @format */

export function getDefaultProjectStructure(projectId: string, componentId: string) {
    return {
        id: projectId,
        pages: {
            "/": componentId,
        },
        library: {},
    }
}
