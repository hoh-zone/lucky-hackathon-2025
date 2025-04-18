import { useMutation } from "@tanstack/react-query";
import { InputRemoveItem } from "@/types/inputs";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";
import { Transaction } from "@mysten/sui/transactions";
import { LUCKY_PACKAGE } from "@/constants";
import { LUCKY_ADMINCAP } from "@/constants";
export function useRemoveMutation() {
  const account = useCurrentAccount();
  const executeTransaction = useTransactionExecution();

  return useMutation({
    mutationFn: async ({
      inputRemoveItem,
    }: {
      inputRemoveItem: InputRemoveItem;
    }) => {
      if (!account) throw new Error("No account found");

      let txb = new Transaction();
      txb.moveCall({
        target: `${LUCKY_PACKAGE}::lucky::remove`,
        arguments: [
          txb.object(LUCKY_ADMINCAP),
          txb.object(inputRemoveItem.boardId),
          txb.pure.u64(inputRemoveItem.index),
        ],
        typeArguments: [],
      });
      return executeTransaction(txb);
    },
  });
}
