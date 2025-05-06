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
import {FieldInfoType, FieldType, WinnerEventType} from "@/lib/contracts";
import {WinnerInfoDetail} from "@/components";
import {useAppSelector} from "@/store";
import {useEffect, useState} from "react";

export default function ShowWinners({name, objectID, winnerEvent, fields, participants, administrators}: {
    name: string,
    objectID: string,
    winnerEvent: WinnerEventType,
    fields: FieldType[],
    participants: FieldInfoType[],
    administrators: string[]
}) {
    const account = useAppSelector(state => state.info.address);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    useEffect(() => {
        setIsAdmin(administrators.includes(account));
    }, [account, administrators]);
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" className="cursor-pointer">Show Winners</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[45rem] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>{`${name}'s winners`}</DialogTitle>
                    <DialogDescription>
                        {`PoolObjectID: ${objectID.slice(0, 6) + "..." + objectID.slice(-4)}`}<br/>
                        {`LotteryDrawingTime: ${winnerEvent.LotteryDrawingTime}`}<br/>
                        You can view all winners and admins can view the encrypted info.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea>
                    <div className="flex flex-col gap-5 items-center">
                        {
                            winnerEvent.winners.map((winnerID, index) => {
                                const winner = participants.find(participant => participant.index === winnerID)!;
                                return (
                                    <div key={index}>
                                        <WinnerInfoDetail
                                            objectID={objectID}
                                            fields={fields}
                                            winner={winner}
                                            isOdd={index % 2 === 1}
                                            isAdmin={isAdmin}
                                        ></WinnerInfoDetail>
                                    </div>
                                )
                            })
                        }
                    </div>
                </ScrollArea>
                <DialogFooter></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}