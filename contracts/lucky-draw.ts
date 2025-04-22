import { createBetterTxFactory } from ".";

export const luckyDraw = createBetterTxFactory<{
  drawId: string;
}>((tx, networkVariables, params) => {
  tx.moveCall({
    package: networkVariables.Package,
    module: "lucky",
    function: "lucky",
    arguments: [
      tx.object(networkVariables.AdminCap),
      tx.object(params.drawId),
      tx.object("0x8"), // Random object ID (system random)
    ],
  });
  return tx;
});
