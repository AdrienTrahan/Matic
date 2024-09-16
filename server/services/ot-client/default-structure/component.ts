/** @format */

import { ComponentTypes } from "../../../../shared/sharedb"

/** @format */
export function getDefaultComponentStructure(componentId: string) {
    return {
        id: componentId,
        type: ComponentTypes.TREE,
        children: [
            [
                {
                    id: "IH_0",
                    name: "Frame",
                    children: [
                        [
                            {
                                id: "IH_0",
                                name: "Frame",
                                children: [],
                            },
                        ],
                    ],
                },
            ],
        ],
        plugins: ["BH_0"],
        slots: ["children"],
    }
}
