/** @format */

import { getProjectDocumentId, PROJECT_COLLECTION } from "$shared/sharedb"
import type { Connection, Doc } from "sharedb/lib/client"
import { get, writable, type Writable } from "svelte/store"
import { authFetch, formUrlEncode } from "./networking"
import { Connector } from "./socket/connection"

export class Project {
    id: string
    connection: Connection | undefined
    private doc: Doc | undefined

    data: Writable<any> = writable(null)
    name: string = ""

    private constructor(id: string) {
        this.id = id
    }

    static async init(id: string) {
        let project = new Project(id)
        await project.loadConnection()
        return project
    }

    async loadConnection() {
        this.connection = await Connector.get(this.id)
        this.doc = this.connection!.get(PROJECT_COLLECTION, getProjectDocumentId(this.id))
        await new Promise<void>((resolve, reject) => {
            this.doc!.on("op", this.updateProjectData.bind(this))
            this.doc!.subscribe(err => (err ? reject(err) : resolve()))
        })
        this.updateProjectData()
    }

    updateProjectData() {
        this.data.set(this.doc?.data)
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

    get library() {
        return get(this.data).library
    }
}
