/** @format */

import {
    PUBLIC_LIB_URL,
    PUBLIC_MARKETPLACE_LIB_URL,
    PUBLIC_MARKETPLACE_PLUGIN_URL,
    PUBLIC_PLUGIN_URL,
} from "$env/static/public"
import { isElementInHouseFromId } from "$shared/sharedb"
import { get, writable, type Writable } from "svelte/store"
import { Component } from "./component"
import { safeFetch } from "./networking"
import { Plugin } from "./plugin"

class CodeLoader {
    element: Component | Plugin
    constructor(element: Component | Plugin) {
        this.element = element
    }

    async fetchCodeFromFile(path) {
        const [result, error] = await safeFetch(path, {
            credentials: "omit",
        })
        if (error) return
        return result
    }

    async load() {
        throw "Not Implemented"
    }
}

export class ComponentCodeLoader extends CodeLoader {
    code: Writable<string> = writable(``)

    constructor(component: Component) {
        super(component)
    }

    getCode() {
        return get(this.code)
    }
}

export class FileComponentCodeLoader extends ComponentCodeLoader {
    constructor(element: Component) {
        super(element)
    }

    async load() {
        const path = this.getFilePath()
        const code = await this.fetchCodeFromFile(path)

        if (code === undefined) return
        this.code.set(code)
    }

    getFilePath() {
        if (isElementInHouseFromId(this.element.id)) {
            return `${PUBLIC_LIB_URL}${this.element.documentData.file}`
        } else {
            return `${PUBLIC_MARKETPLACE_LIB_URL}${this.element.documentData.file}`
        }
    }
}

export class TreeComponentCodeLoader extends ComponentCodeLoader {
    constructor(element: Component) {
        super(element)
    }

    async load() {}
}

export class PluginCodeLoader extends CodeLoader {
    code: Writable<{
        drawable: string | null
        preview: string | null
        panel: string | null
        card: string | null
    }> = writable({
        drawable: null,
        preview: null,
        panel: null,
        card: null,
    })

    constructor(plugin: Plugin) {
        super(plugin)
    }

    async load() {
        const newCode = {
            drawable: null,
            preview: null,
            panel: null,
            card: null,
        }
        for (const codeType of Object.keys(newCode)) {
            if (this.element.documentData[codeType]) {
                const path = this.getFilePath(this.element.documentData[codeType])
                const code = await this.fetchCodeFromFile(path)
                newCode[codeType] = code
            }
        }
        this.code.set(newCode)
    }

    getFilePath(filePath) {
        if (isElementInHouseFromId(this.element.id)) {
            return `${PUBLIC_PLUGIN_URL}${filePath}`
        } else {
            return `${PUBLIC_MARKETPLACE_PLUGIN_URL}${filePath}`
        }
    }

    getCode() {
        return get(this.code)
    }
}
