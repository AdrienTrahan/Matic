<!-- @format -->
<script lang="ts">
    import type { ParentComponent } from "$framework/component"
    import { ComponentLoader } from "$framework/loader"
    import type { Project } from "$framework/project"
    import Button from "$lib/components/ui/button/button.svelte"
    import * as Dialog from "$lib/components/ui/dialog"
    import { Input } from "$lib/components/ui/input"
    import { Label } from "$lib/components/ui/label"
    import { LOADER_CONTEXT_KEY, PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { COMPONENT_NAME_REGEX } from "$shared/validation"
    import { createEventDispatcher, getContext } from "svelte"
    import type { Writable } from "svelte/store"
    const dispatch = createEventDispatcher()

    const project: Project = getContext(PROJECT_CONTEXT_KEY)
    const loader: ComponentLoader = getContext(LOADER_CONTEXT_KEY)
    const current: Writable<ParentComponent | undefined> = loader.main

    const { data: projectData } = project

    $: currentComponent = Object.keys($projectData.library).some(component => $current && component == $current?.id)
        ? $current
        : undefined

    let newComponentName: string = ""

    $: createNewComponentSubmitDisabled =
        !newComponentName.match(COMPONENT_NAME_REGEX) || Object.values($projectData.library).includes(newComponentName)
    $: components = Object.entries($projectData.library).sort((a: any, b: any) =>
        a[1].toUpperCase() < b[1].toUpperCase() ? -1 : 1,
    )

    let newComponentDialogOpened
    let newComponentErrorMessage: string

    async function createNewComponent() {
        newComponentErrorMessage = ""
        let [result, error] = await project.createComponent(newComponentName)
        if (error || !result) return (newComponentErrorMessage = error.reason ?? error)

        newComponentName = ""
        newComponentDialogOpened = false

        selectComponentWithId(result.id)
    }

    function selectComponentWithId(id: string) {
        dispatch("switchSelection", { id })
    }
</script>

<div class="flex-1 flex flex-col">
    <h1 class="text-lg font-bold mx-4 my-2">Components</h1>
    <div class="flex-1">
        {#each components as [id, name]}
            <div class="flex my-0">
                <Button
                    on:click={() => selectComponentWithId(id)}
                    variant={currentComponent && currentComponent.id == id ? "secondary" : "ghost"}
                    class="flex-1 mx-2 justify-between capitalize shadow-none"
                    size="sm"
                    >{name}
                </Button>
            </div>
        {/each}
    </div>
    <div class="p-2 w-full flex">
        <Button
            on:click={() => (newComponentDialogOpened = true)}
            variant="secondary"
            class="flex-1 text-blue-600 text-xs">New Component</Button>
    </div>
</div>

<Dialog.Root bind:open={newComponentDialogOpened}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>New Component</Dialog.Title>
            <Dialog.Description>What name would you like your component to have?</Dialog.Description>
        </Dialog.Header>

        <div class="grid py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Name</Label>
                <Input id="name" placeholder="Component Name" bind:value={newComponentName} class="col-span-3" />
            </div>
            {#if newComponentErrorMessage}
                <p class="text-red-500 text-xs mt-4 text-right">{newComponentErrorMessage}</p>
            {/if}
        </div>
        <Dialog.Footer>
            <Button on:click={createNewComponent} disabled={createNewComponentSubmitDisabled} type="submit"
                >Create Component</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
