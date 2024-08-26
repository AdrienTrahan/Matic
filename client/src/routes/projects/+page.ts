/** @format */

import { Project } from "$framework/project"
import { error } from "@sveltejs/kit"

export async function load({ fetch }) {
    const [result, err] = await Project.listProjects(fetch)
    if (err) return error(500, { message: `Failed to load projects: ${err}` })

    return {
        projects: result,
    }
}
