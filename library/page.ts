/** @format */

import { ComponentClass, ComponentInstance, ComponentLibrary } from "./interface"

export class ComponentViewport {
    parentElement: HTMLElement
    componentInstance: ComponentInstance
    componentClass: ComponentClass
    library: ComponentLibrary
    constructor(componentInstance: ComponentInstance, componentClass: ComponentClass, parentElement: HTMLElement) {
        this.parentElement = parentElement
        this.componentInstance = componentInstance
        this.componentClass = componentClass
        this.library = componentClass.library
    }
}
