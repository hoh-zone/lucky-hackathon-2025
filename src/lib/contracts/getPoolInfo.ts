'use client'

import {network, networkConfig, suiClient} from "@/configs/networkConfig";
import {EventId} from "@mysten/sui/client";
import {timeExchange} from "@/lib/utils";

type InitFieldType = {
    field: string,
    encryption: boolean
}

type InitPoolInfoType = {
    fields: {
        id: {
            id: string,
        },
        name: string,
        description: string,
        creation_time: string,
        minimum_participants: string,
        number_of_winners: string,
        allows_multiple_awards: boolean,
        fields: {
            fields: InitFieldType
        }[],
        application: {
            fields: {
                id: {
                    id: string
                }
            }
        },
        pool: {
            fields: {
                id: {
                    id: string
                }
            }
        },
        admins: string[]
        confirmed: string[],
        ended: boolean
    }
}

type InitFieldContentType = {
    fields: {
        key: string,
        value: string
    }
}

type InitFieldInfoType = {
    fields: {
        value: {
            fields: {
                fields: {
                    fields: {
                        contents: InitFieldContentType[]
                    }
                }
            }
        }
    }
}

export type FieldType = {
    fieldName: string,
    needEncryption: boolean
}

export type FieldInfoType = {
    index: number,
    keys: string[],
    values: string[],
    sender: string
}

export type WinnerEventType = {
    poolID: string,
    winners: number[],
    LotteryDrawingTime: string
}

export type PoolInfoType = {
    id: string,
    name: string,
    description: string,
    creationTime: string,
    minimumParticipants: number,
    numberOfWinners: number,
    allowsMultipleAwards: boolean,
    fields: FieldType[],
    application: FieldInfoType[],
    pool: FieldInfoType[],
    admins: string[],
    confirmed: string[],
    ended: boolean
}

async function getPoolIDs(cursor: EventId | null | undefined): Promise<string[]> {
    const data = await suiClient.queryEvents({
        query: {
            MoveEventType: `${networkConfig[network].variables.Package}::lucky::LuckyPoolCreated`
        },
        cursor
    });
    const ids = data.data.map(event => (event.parsedJson as {
        pool_id: string
    }).pool_id);
    return !data.hasNextPage ? ids : ids.concat(await getPoolIDs(data.nextCursor));
}

async function getEndedEvents(cursor: EventId | null | undefined): Promise<WinnerEventType[]> {
    const data = await suiClient.queryEvents({
        query: {
            MoveEventType: `${networkConfig[network].variables.Package}::lucky::WinnersEvent`
        },
        cursor
    });
    const events = data.data.map(event => (event.parsedJson as {
        pool_id: string,
        winners_list: string,
        time: string
    }));
    const winnerEvents: WinnerEventType[] = events.map(event => ({
        poolID: event.pool_id,
        winners: event.winners_list.split(' ').map(id => Number(id)),
        LotteryDrawingTime: timeExchange(event.time)
    }));
    return !data.hasNextPage ? winnerEvents : winnerEvents.concat(await getEndedEvents(data.nextCursor));
}

async function getFieldInfo(id: string): Promise<[string[], string[]]> {
    const data = await suiClient.getObject({
        id,
        options: {
            showContent: true
        }
    });
    return [
        (data.data?.content as unknown as InitFieldInfoType).fields.value.fields.fields.fields.contents.map(item => item.fields.key),
        (data.data?.content as unknown as InitFieldInfoType).fields.value.fields.fields.fields.contents.map(item => item.fields.value)
    ];
}

async function getTableFields(parentId: string, cursor: string | null | undefined): Promise<FieldInfoType[]> {
    const data = await suiClient.getDynamicFields({
        parentId,
        cursor
    });
    const temp: FieldInfoType[] = [];
    for (let i = 0; i < data.data.length; i++) {
        const item = data.data[i];
        const indexStr = item.name.value as string;
        const [keys, values] = await getFieldInfo(item.objectId);
        temp.push({
            index: indexStr.length > 1 && indexStr[1] === "x" ? Number(indexStr.slice(66)) : Number(indexStr),
            keys,
            values,
            sender: indexStr.length > 1 && indexStr[1] === "x" ? indexStr.slice(0, 66) : ""
        });
    }
    return !data.hasNextPage ? temp : temp.concat(await getTableFields(parentId, data.nextCursor));
}

async function getPool(id: string): Promise<PoolInfoType> {
    const data = await suiClient.getObject({
        id,
        options: {
            showContent: true
        }
    });
    const initInfo = data.data?.content as unknown as InitPoolInfoType;
    return {
        id: initInfo.fields.id.id,
        name: initInfo.fields.name,
        description: initInfo.fields.description,
        creationTime: timeExchange(initInfo.fields.creation_time),
        minimumParticipants: Number(initInfo.fields.minimum_participants),
        numberOfWinners: Number(initInfo.fields.number_of_winners),
        allowsMultipleAwards: initInfo.fields.allows_multiple_awards,
        fields: initInfo.fields.fields.map(item => {
            return {
                fieldName: item.fields.field,
                needEncryption: item.fields.encryption
            };
        }).sort((field1, field2) => {
            if (field1.needEncryption !== field2.needEncryption)
                return field1.needEncryption ? 1 : -1;
            return field1.fieldName < field2.fieldName ? -1 : 1;
        }),
        application: (await getTableFields(initInfo.fields.application.fields.id.id, null)).sort((field1, field2) => field1.index > field2.index ? -1 : 1),
        pool: (await getTableFields(initInfo.fields.pool.fields.id.id, null)).sort((field1, field2) => field1.index < field2.index ? -1 : 1),
        admins: initInfo.fields.admins,
        confirmed: initInfo.fields.confirmed,
        ended: initInfo.fields.ended
    };
}

export default async function getPoolInfo(): Promise<[PoolInfoType[], PoolInfoType[], WinnerEventType[]]> {
    const poolIDs = await getPoolIDs(null);
    const winnerEvents = await getEndedEvents(null);
    const infos: PoolInfoType[] = [];
    const endInfos: PoolInfoType[] = [];
    for (let i = 0; i < poolIDs.length; i++) {
        const info = await getPool(poolIDs[i]);
        if (!info.ended)
            infos.push(info);
        else
            endInfos.push(info);
    }
    return [infos, endInfos.sort((info1, info2) =>
        winnerEvents.find(event => event.poolID === info1.id)!.LotteryDrawingTime >
        winnerEvents.find(event => event.poolID === info2.id)!.LotteryDrawingTime ? -1 : 1
    ), winnerEvents];
}