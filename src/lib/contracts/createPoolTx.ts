'use client'

import {createBetterTxFactory} from "@/configs/networkConfig";

export const createPoolTx = createBetterTxFactory<{
    name: string,
    description: string,
    creationTime: string,
    minimumParticipants: number,
    numberOfWinners: number,
    allowsMultipleAwards: boolean,
    fields: string[],
    encryption: boolean[],
    sender: string
}>((tx, networkVariables, params) => {
    const [pool] = tx.moveCall({
        package: networkVariables.Package,
        module: "lucky",
        function: "create_pool",
        arguments: [
            tx.pure.string(params.name),
            tx.pure.string(params.description),
            tx.pure.string(params.creationTime),
            tx.pure.u64(params.minimumParticipants),
            tx.pure.u64(params.numberOfWinners),
            tx.pure.bool(params.allowsMultipleAwards)
        ]
    });
    tx.moveCall({
        package: networkVariables.Package,
        module: "lucky",
        function: "edit_fields",
        arguments: [
            pool,
            tx.pure.vector("string", params.fields),
            tx.pure.vector("bool", params.encryption)
        ]
    });
    return tx;
});