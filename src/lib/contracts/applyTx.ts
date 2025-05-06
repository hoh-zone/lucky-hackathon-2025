'use client'

import {createBetterTxFactory} from "@/configs/networkConfig";

export const applyTx = createBetterTxFactory<{
    poolID: string,
    addrAndTime: string,
    keys: string[],
    values: string[]
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: networkVariables.Package,
        module: "lucky",
        function: "apply",
        arguments: [
            tx.object(params.poolID),
            tx.pure.string(params.addrAndTime),
            tx.pure.vector('string', params.keys),
            tx.pure.vector('string', params.values),
        ]
    });
    return tx;
})