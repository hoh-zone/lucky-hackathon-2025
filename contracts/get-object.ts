import { Draw, ItemInfo } from "@/types/display";
import { suiClient, useNetworkVariables } from ".";
import { convertSuiObject } from "@/utils/contractResponseHelpers";
import { SuiObjectResponse } from "@mysten/sui/client";
import { RECORD } from "@/constants";

export const getObjects = async (ids: string[]): Promise<any> => {
  try {
    const res = await suiClient.multiGetObjects({
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
    const res = await suiClient.getObject({
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

interface Id {
  id: string;
}

interface GetDrawsRes {
  draws: string[];
  id: Id;
}

export const getAllDraws = async () => {
  let reply: Draw[] = [];
  const res = await suiClient.getObject({
    id: RECORD,
    options: {
      showContent: true,
      showType: true,
    },
  });

  const getDrawsRes = convertSuiObject<GetDrawsRes>(res);

  if (getDrawsRes && getDrawsRes.draws.length > 0) {
    let allDrawIds = [];
    allDrawIds.push(...getDrawsRes.draws);
    const res = await suiClient.multiGetObjects({
      ids: allDrawIds,
      options: {
        showContent: true,
        showType: true,
      },
    });

    const draws = converToDraws(res);
    // if (objects) {
    //   objects.forEach((item) => {
    //     reply.push(converDraw(item));
    //   });
    // }

    return draws;
  }

  return reply;
};

export const getDraw = async (id: string) => {
  try {
    const res = await suiClient.getObject({
      id: id,
      options: {
        showContent: true,
        showType: true,
      },
    });

    return converDraw(res);
  } catch (error) {
    throw error;
  }
};

const converDraw = (response: SuiObjectResponse) => {
  let items: ItemInfo[] = [];
  try {
    // Check if response and data exist
    if (!response?.data?.content?.dataType) {
      return null;
    }

    const content = response.data.content;

    // Ensure it's a moveObject with fields
    if (content.dataType === "moveObject" && "fields" in content) {
      let ms = content.fields as any;
      // let draw = ms as Draw;
      if (ms.items && ms.items.length > 0) {
        ms.items.forEach((item: { fields: ItemInfo }) => {
          const itemInfo = item.fields as ItemInfo;
          items.push(itemInfo);
        });
      }
      let draw = ms as Draw;
      draw.items = items;
      return draw;
    }

    return null;
  } catch (error) {
    console.error("Error converting SUI object:", error);
    return null;
  }
};

const converToDraws = (responses: SuiObjectResponse[]) => {
  return responses
    .map((response) => converDraw(response))
    .filter((item) => item !== null);
};

export const getCurrentEpoch = async (): Promise<number> => {
  try {
    const { epoch } = await suiClient.getLatestSuiSystemState();
    return parseInt(epoch);
  } catch (error) {
    console.error("Error getting current epoch:", error);
    return 0;
  }
};
