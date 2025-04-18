import {
  LUCKY_ADMINCAP,
  LUCKY_PACKAGE,
  LUCKY_SHARED_RECORD_ID,
} from "@/constants";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { InputNewDraw } from "@/types/inputs";
export function useNewDrawMutation() {
  const account = useCurrentAccount();
  const executeTransaction = useTransactionExecution();

  return useMutation({
    mutationFn: async ({ inputNewDraw }: { inputNewDraw: InputNewDraw }) => {
      if (!account) throw new Error("No account found");

      let txb = new Transaction();
      txb.moveCall({
        target: `${LUCKY_PACKAGE}::lucky::new`,
        arguments: [
          txb.object(LUCKY_ADMINCAP),
          txb.object(LUCKY_SHARED_RECORD_ID),
          txb.pure.u64(inputNewDraw.endAt),
          txb.pure.u64(inputNewDraw.confirmThreshold),
          txb.pure.u64(inputNewDraw.num),
        ],
        typeArguments: [],
      });
      return executeTransaction(txb);
    },
  });
}
