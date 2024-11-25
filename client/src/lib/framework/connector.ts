/** @format */

import { derived, get, writable, type Readable, type Unsubscriber, type Writable } from "svelte/store"
import type { Viewer } from "./viewer"

let messageId = 0

export default class Connector {
    viewer: Viewer

    private readyStatus = writable({
        preview: [] as boolean[],
        drawable: false as boolean
    })
    private ready
    private readyUnsubscriber?: Unsubscriber
    isLoaded: Writable<boolean> = writable(false)

    private iframesBinded
    private iframesBindedUnsubscriber?: Unsubscriber

    handlers: { [key: string]: (...args: any[]) => any } = {
        ready: ({ origin }) => this.setIsReady(origin),
        return: data => this.returnMessage(data),
        redirect: data => this.redirectMessage(data),
    }
    iframes: Readable<{ preview: { [key: number]: HTMLIFrameElement }, drawable: HTMLIFrameElement | null}>

    private sentMessages: { [messageId: string]: [Promise<any>, any][] } = {}
    private mainHandlers: { [functionName: string]: (...args: any[]) => any } = {
        variable: (...args: [string, any]) => this.setVariable(...args),
    }
    private isEditingVariable: boolean = false
    private variables: { [name: string]: Writable<any> } = {}
    private unsubscribers: Unsubscriber[] = []

    constructor(viewer: Viewer) {
        this.viewer = viewer
        this.iframes = derived([this.viewer.previewIframes, this.viewer.drawableIframe], ([$previewIframes, $drawableIframe]) => {
            return {
                preview: $previewIframes,
                drawable: $drawableIframe
            }
        })
    }

    destroy() {}

    setIsReady(origin: any) {
        switch (origin.type) {
            case "preview":
                if (origin?.index === undefined || get(this.readyStatus).preview.length <= origin.index) return
                this.readyStatus.update(readyStatus => {
                    readyStatus.preview[origin.index] = true
                    return readyStatus
                })
                break
            
            case "drawable":
                this.readyStatus.update(readyStatus => {
                    readyStatus.drawable = true
                    return readyStatus
                })
                break
        }
    }

    async resetReadyStatus(windowCount: number = get(this.viewer.boxes).length) {
        this.readyStatus.update(readyStatus => {
            readyStatus.preview = new Array(windowCount).fill(false)
            readyStatus.drawable = false;
            return readyStatus
        })
        this.ready = new Promise<void>(resolve => {
            if (typeof this.readyUnsubscriber === "function") this.readyUnsubscriber()
            this.readyUnsubscriber = this.readyStatus.subscribe($readyStatus => {
                if ($readyStatus.preview.every(val => val) && $readyStatus.preview.length > 0 && $readyStatus.drawable) {
                    if (typeof this.readyUnsubscriber === "function") this.readyUnsubscriber()
                    resolve()
                }
            })
        })
    }

    async waitForIframes2Bind() {
        this.iframesBinded = new Promise<void>(resolve => {
            if (typeof this.iframesBindedUnsubscriber === "function") this.iframesBindedUnsubscriber()
            this.iframesBindedUnsubscriber = this.iframes.subscribe($iframes => {
                if (
                    Object.values($iframes.preview).filter(iframe => iframe != null).length ===
                    get(this.viewer.windowCount) && 
                    $iframes.drawable != null
                ) {
                    if (typeof this.iframesBindedUnsubscriber === "function") this.iframesBindedUnsubscriber()
                    resolve()
                }
            })
        })
        return this.iframesBinded
    }

    async setupConnections() {
        this.cleanUpConnections()
        await this.waitForIframes2Bind()

        this.broadcastCall("triggerIsReady", [])
        await this.ready

        await this.addVariable("boxes", this.viewer.boxes)
        await this.addVariable("transform", this.viewer.panzoomTransform)
        await this.addVariable("anchor", this.viewer.anchorBox)

        for (const componentDependency of this.viewer.getEditor().getAllComponentsDependencies()) {
            const componentDataWritable = this.viewer.getEditor().getComponentWithId(componentDependency).componentData
            await this.addVariable(componentDependency, componentDataWritable)
        }
        for (const pluginDependency of this.viewer.getEditor().getAllPluginsDependencies()) {
            const pluginDataWritable = this.viewer.getEditor().getPluginWithId(pluginDependency).documentData
            await this.setVariable(pluginDependency, pluginDataWritable)
        }
        const presentedComponentId = get(this.viewer.getEditor().getPresentedComponent())?.id
        await this.addVariable("presentedComponent", writable(presentedComponentId))

        const heights = await this.sendCallMessage(
            this.getRecipients("preview", "main"), {
            messageId: messageId++,
            data: {
                action: "getHeight"
            },
        })
        this.viewer.boxes.update($boxes => {
            for (const i in heights){
                $boxes[i].h = heights[i];
            }
            return $boxes;
        })

        await this.broadcastCall("loaded", [])
        this.isLoaded.set(true)
    }

