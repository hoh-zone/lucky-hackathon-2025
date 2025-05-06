'use client'

import {createBetterTxFactory} from "@/configs/networkConfig";

export const editApplicationTx = createBetterTxFactory<{
    poolID: string,
    approveList: string[],
    rejectList: string[]
}>((tx, networkVariables, params) => {
    if (params.approveList.length > 0) {
        tx.moveCall({
            package: networkVariables.Package,
            module: "lucky",
            function: "edit_application",
            arguments: [
                tx.object(params.poolID),
                tx.pure.vector('string', params.approveList),
                tx.pure.bool(true)
            ]
        });
    }
    if (params.rejectList.length > 0) {
        tx.moveCall({
            package: networkVariables.Package,
            module: "lucky",
            function: "edit_application",
            arguments: [
                tx.object(params.poolID),
                tx.pure.vector('string', params.rejectList),
                tx.pure.bool(false)
            ]
        });
    }
    return tx;
})