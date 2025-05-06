'use client'

import {createBetterTxFactory} from "@/configs/networkConfig";

export const changeAdminsTx = createBetterTxFactory<{
    poolID: string,
    pendingAddList: string[],
    pendingRemoveList: string[]
}>((tx, networkVariables, params) => {
    if (params.pendingAddList.length > 0) {
        tx.moveCall({
            package: networkVariables.Package,
            module: "lucky",
            function: "add_admin",
            arguments: [
                tx.object(params.poolID),
                tx.pure.vector('address', params.pendingAddList)
            ]
        });
    }
    if (params.pendingRemoveList.length > 0) {
        tx.moveCall({
            package: networkVariables.Package,
            module: "lucky",
            function: "remove_admin",
            arguments: [
                tx.object(params.poolID),
                tx.pure.vector('address', params.pendingRemoveList)
            ]
        });
    }
    return tx;
})