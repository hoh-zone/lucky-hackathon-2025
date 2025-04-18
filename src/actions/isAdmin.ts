import { LUCKY_ADMINCAP } from "@/constants";
import { client } from "@/utils/sui";

export const isAdmin = async (address: string | undefined) => {
  if (!address) return false;

  const res = await client.getObject({
    id: LUCKY_ADMINCAP,
    options: {
      showOwner: true,
    },
  });
  console.log(res);
  const owner = res.data?.owner as any;
  return owner.AddressOwner === address;
};
