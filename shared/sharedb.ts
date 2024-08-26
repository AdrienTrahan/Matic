/** @format */

export function getProjectDocumentId(projectId: string) {
    return `PR_${projectId}`
}

export function getComponentDocumentId(projectId: string, componentId: string) {
    return `CP_${projectId}-${componentId}`
}

export const PROJECT_COLLECTION = "PR"
export const COMPONENT_COLLECTION = "CP"
