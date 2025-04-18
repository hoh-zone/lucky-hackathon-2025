import { useMutation } from "@tanstack/react-query";
import { InputConfirmDraw } from "@/types/inputs";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";
import { Transaction } from "@mysten/sui/transactions";
import { LUCKY_PACKAGE } from "@/constants";

export function useConfirmMutation() {
  const account = useCurrentAccount();
  const executeTransaction = useTransactionExecution();

  return useMutation({
    mutationFn: async ({
      inputConfirmDraw,
    }: {
      inputConfirmDraw: InputConfirmDraw;
    }) => {
      if (!account) throw new Error("No account found");

      let txb = new Transaction();
      txb.moveCall({
        target: `${LUCKY_PACKAGE}::lucky::confirm`,
        arguments: [txb.object(inputConfirmDraw.boardId)],
        typeArguments: [],
      });
      return executeTransaction(txb);
    },
  });
}
