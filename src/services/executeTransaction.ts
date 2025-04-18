import { client } from "@/utils/sui";
import { useSignTransaction } from "@mysten/dapp-kit";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import toast from "react-hot-toast";

export const executeTransaction = async (
  txb: Transaction,
): Promise<SuiTransactionBlockResponse | void> => {
  const { mutateAsync: signTransactionBlock } = useSignTransaction();

  try {
    const signature = await signTransactionBlock({
      transaction: txb,
    });

    const res = await client.executeTransactionBlock({
      transactionBlock: signature.bytes,
      signature: signature.signature,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    toast.success("Successfully executed transaction! " + res.digest);
    return res;
  } catch (e: any) {
    toast.error(`Failed to execute transaction: ${e.message as string}`);
  }
};
