'use client'

import {Button} from "@/components/ui/button";
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
import {timeExchange} from "@/lib/utils";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useEffect, useState} from "react";
import {useAppSelector} from "@/store";

export default function InfoDetail({objectID, fields, application, isOdd, changeApproveList, changeRejectList, isAdmin}: {
    objectID: string,
    fields: FieldType[],
    application: FieldInfoType,
    isOdd: boolean,
    changeApproveList: (key: string, isAdd: boolean) => void,
    changeRejectList: (key: string, isAdd: boolean) => void,
    isAdmin: boolean,
}) {
    const publicKeyStr = useAppSelector(state => state.info.publicKeyStr);
    // const dispatch = useDispatch<AppDispatch>();
    const [needEncryption, setNeedEncryption] = useState<boolean>(false);
    const [values, setValues] = useState<string[]>([]);
    const [decrypted, setDecrypted] = useState<boolean>(false);
    const [approved, setApproved] = useState<boolean>(false);
    const [rejected, setRejected] = useState<boolean>(false);

    useEffect(() => {
        setNeedEncryption(isNeedEncryption(fields));
        setValues(fields.map(field => {
            const fieldName = field.fieldName;
            const index = application.keys.findIndex(key => key === fieldName);
            return application.values[index];
        }));
        setDecrypted(false);
    }, [fields, application]);

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

    const handleApprove = () => {
        if (rejected)
            return;
        changeApproveList(application.sender + application.index, !approved);
        setApproved(!approved);
    }

    const handleReject = () => {
        if (approved)
            return;
        changeRejectList(application.sender + application.index, !rejected);
        setRejected(!rejected);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex flex-col items-start">
                    <div className="flex gap-3 items-center text-xs text-[#afb3b5]">
                        <span><b>Apply Time: </b>{timeExchange(application.index)}</span>
                        <span><b>Sender: </b>{application.sender.slice(0, 6) + "..." + application.sender.slice(-4)}</span>
                    </div>
                    <div className={"flex gap-3 items-center w-96 overflow-x-scroll text-nowrap border border-[#041f4b] rounded-3xl px-2 py-1 cursor-pointer " +
                            (!isOdd ? "hover:border-[#196ae3] " : "hover:border-[#35a1f7] ") +
                            (approved ? "bg-green-600" : (rejected ? "bg-red-600" : (!isOdd ? "bg-[#fff]" : "bg-[#f9f9f9]")))}>
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
                    <DialogTitle>Application</DialogTitle>
                    <DialogDescription>
                        Application details.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-5 items-center">
                    <div className="flex flex-col gap-2 items-start">
                        <Label>Apply Time</Label>
                        <Input size={36} value={timeExchange(application.index)} disabled/>
                    </div>
                    <div className="flex flex-col gap-2 items-start">
                        <Label>Sender</Label>
                        <Input size={36} value={application.sender} disabled/>
                    </div>
                    {
                        fields.map((field, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-2 items-start">
                                    <Label>{field.fieldName}</Label>
                                    <Input size={36}
                                           value={field.needEncryption && !decrypted ? "******" : values[index]}
                                           disabled/>
                                </div>
                            )
                        })
                    }
                </div>
                <DialogFooter className="flex gap-3 items-center">
                    {
                        (approved || rejected) &&
                        <span className="text-xs text-green-600 text-center">Back To Confirm</span>
                    }
                    {
                        isAdmin && needEncryption &&
                        <Button variant="default" className="cursor-pointer" disabled={!needEncryption || decrypted}
                                onClick={handleDecrypt}>Decrypt</Button>
                    }
                    {
                        isAdmin &&
                        <>
                            <Button variant="default" className="w-[5.455rem] cursor-pointer" disabled={rejected}
                                    onClick={handleApprove}>{approved ? "Cancel" : "Approve"}</Button>
                            <Button variant="default" className="w-[4.83rem] cursor-pointer" disabled={approved}
                                    onClick={handleReject}>{rejected ? "Cancel" : "Reject"}</Button>
                        </>
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}