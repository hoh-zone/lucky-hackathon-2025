export interface ItemInfo {
  name: string;
  desc: string;
  url: string;
}

export interface Board {
  id: string;
  name?: string;
  endAt: number;
  confirmThreshold: number;
  publish: boolean;
  confirmBy: string[];
  items: ItemInfo[];
  num: number;
  lucky: number[];
  status?: "active" | "completed";
  confirmCount?: number;
}

export interface Record {
  boards: string[];
}
