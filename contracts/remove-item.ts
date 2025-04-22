import { createBetterTxFactory } from ".";

export const removeItem = createBetterTxFactory<{
  drawId: string;
  index: number;
}>((tx, networkVariables, params) => {
  tx.moveCall({
    package: networkVariables.Package,
    module: "lucky",
    function: "remove",
    arguments: [
      tx.object(networkVariables.AdminCap),
      tx.object(params.drawId),
      tx.pure.u64(params.index),
    ],
  });
  return tx;
});
