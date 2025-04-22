import { createBetterTxFactory } from ".";

export const publishDraw = createBetterTxFactory<{
  drawId: string;
}>((tx, networkVariables, params) => {
  tx.moveCall({
    package: networkVariables.Package,
    module: "lucky",
    function: "publish",
    arguments: [tx.object(networkVariables.AdminCap), tx.object(params.drawId)],
  });
  return tx;
});
