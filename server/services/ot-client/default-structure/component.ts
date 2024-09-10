/** @format */

import { ComponentTypes } from "../../../../shared/sharedb"

/** @format */
export function getDefaultComponentStructure(componentId: string) {
    return {
        id: componentId,
        type: ComponentTypes.TREE,
        tree: [
            [
                {
                    id: "IH_0",
                    name: "Frame",
                    children: [],
                },
                {
                    id: "IH_0",
                    name: "Frame",
                    children: [],
                },
            ],
        ],
        slots: ["children"],
    }
}
