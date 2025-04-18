import { useMutation } from "@tanstack/react-query";
import { InputAddItem } from "@/types/inputs";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";
import { Transaction } from "@mysten/sui/transactions";
import { LUCKY_PACKAGE } from "@/constants";
import { LUCKY_ADMINCAP } from "@/constants";
export function useAddItemMutation() {
  const account = useCurrentAccount();
  const executeTransaction = useTransactionExecution();

  return useMutation({
    mutationFn: async ({ inputAddItem }: { inputAddItem: InputAddItem }) => {
      if (!account) throw new Error("No account found");

      let txb = new Transaction();
      txb.moveCall({
        target: `${LUCKY_PACKAGE}::lucky::add`,
        arguments: [
          txb.object(LUCKY_ADMINCAP),
          txb.object(inputAddItem.boardId),
          txb.pure.string(inputAddItem.name),
          txb.pure.string(inputAddItem.desc),
          txb.pure.string(inputAddItem.url),
        ],
        typeArguments: [],
      });
      return executeTransaction(txb);
    },
  });
}
