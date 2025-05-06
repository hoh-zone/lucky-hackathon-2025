'use client'

import {Transaction} from "@mysten/sui/transactions";
import {network, networkConfig} from "@/configs/networkConfig";

export default function editInfoTx(tx: Transaction, poolID: string, index: number, keys: string[], values: string[]) {
    tx.moveCall({
        package: networkConfig[network].variables.Package,
        module: "lucky",
        function: "edit_info",
        arguments: [
            tx.object(poolID),
            tx.pure.u64(index),
            tx.pure.vector('string', keys),
            tx.pure.vector('string', values)
        ]
    });
}