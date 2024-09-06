<!-- @format -->
<script lang="ts">
    import type { Project } from "$framework/project"
    import * as Card from "$lib/components/ui/card"
    import { PROJECT_CONTEXT_KEY } from "$lib/constants"
    import { getContext } from "svelte"
    export const project: Project = getContext(PROJECT_CONTEXT_KEY)
</script>

<Card.Root class="h-10 w-full flex items-center">
    <Card.Content class="w-full flex justify-between items-center p-0">
        <div></div>
        <div>
            <h2 class="text-sm select-none font-semibold capitalize" draggable="false">
                {project.name ?? ""}
            </h2>
        </div>
        <div></div>
    </Card.Content>
</Card.Root>
