'use client'

import {createBetterTxFactory} from "@/configs/networkConfig";

export const lotteryDrawTx = createBetterTxFactory<{
    poolID: string,
    time: string
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: networkVariables.Package,
        module: "lucky",
        function: "lottery_draw",
        arguments: [
            tx.object(params.poolID),
            tx.pure.string(params.time),
            tx.object("0x8")
        ]
    });
    return tx;
})