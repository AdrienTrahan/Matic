/** @format */

import { project } from "$framework/project.js"

export async function load({ fetch }) {
    const [result, error] = await project.getProjects(fetch)
    if (error) return error(`Failed to load projects: ${error}`)

    return {
        projects: result,
    }
}
