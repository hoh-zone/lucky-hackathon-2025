import { Draw, ItemInfo } from "@/types/display";

// toDraw
export const toDraw = (data: any): Draw => {
  // console.log(data);
  return {
    name: "todo",
    confirmBy: data.fields.confirm_by.map((item: any) => item.string),
    id: data.fields.id.id,
    endAt: data.fields.end_at,
    confirmThreshold: data.fields.confirm_threshold,
    publish: data.fields.publish,
    numWinners: data.fields.num_winners,
    items: data.fields.items.map((item: any) => toItemInfo(item)),
    luckies: data.fields.lucky,
  };
};

// export const toDraws = (data: any): Draw[] => {
//   return data.map((item: any) => toDraw(item));
// };

// toItemInfo
export const toItemInfo = (data: any): ItemInfo => {
  return {
    name: data.name,
    desc: data.desc,
    url: data.url,
  };
};