    async cleanUpConnections() {
        this.isLoaded.set(false)
        this.clearVariables()

        for (const unsubscriber of this.unsubscribers) {
            unsubscriber()
        }
        this.unsubscribers = []

        this.resetReadyStatus()
    }

    getRecipients(destinationType: string, originType: string, index: number | "*" = "*") {
        if (originType == destinationType) return []
        const mainRecipient = originType == "main" ? [] : [this]
        if (destinationType == "*") return [...this.getRecipients("preview", originType), ...this.getRecipients("drawable", originType), ...mainRecipient]
        switch (destinationType) {
            case "preview":
                if (index == "*") return Object.values(get(this.iframes)?.preview).filter(iframe => iframe != null)
                if (get(this.iframes)?.preview[index]) return [get(this.iframes)?.preview[index]]
                break
            case "drawable":
                if (get(this.iframes).drawable) return [get(this.iframes).drawable]
                break
            case "main":
                return [this]
        }
        return []
    }

    async sendCallMessage(recipients: (HTMLIFrameElement | Connector)[], data: any) {
        this.sentMessages[data.messageId] = new Array(recipients.length).fill(0).map(_ => {
            let resolveCallback
            const promise = new Promise(resolve => (resolveCallback = resolve))
            return [promise, resolveCallback]
        })
        for (const [recipientIndex, recipient] of recipients.entries()) {
            data.recipientIndex = recipientIndex
            if (recipient instanceof HTMLIFrameElement && recipient?.contentWindow)
                recipient.contentWindow.postMessage({ action: "call", ...data }, "*")
            if (recipient instanceof Connector) recipient.receiveMessage(data)
        }
        const results = await Promise.all(this.sentMessages[data.messageId].map(([promise]) => promise))
        delete this.sentMessages[data.messageId]
        return results
    }

    sendReturnMessage(recipients: (HTMLIFrameElement | Connector)[], data: any) {
        for (const recipient of recipients) {
            if (recipient instanceof HTMLIFrameElement && recipient?.contentWindow)
                recipient.contentWindow.postMessage({ ...data, action: "return" }, "*")
        }
    }

    returnMessage(data) {
        if (
            this.sentMessages[data.messageId] === undefined ||
            this.sentMessages[data.messageId][data.recipientIndex] === undefined
        )
            return
        const [_, resolve] = this.sentMessages[data.messageId][data.recipientIndex]
        resolve(data.data)
    }

    async redirectMessage(data) {
        const allRecipients = this.getRecipients(data.destination, data.origin)

        let results = await this.sendCallMessage(allRecipients, {
            action: "call",
            messageId: messageId++,
            data: data.data,
        })

        const originRecipient = this.getRecipients(data.origin, data.destination, data.originIndex)

        this.sendReturnMessage(originRecipient, { ...data, data: results })
    }

    async receiveMessage(data: any) {
        if (data?.data?.action === undefined || typeof this.mainHandlers[data?.data?.action] != "function") return
        const result = await this.mainHandlers[data?.data?.action](...(data?.data?.args ?? []))
        this.handlers.return({ ...data, action: "return", data: result })
    }

    async updateVariable(name: string, value: any) {
        await this.broadcastCall("variable", [name, value])
    }

    async setVariable(name, value) {
        return await new Promise<void>(resolve => {
            if (this.variables[name] === undefined) {
                this.variables[name] = writable(value)
                const unsubscriber = this.variables[name].subscribe(async $value => {
                    if (this.isEditingVariable) return
                    await this.updateVariable(name, $value)
                    resolve()
                })
                this.unsubscribers.push(unsubscriber)
            } else {
                this.isEditingVariable = true
                this.variables[name].set(value)
                this.isEditingVariable = false
            }
            resolve()
        })
    }

    async addVariable(name, writable) {
        return await new Promise<void>(resolve => {
            this.variables[name] = writable
            const unsubscriber = writable.subscribe(async $value => {
                if (this.isEditingVariable) return
                await this.updateVariable(name, $value)
                resolve()
            })
            this.unsubscribers.push(unsubscriber)
        })
    }

    async clearVariables() {
        await this.broadcastCall("clearVariables", [])
        this.variables = {}
    }

    async broadcastCall(functionName, args: any[] = []) {
        const allRecipients = this.getRecipients("*", "main")
        await this.sendCallMessage(allRecipients, {
            messageId: messageId++,
            data: {
                action: functionName,
                args,
            },
        })
    }
}
