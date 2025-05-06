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
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ChangeEvent, useState} from "react";
import {applyTx, encrypt, FieldType} from "@/lib/contracts";
import {AppDispatch, useAppSelector} from "@/store";
import {getPasskeyKeypair, suiClient} from "@/configs/networkConfig";
import {refreshPoolInfos, setProgressValue} from "@/store/modules/info";
import {useDispatch} from "react-redux";
import {randomTwentyFive} from "@/lib/utils";

export default function Apply({name, objectID, fields}: {name: string, objectID: string, fields: FieldType[]}) {
    const account = useAppSelector(state => state.info.address);
    const publicKeyStr = useAppSelector(state => state.info.publicKeyStr);
    const dispatch = useDispatch<AppDispatch>();
    const [contents, setContents] = useState<{
        [key: string]: string
    }>({});
    const [error, setError] = useState<boolean>(false);
    const handleChangeInput = (e: ChangeEvent<HTMLInputElement>, index: number) => {
        setError(!e.target.value);
        setContents({
            ...contents,
            [fields[index].fieldName]: e.target.value
        });
    }

    const checkEmpty = () => {
        for (const field of fields)
            if (!contents[field.fieldName])
                return false;
        return true;
    }
    const handleApply = async () => {
        if (!account)
            return;
        if (!checkEmpty()) {
            setError(true);
            return;
        }
        dispatch(setProgressValue(0));
        try {
            const tx = applyTx({
                poolID: objectID,
                addrAndTime: account + (new Date().getTime().toString()),
                keys: fields.map(field => field.fieldName),
                values: await encrypt(objectID, fields, fields.map(field => contents[field.fieldName]))
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
                <Button variant="outline" className="cursor-pointer">Apply to join</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Apply to join</DialogTitle>
                    <DialogDescription>
                        The information marked with * will be encrypted.<br/>
                        Fill in the relevant fields to apply for the lucky draw.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-5 items-center">
                    <div className="flex flex-col gap-2 items-start">
                        <Label>Name</Label>
                        <Input size={36} value={name} disabled />
                    </div>
                    <div className="flex flex-col gap-2 items-start">
                        <Label>ObjectID</Label>
                        <Input size={36} value={objectID} disabled />
                    </div>
                    {
                        fields.map((field, index) => {
                            return (
                                <div className="flex flex-col gap-2 items-start" key={index}>
                                    <Label>{(field.needEncryption ? "*" : "") + field.fieldName}</Label>
                                    <Input size={36} placeholder={field.fieldName} onChange={e => handleChangeInput(e, index)} />
                                </div>
                            );
                        })
                    }
                    {
                        fields.length === 0 &&
                        <span className="w-76 text-xs text-[#afb3b5]">No additional information required.</span>
                    }
                </div>
                <DialogFooter className="flex gap-3 items-center">
                    {
                        error && <span className="text-xs text-red-600">Cannot be any empty fields</span>
                    }
                    <Button variant="default" className="cursor-pointer" onClick={handleApply}>Apply</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}