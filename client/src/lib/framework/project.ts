/** @format */

import { getProjectDocumentId, PROJECT_COLLECTION } from "$shared/sharedb"
import type { Connection, Doc } from "sharedb/lib/client"
import { authFetch, formUrlEncode } from "./networking"
import { Connector } from "./socket/connection"
import { get, writable, type Writable } from "svelte/store"

export class Project {
    projectId: string
    connection: Connection | undefined
    private projectDoc: Doc | undefined

    projectData: Writable<any> = writable(null)
    private constructor(id: string) {
        this.projectId = id
    }

    static async init(id: string) {
        let project = new Project(id)
        await project.loadConnection()
        return project
    }

    async loadConnection() {
        this.connection = await Connector.get(this.projectId)
        this.projectDoc = this.connection!.get(PROJECT_COLLECTION, getProjectDocumentId(this.projectId))
        await new Promise<void>((resolve, reject) => {
            this.projectDoc!.on("op", this.updateProjectData.bind(this))
            this.projectDoc!.subscribe(err => (err ? reject(err) : resolve()))
        })
        this.updateProjectData()
    }

    updateProjectData() {
        this.projectData.set(this.projectDoc?.data)
    }

    async getGeneralProjectData(fetch?) {
        return await authFetch(`/project/get?id=${this.projectId}`, {}, fetch)
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
            body: formUrlEncode({ name, projectId: this.projectId }),
        })
    }
}
