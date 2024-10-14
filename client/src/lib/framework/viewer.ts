/** @format */

import type { Component } from "$framework/component"
import type { Editor } from "$framework/editor"
import { derived, get, writable, type Readable, type Unsubscriber, type Writable } from "svelte/store"
import Connector from "./connector"

export class Viewer {
    private editor: Editor
    private connector: Connector

    windowCount: Readable<number>

    boxes: Writable<
        {
            x: number
            y: number
            w: number
            h: number
        }[]
    > = writable([])

    panzoomTransform: Writable< {
        x: number
        y: number
        scale: number
    }> = writable({x: 0, y: 0, scale: 0})

    anchorBox: Writable<{ width: number; height: number; top: number; left: number }> = writable({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
    })

    previewIframes: Writable<{ [key: number]: HTMLIFrameElement }> = writable({})
    drawableIframe: Writable<HTMLIFrameElement | null> = writable(null)

    private presentedComponentDataUnsubscriber?: Unsubscriber
    private dependencyListenerUnsubscribers: { [componentId: string]: Unsubscriber } = {}

    constructor(editor: Editor) {
        this.editor = editor
        this.connector = new Connector(this)
        this.windowCount = derived(
            [this.editor.getPresentedComponent()],
            ([presentedComponent]) => (presentedComponent?.documentData?.breakpoints?.length ?? -1) + 1
        )
    }

    getEditor() {
        return this.editor
    }

    getConnector() {
        return this.connector
    }

    resetPresentedComponent() {
        this.clearUnsubscribeToListeners()
        this.connector.cleanUpConnections()

        const presentedComponent: Component | null = get(this.editor.getPresentedComponent())
        if (presentedComponent === null) return
        this.listenForBoxChange(presentedComponent)
        this.listenForDependencyUpdates()
        this.connector.setupConnections()
    }

    listenForBoxChange(presentedComponent: Component) {
        this.presentedComponentDataUnsubscriber = presentedComponent.componentData.subscribe(component => {
            this.boxes.update(currentBoxes => {
                if (currentBoxes.length != component?.boxes?.length) return component?.boxes
                for (const [i, box] of currentBoxes.entries()) {
                    if (box.x != component?.boxes[i].x) box.x = component?.boxes[i].x
                    if (box.y != component?.boxes[i].y) box.y = component?.boxes[i].y
                    if (box.w != component?.boxes[i].w) box.w = component?.boxes[i].w
                }
                return currentBoxes
            })
        })
    }

    listenForDependencyUpdates() {
        const dependencies = this.editor.getPresentedComponentDependencies()
        for (const dependency of dependencies) {
            this.addComponentDependency(dependency)
        }
    }

    addComponentDependency(componentId: string) {
        this.dependencyListenerUnsubscribers[componentId] = this.editor
            .getComponentWithId(componentId)
            .componentData.subscribe($data => {
                // console.log($data, "changed")
            })
    }

    removeComponentDependency(componentId: string) {
        if (typeof this.dependencyListenerUnsubscribers[componentId] === "function")
            this.dependencyListenerUnsubscribers[componentId]()
        delete this.dependencyListenerUnsubscribers[componentId]
    }

    clearUnsubscribeToListeners() {
        if (typeof this.presentedComponentDataUnsubscriber === "function") this.presentedComponentDataUnsubscriber()
        for (const dependencyListenerUnsubscriber of Object.values(this.dependencyListenerUnsubscribers)) {
            dependencyListenerUnsubscriber()
        }
        this.dependencyListenerUnsubscribers = {}
    }
}
