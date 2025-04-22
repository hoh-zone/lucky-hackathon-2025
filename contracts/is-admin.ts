import { LUCKY_ADMINCAP } from "@/constants";
import { suiClient } from ".";

export const isAdmin = async (address: string | undefined) => {
  if (!address) return false;

  const res = await suiClient.getObject({
    id: LUCKY_ADMINCAP,
    options: {
      showOwner: true,
    },
  });
  console.log(res);
  const owner = res.data?.owner as any;
  return owner.AddressOwner === address;
};
