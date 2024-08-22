<!-- @format -->
<script lang="ts">
    import { user } from "$framework/auth"
    import { project } from "$framework/project"

    export let data

    let errorMessage = ""

    async function createProject() {
        errorMessage = ""
        const [result, error] = await project.createProject()
        if (error) return (errorMessage = error.reason)
        console.log(result)
    }
</script>

<button on:click={user.logout}> Logout </button>
<hr />
{#each data.projects as project}
    <a href="/project?id={project.id}/">{project.project_name}</a>
    <br />
{/each}
<hr />
<p>{errorMessage}</p>
<button on:click={createProject}> Create Project </button>
