'use client'

import {suiClient} from "@/configs/networkConfig";

export default async function getBalance(owner: string) {
    if (!owner)
        return "0";
    return (Number((await suiClient.getBalance({
        owner
    })).totalBalance) / 1000000000).toFixed(2);
}