import { createBetterTxFactory } from ".";

export const addItem = createBetterTxFactory<{
  drawId: string;
  name: string;
  desc: string;
  url: string;
}>((tx, networkVariables, params) => {
  tx.moveCall({
    package: networkVariables.Package,
    module: "lucky",
    function: "add",
    arguments: [
      tx.object(networkVariables.AdminCap),
      tx.object(params.drawId),
      tx.pure.string(params.name),
      tx.pure.string(params.desc),
      tx.pure.string(params.url),
    ],
  });
  return tx;
});
