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
import {decrypt, encrypt, FieldInfoType, FieldType, isNeedEncryption} from "@/lib/contracts";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {ChangeEvent, useEffect, useState} from "react";
import {useAppSelector} from "@/store";

export default function ParticipantsInfoDetail({objectID, fields, participant, isOdd, isAdmin, editParentList}: {
    objectID: string,
    fields: FieldType[],
    participant: FieldInfoType,
    isOdd: boolean,
    isAdmin: boolean,
    editParentList: (index: number, keys: string[], values: string[], isAdd: boolean) => void
}) {
    const publicKeyStr = useAppSelector(state => state.info.publicKeyStr);
    // const dispatch = useDispatch<AppDispatch>();
    const [needEncryption, setNeedEncryption] = useState<boolean>(false);
    const [values, setValues] = useState<string[]>([]);
    const [decrypted, setDecrypted] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [confirmedEdit, setConfirmedEdit] = useState<boolean>(false);
    const [editContents, setEditContents] = useState<{
        [key: string]: string
    }>({});

    useEffect(() => {
        setNeedEncryption(isNeedEncryption(fields));
        const editContents: {
            [key: string]: string
        } = {};
        setValues(fields.map(field => {
            const fieldName = field.fieldName;
            const index = participant.keys.findIndex(key => key === fieldName);
            editContents[fieldName] = field.needEncryption ? "******" : participant.values[index];
            return participant.values[index];
        }));
        setEditContents(editContents);
        setDecrypted(false);
        setIsEditing(false);
        setConfirmedEdit(false);
    }, [fields, participant]);

    const handleDecrypt = async () => {
        // dispatch(setProgressValue(25 + randomTwentyFive()));
        try {
            const decryptedValues = await decrypt(publicKeyStr, objectID, fields, values);
            // dispatch(setProgressValue(100));
            const editContents: {
                [key: string]: string
            } = {};
            fields.forEach((field, index) => {
                const fieldName = field.fieldName;
                editContents[fieldName] = decryptedValues[index];
            });
            setEditContents(editContents);
            setValues(decryptedValues);
            setDecrypted(true);
        } catch (e) {
            console.error(e);
            // dispatch(setProgressValue(100));
        }
    }

    const handleEditInput = (e: ChangeEvent<HTMLInputElement>, key: string) => {
        setEditContents({
            ...editContents,
            [key]: e.target.value
        });
    }

    const splitEditContents = async (): Promise<[string[], string[]]> => {
        const newFields: FieldType[] = [];
        const newValues: string[] = [];
        fields.forEach((field, index) => {
            const value = values[index] !== editContents[field.fieldName] && editContents[field.fieldName].length > 0 ? editContents[field.fieldName] : values[index];
            newFields.push(field);
            newValues.push(value);
        });
        return [
            newFields.map(field => field.fieldName),
            await encrypt(objectID, newFields, newValues)
        ];
    }

    const handleClickCancel = async () => {
        if (confirmedEdit) {
            const [keys, values] = await splitEditContents();
            editParentList(participant.index, keys, values, false);
            setConfirmedEdit(false);
            return;
        }
        setIsEditing(false);
    }

    const handleClickEdit = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }
        const [keys, values] = await splitEditContents();
        editParentList(participant.index, keys, values, true);
        const timer = setTimeout(() => {
            setConfirmedEdit(true);
            clearTimeout(timer);
        }, 100);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex flex-col items-start">
                    <b className="text-xs text-[#afb3b5]">No.{participant.index}</b>
                    <div className={"flex gap-3 items-center w-96 overflow-x-scroll text-nowrap border border-[#041f4b] rounded-3xl px-2 py-1 cursor-pointer " +
                        (!isOdd ? "hover:border-[#196ae3] " : "hover:border-[#35a1f7] ") + (confirmedEdit ? "bg-green-600" : (!isOdd ? "bg-[#fff]" : "bg-[#f9f9f9]"))}>
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
                    <DialogTitle>Participant</DialogTitle>
                    <DialogDescription>
                        Participant details.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-5 items-center">
                    <div className="flex flex-col gap-2 items-start">
                        <Label>Serial Number</Label>
                        <Input size={36} value={`No.${participant.index}`} disabled/>
                    </div>
                    {
                        fields.map((field, index) => {
                            return (
                                <div key={index} className="flex flex-col gap-2 items-start">
                                    <Label>{field.fieldName}</Label>
                                    <Input size={36}
                                           value={!isEditing ? (field.needEncryption && !decrypted ? "******" : values[index]) : editContents[field.fieldName]}
                                           onChange={e => handleEditInput(e, field.fieldName)}
                                           disabled={!isEditing || confirmedEdit}/>
                                </div>
                            )
                        })
                    }
                </div>
                <DialogFooter className="flex gap-3 items-center">
                    {
                        confirmedEdit &&
                        <span className="text-xs text-green-600">Back to confirm finally</span>
                    }
                    {
                        isEditing &&
                        <Button variant="default" className="cursor-pointer" onClick={handleClickCancel}>Cancel</Button>
                    }
                    {
                        isAdmin &&
                        <Button variant="default" className="cursor-pointer" onClick={handleClickEdit} disabled={!decrypted && needEncryption || confirmedEdit || fields.length === 0}>{!isEditing ? "Edit" : (!confirmedEdit ? "Save" : "Confirmed")}</Button>
                    }
                    {
                        isAdmin && needEncryption &&
                        <Button variant="default" className="cursor-pointer" disabled={!needEncryption || decrypted || isEditing}
                                onClick={handleDecrypt}>Decrypt</Button>
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}