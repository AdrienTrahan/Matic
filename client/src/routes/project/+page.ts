/** @format */

import { redirect } from "@sveltejs/kit"
import { Project } from "$framework/project"
import { get } from "svelte/store"

export async function load({ url, fetch }) {
    const params = new URLSearchParams(url.searchParams)
    if (!params.get("id")) throw redirect(307, "/projects")
    const id = parseInt(params.get("id")!).toString()
    const project = await Project.init(id)
    const [projectData, error] = await project.getGeneralProjectData(fetch)
    if (error) throw redirect(307, "/projects")
    return {
        projectId: id,
        project,
        projectData,
    }
}
