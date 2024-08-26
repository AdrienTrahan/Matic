<!-- @format -->
<script lang="ts">
    import * as Card from "$lib/components/ui/card"
    export let projectName: string
</script>

<Card.Root class="h-10 w-full flex items-center">
    <Card.Content class="w-full flex justify-between items-center p-0">
        <div></div>
        <div>
            <h2 class="text-sm select-none">
                {projectName ?? ""}
            </h2>
        </div>
        <div></div>
    </Card.Content>
</Card.Root>
