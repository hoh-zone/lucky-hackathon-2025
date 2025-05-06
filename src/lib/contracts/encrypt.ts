'use client'

import {FieldType} from "@/lib/contracts/getPoolInfo";
import {network, networkConfig, sealClient} from "@/configs/networkConfig";

export default async function encrypt(id: string, fields: FieldType[], values: string[]) {
    const encryptedValues: string[] = [];
    for (let i = 0; i < fields.length; i++) {
        const needEncryption = fields[i].needEncryption;
        const value = values[i];
        if (!needEncryption) {
            encryptedValues.push(value);
            continue;
        }
        const {encryptedObject: data} = await sealClient.encrypt({
            threshold: 2,
            packageId: networkConfig[network].variables.Package,
            id,
            data: new TextEncoder().encode(value)
        });
        encryptedValues.push(data.toString());
    }
    return encryptedValues;
}