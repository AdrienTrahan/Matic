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
                    id: "PR-0",
                    inhouse: true,
                    children: [],
                },
            ],
        ],
        slots: ["children"],
    }
}
