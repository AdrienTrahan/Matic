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

export const DEFAULT_PAGE_COMPONENT_NAME = "Page"
