export interface ItemInfo {
  name: string;
  desc: string;
  url: string;
}

export interface Draw {
  name: string;
  confirmBy: string[];
  id: string;
  endAt: number;
  confirmThreshold: number;
  publish: boolean;
  numWinners: number;
  items: ItemInfo[];
  luckies: string[];
}
