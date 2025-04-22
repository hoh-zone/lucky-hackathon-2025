import { createBetterTxFactory } from ".";

export const confirmDraw = createBetterTxFactory<{
  drawId: string;
}>((tx, networkVariables, params) => {
  tx.moveCall({
    package: networkVariables.Package,
    module: "lucky",
    function: "confirm",
    arguments: [tx.object(params.drawId)],
  });
  return tx;
});
