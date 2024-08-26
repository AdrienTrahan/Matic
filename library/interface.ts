/** @format */

export interface ComponentInstance {
    id: string
    properties: {
        [key: string]: any
    }
    slots: {
        [key: string]: ComponentInstance[]
    }
    classId: string
}

export interface ComponentClass {
    id: string
    path: string
    slots: string[]
    library: ComponentLibrary
}

export interface ComponentLibrary {
    [key: string]: ComponentClass
}
