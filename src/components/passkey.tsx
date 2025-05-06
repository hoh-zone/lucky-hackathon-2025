'use client'

import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger,} from "@/components/ui/hover-card"
import {findCommonPublicKey, PasskeyKeypair} from "@mysten/sui/keypairs/passkey";
import {getPasskeyProvider} from "@/configs/networkConfig";
import {useAppSelector, AppDispatch} from "@/store";
import {useDispatch} from "react-redux";
import {refreshAll, refreshBalance, setAddress, setProgressValue} from "@/store/modules/info";
import {Copy} from "lucide-react";
import {randomTwentyFive} from "@/lib/utils";

export default function PassKey() {
    const address = useAppSelector(state => state.info.address);
    const balance = useAppSelector(state => state.info.balance);
    const dispatch = useDispatch<AppDispatch>();

    const handleCreateWallet = async () => {
        dispatch(setProgressValue(25 + randomTwentyFive()));
        try {
            const passkeyProvider = getPasskeyProvider(window.location.hostname);
            const passkey = await PasskeyKeypair.getPasskeyInstance(passkeyProvider);
            dispatch(setProgressValue(100));
            dispatch(setAddress(passkey.toSuiAddress()));
            localStorage.setItem("PublicKey", passkey.getPublicKey().toRawBytes().toString());
            dispatch(refreshAll(passkey.getPublicKey().toRawBytes().toString()));
        } catch (err) {
            console.error(err);
            dispatch(setProgressValue(100));
        }
    }

    const handleLoadWallet = async () => {
        dispatch(setProgressValue(25 + randomTwentyFive()));
        try {
            const passkeyProvider = getPasskeyProvider(window.location.hostname);

            const testMessage = new TextEncoder().encode("Hello Luckcky!");
            const possiblePks = await PasskeyKeypair.signAndRecover(
                passkeyProvider,
                testMessage
            );
            dispatch(setProgressValue(50 + randomTwentyFive()));

            const testMessage2 = new TextEncoder().encode("Hello Luckcky Sui!");
            const possiblePks2 = await PasskeyKeypair.signAndRecover(
                passkeyProvider,
                testMessage2
            );
            dispatch(setProgressValue(100));

            const commonPk = findCommonPublicKey(possiblePks, possiblePks2);
            const passkey = new PasskeyKeypair(commonPk.toRawBytes(), passkeyProvider);
            dispatch(setAddress(passkey.toSuiAddress()));
            localStorage.setItem("PublicKey", passkey.getPublicKey().toRawBytes().toString());
            dispatch(refreshAll(passkey.getPublicKey().toRawBytes().toString()));
        } catch (e) {
            console.error(e);
            dispatch(setProgressValue(100));
        }
    }

    const openCard = (isOpen: boolean) => {
        if (isOpen)
            dispatch(refreshBalance(address));
    }

    return (
        <div className="flex gap-10 items-center">
            <HoverCard openDelay={100} onOpenChange={openCard}>
                <HoverCardTrigger>
                    <div className="flex gap-3 items-center">
                        <span>{address ? address.slice(0, 6) + "..." + address.slice(-4) : ""}</span>
                        {
                            address &&
                            <Copy size={16} className="cursor-pointer active:text-[#196ae3]"
                                  onClick={() => navigator.clipboard.writeText(address)}/>
                        }
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="flex flex-col gap-3 items-center w-36 bg-[#222] text-[#afb3b5] border-2 border-[#0a0e0f]">
                    <Button className="w-full bg-[#222]" disabled={true}>{`${balance} Sui`}</Button>
                    <Button className="w-full bg-[#222]">
                        <a href={`https://faucet.sui.io/?address=${address}`} target="_blank" rel="noopener noreferrer">Faucet</a>
                    </Button>
                </HoverCardContent>
            </HoverCard>
            <Button variant="ghost" className="cursor-pointer" onClick={handleCreateWallet}>Create Passkey
                Wallet</Button>
            <Button variant="ghost" className="cursor-pointer" onClick={handleLoadWallet}>Load Passkey Wallet</Button>
        </div>
    );
}