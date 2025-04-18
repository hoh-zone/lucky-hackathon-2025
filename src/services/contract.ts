import {
  LUCKY_PACKAGE,
  LUCKY_ADMINCAP,
  LUCKY_SHARED_RECORD_ID,
} from "@/constants";
import { client } from "@/utils/sui";
import { executeTransaction } from "./executeTransaction";
import { Transaction } from "@mysten/sui/transactions";

// 获取所有抽奖活动
export const getBoards = async () => {
  try {
    // 获取Record对象
    const record = await client.getObject({
      id: LUCKY_SHARED_RECORD_ID,
      options: { showContent: true },
    });

    if (!record.data?.content) {
      return [];
    }

    // 获取所有抽奖活动
    const boardIds = (record.data.content as any).fields.boards;
    const boards = await Promise.all(
      boardIds.map(async (id: string) => {
        const board = await client.getObject({
          id,
          options: { showContent: true },
        });

        if (!board.data?.content) {
          return null;
        }

        const content = board.data.content as any;
        return {
          id: board.data.objectId,
          endAt: Number(content.fields.end_at),
          confirmThreshold: Number(content.fields.confirm_threshold),
          publish: content.fields.publish,
          confirmBy: content.fields.confirm_by,
          items: content.fields.items.map((item: any) => ({
            name: item.fields.name,
            desc: item.fields.desc,
            url: item.fields.url,
          })),
          num: Number(content.fields.num),
          lucky: content.fields.lucky,
        };
      }),
    );

    return boards.filter(Boolean);
  } catch (error) {
    console.error("获取抽奖列表失败:", error);
    return [];
  }
};

// 创建新抽奖
export const createBoard = async (
  endAt: number,
  confirmThreshold: number,
  num: number,
) => {
  let txb = new Transaction();
  txb.moveCall({
    target: `${LUCKY_PACKAGE}::lucky::new`,
    arguments: [
      txb.object(LUCKY_ADMINCAP),
      txb.object(LUCKY_SHARED_RECORD_ID),
      txb.pure.u64(endAt),
      txb.pure.u64(confirmThreshold),
      txb.pure.u64(num),
    ],
    typeArguments: [],
  });
  return executeTransaction(txb);
};

// 添加奖品
export const addItem = async (
  boardId: string,
  name: string,
  desc: string,
  url: string,
) => {
  let tx = new Transaction();
  tx.moveCall({
    target: `${LUCKY_PACKAGE}::lucky::add`,
    arguments: [
      tx.object(`${LUCKY_PACKAGE}::lucky::AdminCap`),
      tx.object(boardId),
      tx.pure.string(name),
      tx.pure.string(desc),
      tx.pure.string(url),
    ],
  });

  return executeTransaction(tx);
};

// 发布抽奖
export const publishBoard = async (boardId: string) => {
  let tx = new Transaction();
  tx.moveCall({
    target: `${LUCKY_PACKAGE}::lucky::publish`,
    arguments: [tx.object(boardId)],
  });

  return executeTransaction(tx);
};

// 确认参与
export const confirmBoard = async (boardId: string) => {
  let tx = new Transaction();
  tx.moveCall({
    target: `${LUCKY_PACKAGE}::lucky::confirm`,
    arguments: [tx.object(boardId)],
  });

  return executeTransaction(tx);
};

// 开奖
export const lucky = async (boardId: string) => {
  let tx = new Transaction();
  tx.moveCall({
    target: `${LUCKY_PACKAGE}::lucky::lucky`,
    arguments: [
      tx.object(`${LUCKY_PACKAGE}::lucky::AdminCap`),
      tx.object(boardId),
      tx.object(`${LUCKY_PACKAGE}::random::Random`),
    ],
  });

  return executeTransaction(tx);
};
