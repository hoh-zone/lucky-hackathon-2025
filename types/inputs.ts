export interface InputNewDraw {
  endAt: number;
  confirmThreshold: number;
  numWinners: number;
}

export interface InputAddItem {
  drawId: string;
  name: string;
  desc: string;
  url: string;
}

export interface InputRemoveItem {
  drawId: string;
  index: number;
}

export interface InputConfirmDraw {
  drawId: string;
}

export interface InputPublishDraw {
  drawId: string;
}

export interface InputLucky {
  drawId: string;
}
