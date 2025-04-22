export interface ResponseId {
  id: string;
}

export interface ItemInfo {
  name: string;
  desc: string;
  url: string;
}

export interface Draw {
  id: ResponseId;
  name: string;
  confirm_by: string[];
  end_at: number;
  confirm_threshold: number;
  publish: boolean;
  num_winners: number;
  items: ItemInfo[];
  lucky: string[];
}
