'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {decrypt, FieldInfoType, FieldType, isNeedEncryption} from "@/lib/contracts";
import {useAppSelector} from "@/store";
import {useEffect, useState} from "react";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

export default function WinnerInfoDetail({objectID, fields, winner, isOdd, isAdmin}: {
    objectID: string,
    fields: FieldType[],
    winner: FieldInfoType,
    isOdd: boolean,
    isAdmin: boolean
}) {
    const publicKeyStr = useAppSelector(state => state.info.publicKeyStr);
    // const dispatch = useDispatch<AppDispatch>();
    const [needEncryption, setNeedEncryption] = useState<boolean>(false);
    const [values, setValues] = useState<string[]>([]);
    const [decrypted, setDecrypted] = useState<boolean>(false);

    useEffect(() => {
        setNeedEncryption(isNeedEncryption(fields));
        setValues(fields.map(field => {
            const fieldName = field.fieldName;
            const index = winner.keys.findIndex(key => key === fieldName);
            return winner.values[index];
        }));
        setDecrypted(false);
    }, [fields, winner]);

    const handleDecrypt = async () => {
        // dispatch(setProgressValue(25 + randomTwentyFive()));
        try {
            const decryptedValues = await decrypt(publicKeyStr, objectID, fields, values);
            // dispatch(setProgressValue(100));
            setValues(decryptedValues);
            setDecrypted(true);
        } catch (e) {
            console.error(e);
            // dispatch(setProgressValue(100));
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex flex-col items-start">
                    <b className="text-xs text-[#afb3b5]">No.{winner.index}</b>
                    <div className={"flex gap-3 items-center w-96 overflow-x-scroll text-nowrap border border-[#041f4b] rounded-3xl px-2 py-1 cursor-pointer " +
                        (!isOdd ? "bg-[#fff] hover:border-[#196ae3] " : "bg-[#f9f9f9] hover:border-[#35a1f7] ")}>
                        {
                            fields.map((field, index) => {
                                return (
                                    <span key={index}>
                                    <b>{`${field.fieldName}: `}</b>
                                        {field.needEncryption ? "******" : values[index]}
                                </span>
                                )
                            })
                        }
                        {
                            fields.length === 0 &&
                            <span>No additional information.</span>
                        }
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-h-[45rem] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>Winners</DialogTitle>
                    <DialogDescription>
                        Congratulations!!!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-5 items-center">
                    <div className="flex flex-col gap-2 items-start">
                        <Label>Serial Number</Label>
                        <Input size={36} value={`No.${winner.index}`} disabled/>
                    </div>
                    {
                        fields.map((field, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-2 items-start">
                                    <Label>{field.fieldName}</Label>
                                    <Input size={36}
                                           value={field.needEncryption && !decrypted ? "******" : values[index]}
                                           disabled />
                                </div>
                            )
                        })
                    }
                </div>
                <DialogFooter>
                    {
                        isAdmin && needEncryption &&
                        <Button variant="default" className="cursor-pointer" disabled={!needEncryption || decrypted}
                                onClick={handleDecrypt}>Decrypt</Button>
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}