<!-- @format -->
<script lang="ts">
    import { goto } from "$app/navigation"
    import { user } from "$framework/auth"
    import { Project } from "$framework/project"

    export let data
    let names = data.projects.map(({ project_name }) => project_name)

    let errorMessage = ""

    async function createProject() {
        errorMessage = ""
        const [result, error] = await Project.createProject()
        if (error) return (errorMessage = error.reason)
        if (result?.id) goto(`/project?id=${result?.id}`)
    }

    async function updateProjectName(name: string, id: string) {
        errorMessage = ""
        const [_, error] = await Project.updateProjectName(name, id)
        if (error) return (errorMessage = error.reason)
        window.location.reload()
    }
</script>

<button on:click={user.logout}> Logout </button>
<hr />
{#each data.projects as project, index}
    <a href="/project?id={project.id}">{project.project_name}</a>
    <input type="text" bind:value={names[index]} />
    <button on:click={() => updateProjectName(names[index], project.id)}>update</button>
    <br />
{/each}
<hr />
<p>{errorMessage}</p>
<button on:click={createProject}> Create Project </button>
