'use client'

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Tabs, TabsList, TabsTrigger,} from "@/components/ui/tabs";
import {PassKey} from "@/components/index";
import {useDispatch} from "react-redux";
import {AppDispatch, useAppSelector} from "@/store";
import {setNavTab} from "@/store/modules/info";

export default function Navigation() {
    const navTab = useAppSelector(state => state.info.navTab);
    const dispatch = useDispatch<AppDispatch>();

    return (
        <div className="flex justify-between items-center h-16 w-full min-w-[1024px] px-32 xl:px-64 2xl:px-96 bg-[#222] text-[#afb3b5]">
            <div className="flex gap-10 items-center">
                <Avatar>
                    <AvatarImage src={`${process.env.NEXT_PUBLIC_AGGREGATOR}/yEUb_mF7q5fktIsHCubMPf0FGz02P6iqcX0wRp8USqY`} alt="luckcky sui logo" />
                    <AvatarFallback>Sui</AvatarFallback>
                </Avatar>
                <Tabs defaultValue="Main" value={navTab} className="w-40" onValueChange={value => dispatch(setNavTab(value))}>
                    <TabsList className="h-16 w-full bg-[#222]">
                        <TabsTrigger value="Main" className="cursor-pointer text-[#afb3b5] data-[state=active]:bg-[#0f0f0f] data-[state=active]:text-white transition-all duration-500">Main</TabsTrigger>
                        <TabsTrigger value="Ended" className="cursor-pointer text-[#afb3b5] data-[state=active]:bg-[#0f0f0f] data-[state=active]:text-white transition-all duration-500">Ended</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <PassKey />
        </div>
    );
}