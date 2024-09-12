/** @format */

import type { File } from "$lib/components/utils/bundler"

export function getResizeHandlerComponent(): File {
    return {
        name: "resize-handler",
        type: "svelte",
        source: `
            <script>
                let top = 0;
                let left = 0;
                let display = "none";
                window.addEventListener("message", ({data: messageData}) => {
                    const { action, data, functional } = messageData;
                    if (functional && action == "resize") onResize(data.anchorBox);
                })	
                function onResize(anchorBox){
                    const anchors = document.getElementsByClassName("anchor");
                    for (const anchor of anchors){
                        top = anchorBox.top;
                        left = anchorBox.left;
                        display = "unset";
                    }
                }
            </script>
            <div class="anchor" style="position:fixed;left:{left}px;top:{top}px;display:{display};">
                <slot />
            </div>`,
    }
}
