import { createBetterTxFactory } from ".";

export const newDraw = createBetterTxFactory<{
  name: string;
  endAt: number;
  confirmThreshold: number;
  numWinners: number;
}>((tx, networkVariables, params) => {
  tx.moveCall({
    package: networkVariables.Package,
    module: "lucky",
    function: "new",
    arguments: [
      tx.object(networkVariables.AdminCap),
      tx.object(networkVariables.Record),
      tx.pure.string(params.name),
      tx.pure.u64(params.endAt),
      tx.pure.u64(params.confirmThreshold),
      tx.pure.u64(params.numWinners),
    ],
  });
  return tx;
});
