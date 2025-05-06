'use client'

import {createBetterTxFactory} from "@/configs/networkConfig";

export const confirmListTx = createBetterTxFactory<{
    poolID: string
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: networkVariables.Package,
        module: "lucky",
        function: "confirm",
        arguments: [
            tx.object(params.poolID)
        ]
    });
    return tx;
})