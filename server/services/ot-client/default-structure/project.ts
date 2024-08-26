/** @format */

export function getDefaultProjectStructure(projectId: string, componentId: string) {
    return {
        id: projectId,
        pages: {
            "/": {
                properties: {},
                slots: {},
                classId: componentId,
            },
        },
        library: {},
    }
}
