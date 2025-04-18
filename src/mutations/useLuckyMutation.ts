import { useMutation } from "@tanstack/react-query";
import { InputLucky } from "@/types/inputs";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";
import { Transaction } from "@mysten/sui/transactions";
import { LUCKY_PACKAGE, SUI_RANDOM } from "@/constants";
import { LUCKY_ADMINCAP } from "@/constants";
export function useLuckyMutation() {
  const account = useCurrentAccount();
  const executeTransaction = useTransactionExecution();

  return useMutation({
    mutationFn: async ({ inputLucky }: { inputLucky: InputLucky }) => {
      if (!account) throw new Error("No account found");

      let txb = new Transaction();
      txb.moveCall({
        target: `${LUCKY_PACKAGE}::lucky::lucky`,
        arguments: [
          txb.object(LUCKY_ADMINCAP),
          txb.object(inputLucky.boardId),
          txb.object(SUI_RANDOM),
        ],
        typeArguments: [],
      });
      return executeTransaction(txb);
    },
  });
}
