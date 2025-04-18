export interface InputNewDraw {
  endAt: number;
  confirmThreshold: number;
  num: number;
}

export interface InputAddItem {
  boardId: string;
  name: string;
  desc: string;
  url: string;
}

export interface InputRemoveItem {
  boardId: string;
  index: number;
}

export interface InputConfirmDraw {
  boardId: string;
}

export interface InputLucky {
  boardId: string;
}
