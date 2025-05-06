'use client'

import {PoolInfoType} from "@/lib/contracts";
import {Apply, ShowWinners, ViewApplication, ViewParticipants} from "@/components";
import {useAppSelector} from "@/store";

export default function LotteryCard({info, isOdd}: {info: PoolInfoType, isOdd: boolean}) {
    const navTab = useAppSelector(state => state.info.navTab);
    const winnerEvents = useAppSelector(state => state.info.winnerEvents);

    return (
        <div className={"flex gap-10 items-center h-36 w-full p-2 rounded-xl border-2 " + (!isOdd ? "bg-[#fff] hover:border-[#196ae3]" : "bg-[#f9f9f9] hover:border-[#35a1f7]")}>
            <div className="flex-1 flex flex-col items-start h-full">
                <h2 className="text-2xl font-bold subpixel-antialiased tracking-wider">{info.name}</h2>
                <p className="flex-1 pt-3 pb-1 w-2/3 text-xs text-wrap">
                    {info.description}
                </p>
                <div className="flex gap-2 items-center text-xs text-[#afb3b5]">
                    <span><b>ObjectID</b>: {info.id.slice(0, 6) + "..." + info.id.slice(-4)}</span>
                    {
                        navTab === "Main" &&
                        <span><b>Time</b>: {info.creationTime}</span>
                    }
                    {
                        navTab === "Ended" && winnerEvents.find(event => event.poolID === info.id) &&
                        <span><b>LotteryDrawingTime</b>: {winnerEvents.find(event => event.poolID === info.id)!.LotteryDrawingTime}</span>
                    }
                </div>
            </div>
            <div className="flex flex-col justify-end items-start gap-1 h-full">
                <span>number of winners: <b>{info.numberOfWinners}</b></span>
                <span>minimum participants: <b>{info.minimumParticipants}</b></span>
                <span>current participants: <b>{info.pool.length}</b></span>
                <span>repeat winnings allowed: <b>{info.allowsMultipleAwards ? "true" : "false"}</b></span>
            </div>
            <div className="flex flex-col justify-end items-end gap-1 h-full">
                {
                    navTab === "Main" &&
                    <>
                        <Apply name={info.name} objectID={info.id} fields={info.fields} />
                        <ViewApplication name={info.name} objectID={info.id} fields={info.fields} applications={info.application} administrators={info.admins} />
                        <ViewParticipants name={info.name} objectID={info.id} fields={info.fields} participants={info.pool} administrators={info.admins} hasConfirmed={info.confirmed} minimumParticipants={info.minimumParticipants} />
                    </>
                }
                {
                    navTab === "Ended" && winnerEvents.find(event => event.poolID === info.id) &&
                    <ShowWinners
                        name={info.name}
                        objectID={info.id}
                        winnerEvent={winnerEvents.find(event => event.poolID === info.id)!}
                        fields={info.fields}
                        participants={info.pool}
                        administrators={info.admins}
                    />
                }
            </div>
        </div>
    );
}