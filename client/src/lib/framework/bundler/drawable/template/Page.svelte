<!-- @format -->
<script>
    // @ts-nocheck
    import Matic from "./Matic"
    import Preloader from "./Preloader"
    import PositionalWrapper from "./PositionalWrapper.svelte"
    import { derived, get, writable } from "svelte/store"

    const unsubscribers = writable([]);
    const globalDependencies = writable([]);
    const loadedPlugins = derived(globalDependencies, ($globalDependencies) => $globalDependencies.map(id => get(Matic.getVariable(id)).plugins ?? []).flat());

    const isReady = Matic.isReady;

    export function load() {
        prepareListenersForDependencies()
    }

    function prepareListenersForDependencies(){
        for (const unsubscribe of get(unsubscribers)){
            unsubscribe()
        }

        const dependencies = getDependencies();
        for (const dependency of dependencies){
            const component = Matic.getVariable(dependency);
            unsubscribers.update(_ => {
                let initial = true;
                const $unsubscribers = [];
                $unsubscribers.push(component.subscribe($component => {
                    if (!initial) prepareListenersForDependencies();
                    initial = false;
                }))
                return $unsubscribers;
            })
        }
        $globalDependencies = dependencies;
    }

    function getDependencies(){
        const presentedId = get(Matic.getVariable("presentedComponent"))
        if (presentedId === undefined) return []
        
        const dependencies = new Set([]);

        function getComponentDependencies(id){
            const component = get(Matic.getVariable(id));
            if (component === undefined) return;
            if (!dependencies.has(id)) {
                dependencies.add(id);

                if (component?.type == "tree") {
                    for (const slot of component.children){
                        for (const { id } of slot){
                            getComponentDependencies(id);
                        }
                    }
                }
                
            }
        }
        getComponentDependencies(presentedId);
        return Array.from(dependencies);
    }
</script>
{$isReady}
{#if $isReady}
    <PositionalWrapper> 
        {#each $loadedPlugins ?? [] as plugin}
            <svelte:component this={Preloader[plugin]} />
        {/each}
    </PositionalWrapper>
{/if}