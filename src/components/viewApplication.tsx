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
import {editApplicationTx, FieldInfoType, FieldType} from "@/lib/contracts";
import {AdminManager, InfoDetail} from "@/components";
import {useCallback, useEffect, useState} from "react";
import {AppDispatch, useAppSelector} from "@/store";
import {getPasskeyKeypair, suiClient} from "@/configs/networkConfig";
import {refreshPoolInfos, setProgressValue} from "@/store/modules/info";
import {useDispatch} from "react-redux";
import {randomTwentyFive} from "@/lib/utils";

export default function ViewApplication({name, objectID, fields, applications, administrators}: {
    name: string,
    objectID: string,
    fields: FieldType[],
    applications: FieldInfoType[],
    administrators: string[]
}) {
    const account = useAppSelector(state => state.info.address);
    const publicKeyStr = useAppSelector(state => state.info.publicKeyStr);
    const dispatch = useDispatch<AppDispatch>();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [approveList, setApproveList] = useState<string[]>([]);
    const [rejectList, setRejectList] = useState<string[]>([]);

    useEffect(() => {
        setIsAdmin(administrators.includes(account));
    }, [account, administrators]);

    const clearList = useCallback(() => {
        setApproveList([]);
        setRejectList([]);
    }, [])
    useEffect(() => {
        clearList();
    }, [objectID, clearList]);

    const changeApproveList = (key: string, isAdd: boolean) => {
        if (isAdd) {
            setApproveList([
                ...approveList,
                key
            ]);
        } else {
            setApproveList(approveList.filter(item => item !== key));
        }
    }
    const changeRejectList = (key: string, isAdd: boolean) => {
        if (isAdd) {
            setRejectList([
                ...rejectList,
                key
            ]);
        } else {
            setRejectList(rejectList.filter(item => item !== key));
        }
    }

    const handleConfirm = async () => {
        dispatch(setProgressValue(0));
        try {
            const tx = editApplicationTx({
                poolID: objectID,
                approveList,
                rejectList
            });
            const keypair = getPasskeyKeypair(window.location.hostname, publicKeyStr);
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
                    setApproveList([]);
                    setRejectList([]);
                    setOpen(false);
                    clearInterval(intervalTimer);
                }
            }, 1000);
        } catch (e) {
            console.error(e);
            dispatch(setProgressValue(100));
        }
    }

    const getAllApplications = () => {
        return applications.map(application => application.sender + application.index);
    }

    const handleApproveAll = async () => {
        dispatch(setProgressValue(0));
        try {
            const tx = editApplicationTx({
                poolID: objectID,
                approveList: getAllApplications(),
                rejectList: []
            });
            const keypair = getPasskeyKeypair(window.location.hostname, publicKeyStr);
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

    const handleRejectAll = async () => {
        dispatch(setProgressValue(0));
        try {
            const tx = editApplicationTx({
                poolID: objectID,
                approveList: [],
                rejectList: getAllApplications()
            });
            const keypair = getPasskeyKeypair(window.location.hostname, publicKeyStr);
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

    const handleOpenChange = () => {
        if (!open) {
            setOpen(true);
            return;
        }
        clearList();
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer">View Application</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[45rem] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>{`${name}'s application`}</DialogTitle>
                    <DialogDescription>
                        {`PoolObjectID: ${objectID.slice(0, 6) + "..." + objectID.slice(-4)}`}<br/>
                        You can view all pending applications and administrators can operate it.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea>
                    <div className="flex flex-col gap-5 items-center">
                        {
                            applications.map((application, index) => {
                                return (
                                    <div key={index}>
                                        <InfoDetail
                                            objectID={objectID}
                                            fields={fields}
                                            application={application}
                                            isOdd={index % 2 === 1}
                                            changeApproveList={changeApproveList}
                                            changeRejectList={changeRejectList}
                                            isAdmin={isAdmin}
                                        ></InfoDetail>
                                    </div>
                                )
                            })
                        }
                    </div>
                </ScrollArea>
                <DialogFooter className="flex gap-2 items-center">
                    {
                        isAdmin &&
                        <>
                            <Button variant="default" className="cursor-pointer" disabled={approveList.length === 0 && rejectList.length === 0} onClick={handleConfirm}>Confirm Selection</Button>
                            <Button variant="default" className="cursor-pointer" disabled={applications.length === 0 || approveList.length > 0 || rejectList.length > 0} onClick={handleApproveAll}>Approve All</Button>
                            <Button variant="default" className="cursor-pointer" disabled={applications.length === 0 || approveList.length > 0 || rejectList.length > 0} onClick={handleRejectAll}>Reject All</Button>
                            <AdminManager objectID={objectID} admins={administrators} setParentOpen={setOpen} />
                        </>
                    }
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}