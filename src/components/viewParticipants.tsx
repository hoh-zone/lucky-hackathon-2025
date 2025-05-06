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
import {confirmListTx, editInfoTx, FieldInfoType, FieldType, lotteryDrawTx} from "@/lib/contracts";
import {AppDispatch, useAppSelector} from "@/store";
import {useCallback, useEffect, useState} from "react";
import {ParticipantsInfoDetail} from "@/components/index";
import {Transaction} from "@mysten/sui/transactions";
import {getPasskeyKeypair, suiClient} from "@/configs/networkConfig";
import {useDispatch} from "react-redux";
import {refreshPoolInfos, setNavTab, setProgressValue} from "@/store/modules/info";
import {randomTwentyFive} from "@/lib/utils";

export default function ViewParticipants({name, objectID, fields, participants, administrators, hasConfirmed, minimumParticipants}: {
    name: string,
    objectID: string,
    fields: FieldType[],
    participants: FieldInfoType[],
    administrators: string[],
    hasConfirmed: string[]
    minimumParticipants: number
}) {
    const account = useAppSelector(state => state.info.address);
    const publicKeyStr = useAppSelector(state => state.info.publicKeyStr);
    const dispatch = useDispatch<AppDispatch>();
    const [open, setOpen] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [editContentsList, setEditContentsList] = useState<{
        indexList: number[],
        keysList: string[][],
        valuesList: string[][]
    }>({
        indexList: [],
        keysList: [],
        valuesList: []
    });
    const [confirmListNow, setConfirmListNow] = useState<boolean>(false);
    const [canDraw, setCanDraw] = useState<boolean>(false);

    const init = useCallback(() => {
        setIsAdmin(administrators.includes(account));
        setEditContentsList({
            indexList: [],
            keysList: [],
            valuesList: []
        });
        setConfirmListNow(false);
        setCanDraw(hasConfirmed.length >= Math.floor((administrators.length + 1) / 2));
    }, [account, administrators, hasConfirmed]);

    useEffect(() => {
        init()
    }, [init]);

    const editList = (index: number, keys: string[], values: string[], isAdd: boolean) => {
        if (isAdd) {
            setEditContentsList({
                indexList: editContentsList.indexList.concat([index]),
                keysList: editContentsList.keysList.concat([keys]),
                valuesList: editContentsList.valuesList.concat([values])
            });
        } else {
            const idx = editContentsList.indexList.findIndex(item => item === index);
            setEditContentsList({
                indexList: editContentsList.indexList.filter((_, index) => idx !== index),
                keysList: editContentsList.keysList.filter((_, index) => idx !== index),
                valuesList: editContentsList.valuesList.filter((_, index) => idx !== index)
            });
        }
    }

    const handleEdit = async () => {
        dispatch(setProgressValue(0));
        try {
            const tx = new Transaction();
            for (let i = 0; i < editContentsList.indexList.length; i++) {
                const index = editContentsList.indexList[i];
                const keys = editContentsList.keysList[i];
                const values = editContentsList.valuesList[i];
                editInfoTx(tx, objectID, index, keys, values);
            }
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
                    setOpen(false);
                    clearInterval(intervalTimer);
                }
            }, 1000);
        } catch (e) {
            console.error(e);
            dispatch(setProgressValue(100));
        }
    }

    const handleConfirmList = async () => {
        dispatch(setProgressValue(0));
        try {
            const tx = confirmListTx({
                poolID: objectID
            });
            const keypair = getPasskeyKeypair(window.location.hostname, publicKeyStr)
            const res = await suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair
            });
            dispatch(setProgressValue(50 + randomTwentyFive()));
            await suiClient.waitForTransaction({
                digest: res.digest
            });
            dispatch(setProgressValue(100));
            setConfirmListNow(true);
            setCanDraw(hasConfirmed.length + 1 >= Math.floor((administrators.length + 1) / 2));
        } catch (e) {
            console.error(e);
            dispatch(setProgressValue(100));
        }
    }

    const handleDraw = async () => {
        dispatch(setProgressValue(0));
        try {
            const tx = lotteryDrawTx({
                poolID: objectID,
                time: new Date().getTime().toString()
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
                    dispatch(setNavTab("Ended"));
                    setOpen(false);
                    clearInterval(intervalTimer);
                }
            }, 1000);
        } catch (e) {
            console.error(e);
            dispatch(setProgressValue(100));
        }
    }

    const handleOpenChange = () => {
        if (!open) {
            setOpen(true);
            return;
        }
        init();
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer">View Participants</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[45rem] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>{`${name}'s participants`}</DialogTitle>
                    <DialogDescription>
                        {`PoolObjectID: ${objectID.slice(0, 6) + "..." + objectID.slice(-4)}`}<br/>
                        You can view all participants and administrators can operate it.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea>
                    <div className="flex flex-col gap-5 items-center">
                        {
                            participants.map((participant, index) => {
                                return (
                                    <div key={index}>
                                        <ParticipantsInfoDetail
                                            objectID={objectID}
                                            fields={fields}
                                            participant={participant}
                                            isOdd={index % 2 === 1}
                                            isAdmin={isAdmin}
                                            editParentList={editList}
                                        ></ParticipantsInfoDetail>
                                    </div>
                                )
                            })
                        }
                    </div>
                </ScrollArea>
                <DialogFooter className="flex gap-3 items-center">
                    {
                        editContentsList.indexList.length > 0 &&
                        <Button variant="default" className="cursor-pointer" onClick={handleEdit}>Confirm Edit</Button>
                    }
                    {
                        isAdmin &&
                        <>
                            <Button variant="default" className="cursor-pointer" onClick={handleConfirmList}
                                    disabled={confirmListNow || hasConfirmed.includes(account) || participants.length === 0 || participants.length < minimumParticipants}>
                                Confirm List
                                <span className="text-xs text-[#afb3b5]">({hasConfirmed.length + (confirmListNow ? 1 : 0)} / {administrators.length})</span>
                            </Button>
                            <Button variant="default" className="cursor-pointer" onClick={handleDraw} disabled={!canDraw}>Lottery Draw</Button>
                        </>
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}