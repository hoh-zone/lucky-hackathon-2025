'use client'

import {FieldType} from "@/lib/contracts/getPoolInfo";
import {getSessionKey, network, networkConfig, sealClient, suiClient} from "@/configs/networkConfig";
import {Transaction} from "@mysten/sui/transactions";
import {fromHex} from "@mysten/bcs";

export function isNeedEncryption(fields: FieldType[]) {
    for (const field of fields)
        if (field.needEncryption)
            return true;
    return false;
}

export default async function decrypt(publicKeyStr: string, id: string, fields: FieldType[], values: string[]) {
    if (!isNeedEncryption(fields))
        return values;

    const sessionKey = await getSessionKey(window.location.hostname, publicKeyStr);

    // call `fetchKeys` here first if multiple keys are needed, but now we don't need `fetchKeys`

    const decryptedValues: string[] = [];
    for (let i = 0; i < fields.length; i++) {
        const needEncryption = fields[i].needEncryption;
        const value = values[i];
        if (!needEncryption) {
            decryptedValues.push(value);
            continue;
        }
        const tx = new Transaction();
        tx.moveCall({
            package: networkConfig[network].variables.Package,
            module: "lucky",
            function: "seal_approve",
            arguments: [
                tx.pure.vector('u8', fromHex(id)),
                tx.object(id)
            ]
        });
        const txBytes = await tx.build({
            client: suiClient,
            onlyTransactionKind: true
        });
        const decryptedBytes = await sealClient.decrypt({
            data: new Uint8Array(value.split(',').map(item => Number(item))),
            sessionKey,
            txBytes
        });
        decryptedValues.push(new TextDecoder().decode(decryptedBytes));
    }
    return decryptedValues;
}