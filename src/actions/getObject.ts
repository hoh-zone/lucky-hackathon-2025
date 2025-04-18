import { LUCKY_SHARED_RECORD_ID } from "@/constants";
import { Draw } from "@/types/display";
import { toDraw } from "@/utils/lucky";
import { client } from "@/utils/sui";

export const getObjects = async (ids: string[]): Promise<any> => {
  try {
    const res = await client.multiGetObjects({
      ids,
      options: {
        showContent: true,
        showOwner: true,
      },
    });
    return res.map((item) => item.data);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getObject = async (id: string) => {
  try {
    const res = await client.getObject({
      id: id,
      options: {
        showContent: true,
        showType: true,
      },
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getAllDraws = async () => {
  let reply: Draw[] = [];
  const res = await client.getObject({
    id: LUCKY_SHARED_RECORD_ID,
    options: {
      showContent: true,
      showType: true,
    },
  });

  const drawIds = [];

  if (res.data?.content?.dataType === "moveObject") {
    const data = res.data.content.fields as any;
    drawIds.push(...data.draws);
  }

  if (drawIds.length > 0) {
    const objects = await getObjects(drawIds);
    // todo 转 Draw
    reply = objects.map((item: any) => toDraw(item.content));
  }

  return reply;
};

// export const getBoard = async (id: string): Promise<Board> => {
//   const res = await getObject(id);
//   return toBoard(res.data?.content?.fields);
// };
