'use client'

import {CreateLottery, Loading, LotteryCard, Navigation} from "@/components";
import {useDispatch} from "react-redux";
import {AppDispatch, useAppSelector} from "@/store";
import {ChangeEvent, useEffect, useState} from "react";
import {refreshAll, setProgressValue} from "@/store/modules/info";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";
import {PoolInfoType} from "@/lib/contracts";
import {randomTwentyFive} from "@/lib/utils";

export default function Home() {
    const navTab = useAppSelector(state => state.info.navTab);
    const poolInfos = useAppSelector(state => state.info.poolInfos);
    const endedPoolInfos = useAppSelector(state => state.info.endedPoolInfos);
    const progressValue = useAppSelector(state => state.info.progressValue);
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(refreshAll(localStorage.getItem("PublicKey")));
        let basicValue = 25;
        const intervalTimer = setInterval(() => {
            const targetValue = basicValue === 75 ? 100 : basicValue + randomTwentyFive();
            basicValue += 25;
            dispatch(setProgressValue(targetValue));
            if (targetValue >= 100)
                clearInterval(intervalTimer);
        }, 1000);
    }, [dispatch]);

    const [infos, setInfos] = useState<PoolInfoType[]>([]);
    useEffect(() => {
        setInfos(navTab === "Main" ? poolInfos : endedPoolInfos);
    }, [navTab, poolInfos, endedPoolInfos]);
    const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
        const infos = navTab === "Main" ? poolInfos : endedPoolInfos;
        if (!e.target.value)
            setInfos(infos);
        else
            setInfos(infos.filter(info => info.id.search(e.target.value) !== -1));
    }

    return (
        <div className="relative w-screen h-screen bg-[#f1f2f5] text-[#0a0e0f]">
            <div className="flex flex-col items-center w-full h-full">
                <Navigation/>
                <div className="flex-1 w-full min-w-[1024px] px-32 xl:px-64 2xl:px-96 py-10 overflow-y-scroll">
                    <ScrollArea className="w-full h-full border-2 border-[#041f4b] rounded-2xl">
                        <div className="flex flex-col items-center">
                            <div className="relative flex flex-col gap-5 items-center h-36 w-full p-2 bg-[#f9f9f9] rounded-xl border-2 hover:border-[#35a1f7]">
                                <h1 className="text-5xl font-bold subpixel-antialiased tracking-wider">Luckcky Sui</h1>
                                <div className="flex gap-3 items-center">
                                    <Input type="text" placeholder="ObjectID" size={50} onChange={handleChangeInput} />
                                    <Search size={24} className="cursor-pointer text-[#afb3b5] active:text-[#196ae3]" />
                                </div>
                                <div className="absolute bottom-1 right-1">
                                    <CreateLottery />
                                </div>
                            </div>
                            {
                                infos.map((info, index) => {
                                    return (
                                        <div key={index} className="w-full">
                                            <LotteryCard info={info} isOdd={index % 2 === 1} />
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </ScrollArea>
                </div>
            </div>
            {
                progressValue >= 0 && <Loading />
            }
        </div>
    );
}
