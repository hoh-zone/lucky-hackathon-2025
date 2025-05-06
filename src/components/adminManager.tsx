'use client'

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Copy} from "lucide-react";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {changeAdminsTx} from "@/lib/contracts";
import {getPasskeyKeypair, suiClient} from "@/configs/networkConfig";
import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {refreshPoolInfos, setProgressValue} from "@/store/modules/info";
import {randomTwentyFive} from "@/lib/utils";

export default function AdminManager({objectID, admins, setParentOpen}: {objectID: string, admins: string[], setParentOpen: Dispatch<SetStateAction<boolean>>}) {
    const publicKeyStr = useAppSelector(state => state.info.publicKeyStr);
    const dispatch = useDispatch<AppDispatch>();
    const [pendingAddStr, setPendingAddStr] = useState<string>("");
    const [pendingRemoveStr, setPendingRemoveStr] = useState<string>("");
    const [error, setError] = useState("");
    useEffect(() => {
        setPendingAddStr("");
        setPendingRemoveStr("");
    }, [objectID, admins]);

    const checkValidAddresses = (str: string) => {
        str.split(" ").map(str => {
            if (str.length > 0 && str.length !== 66) {
                setError("The length of an address is incorrect");
                return false;
            }
        });
        return true;
    }

    const getValidAddresses = (str: string) => {
        return Array.from(new Set(str.split(" ").filter(str => str.length > 0)));
    }

    const checkAtLeastOneLeft = () => {
        const temp = admins.concat(getValidAddresses(pendingAddStr).filter(address => !admins.includes(address)));
        const pendingRemoveList = getValidAddresses(pendingRemoveStr);
        const final = temp.filter(address => !pendingRemoveList.includes(address));
        if (final.length === 0) {
            setError("Eventually at least one administrator will need to remain");
            return false;
        }
        const diffAddresses = final.filter(address => !admins.includes(address));
        if (final.length === admins.length && diffAddresses.length === 0) {
            setError("The result should be different from the initial one");
            return false;
        }
        return true;
    }

    const handleConfirm = async () => {
        if (!checkValidAddresses(pendingAddStr) || !checkValidAddresses(pendingRemoveStr) || !checkAtLeastOneLeft())
            return;
        dispatch(setProgressValue(0));
        try {
            const tx = changeAdminsTx({
                poolID: objectID,
                pendingAddList: getValidAddresses(pendingAddStr),
                pendingRemoveList: getValidAddresses(pendingRemoveStr),
            });
            const keypair = getPasskeyKeypair(window.location.hostname, publicKeyStr)
            const res = await suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair
            });
            dispatch(setProgressValue(randomTwentyFive()));
            await suiClient.waitForTransaction({
                digest: res.digest
            });
            dispatch(refreshPoolInfos());
            let basicValue = 25;
            const intervalTimer = setInterval(() => {
                const targetValue = basicValue === 75 ? 100 : basicValue + randomTwentyFive();
                basicValue += 25;
                dispatch(setProgressValue(targetValue));
                if (targetValue >= 100) {
                    setParentOpen(false);
                    clearInterval(intervalTimer);
                }
            }, 1000);
        } catch (e) {
            console.error(e);
            dispatch(setProgressValue(100));
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" className="w-16 cursor-pointer">Admin</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[45rem] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>Admin Manager</DialogTitle>
                    <DialogDescription>
                        <b>Adding</b> or <b>Removing</b> administrators can be done at the <b>same time</b>.<br/>
                        When operating multiple addresses at the same time, please separate them with <b>Space</b>.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea>
                    <div className="flex flex-col gap-5 items-center">
                        {
                            admins.map(admin => {
                                return (
                                    <div key={admin} className="flex items-center w-76">
                                        <Label className="flex-1">{admin.slice(0, 15) + "......" + admin.slice(-15)}</Label>
                                        <Copy size={16} className="cursor-pointer active:text-[#196ae3]"
                                              onClick={() => navigator.clipboard.writeText(admin)}/>
                                    </div>
                                );
                            })
                        }
                        <div className="flex flex-col gap-2 items-start w-76">
                            <Label>Add Administrators</Label>
                            <Input size={36} placeholder="Separate addresses with Space" value={pendingAddStr} onChange={e => {
                                setError("");
                                setPendingAddStr(e.target.value);
                            }} />
                        </div>
                        <div className="flex flex-col gap-2 items-start w-76">
                            <Label>Remove Administrators</Label>
                            <Input size={36} placeholder="Separate addresses with Space" value={pendingRemoveStr} onChange={e => {
                                setError("");
                                setPendingRemoveStr(e.target.value);
                            }} />
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter className="flex gap-3 items-center">
                    {
                        error &&
                        <Label className="text-xs text-red-600 text-center">{error}</Label>
                    }
                    <Button variant="default" className="cursor-pointer" disabled={!pendingAddStr && !pendingRemoveStr || error.length > 0} onClick={handleConfirm}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}