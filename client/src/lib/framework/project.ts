/** @format */

import { getProjectDocumentId, PROJECT_COLLECTION } from "$shared/sharedb"
import type { Connection, Doc } from "sharedb/lib/client"
import { derived, get, writable, type Readable, type Writable } from "svelte/store"
import { authFetch, formUrlEncode } from "./networking"
import { Connector } from "./socket/connection"
import { Components } from "$shared/packages"
import { Editor } from "./editor"
import { redirect } from "@sveltejs/kit"
import { ComponentLoader, PluginLoader } from "./element-loader"

export class Project {
    id: string
    connection: Connection | undefined
    private doc: Doc | undefined
    private editor: Writable<Editor | undefined> = writable()

    data: Writable<any> = writable(null)
    name: string = ""

    private constructor(id: string) {
        this.id = id
    }

    async reloadProject(fetcher: any = fetch) {
        if (this.connection === undefined) return
        const [_, error] = await this.loadGeneralProjectData(fetcher)
        if (error) throw redirect(307, "/projects")

        const loadableComponentIds = get(this.loadableComponentIds)
        const componentLoader = await ComponentLoader.from(loadableComponentIds, this.connection)

        const dependencyPlugins = componentLoader.getDependencyPlugins()
        const pluginLoader = await PluginLoader.from(dependencyPlugins, this.connection)
        this.editor.set(new Editor(this, componentLoader, pluginLoader))
    }

    static async init(id: string, fetcher: any = fetch) {
        let project = new Project(id)

        await project.loadConnection()
        await project.reloadProject(fetcher)
        return project
    }

    async loadConnection() {
        this.connection = await Connector.get(this.id)
        this.doc = this.connection!.get(PROJECT_COLLECTION, getProjectDocumentId(this.id))
        await new Promise<void>((resolve, reject) => {
            this.doc!.on("op", (ops: any[]) => {
                for (const op of ops) {
                    this.hasReceivedOp(op)
                }
            })
            this.doc!.subscribe(err => (err ? reject(err) : resolve()))
        })
        this.setupProjectData()
    }

    getEditor() {
        return this.editor as Writable<Editor>
    }

    setupProjectData() {
        this.data.set(this.doc?.data)
    }

    hasReceivedOp(op: any) {
        if (op.p[0] === "library" && op.oi !== undefined) {
            const componentId = op.p[1]
            const componentName = op.oi
            // this.data.update($data => {
            //     $data.library[componentId] = componentName
            // })
        }
    }

    async loadGeneralProjectData(fetch?) {
        const [value, error] = await authFetch(`/project/get?id=${this.id}`, {}, fetch)
        if (!error && value) this.name = value.project_name
        return [value, error]
    }

    static async createProject() {
        return await authFetch("/project/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: formUrlEncode({}),
        })
    }

    static async listProjects(fetch?) {
        return await authFetch("/project/list", {}, fetch)
    }

    static async updateProjectName(name: string, id: string) {
        return await authFetch("/project/update-name", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: formUrlEncode({ name, id }),
        })
    }

    async createComponent(name: string) {
        return await authFetch("/project/create-component", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: formUrlEncode({ name, projectId: this.id }),
        })
    }

    get pageIds(): Readable<string[]> {
        return derived([this.pages], ([pages]) => Object.values(pages))
    }

    get componentIds(): Readable<string[]> {
        return derived([this.library], ([lib]) => Object.keys(lib))
    }

    get loadableComponentIds(): Readable<string[]> {
        return derived([this.pageIds, this.componentIds], ([pageIds, componentIds]) => [
            ...componentIds,
            ...pageIds,
            ...Object.keys(Components),
        ])
    }

    get library(): Readable<{ [key: string]: string }> {
        return derived([this.data], ([data]) => data.library)
    }

    get pages(): Readable<{ [key: string]: string }> {
        return derived([this.data], ([data]) => data.pages)
    }
}
