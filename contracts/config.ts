interface ContractAddresses {
  [key: string]: string;
}

type NetworkType = "testnet" | "mainnet";

const configs = {
  testnet: {
    Package:
      "0xfb6c9a453b15ebedfa6d6a8b65791438b692e3d5d22c81b20f4298aeafb0c440",
    Record:
      "0x19d1bb5e1dfb12260c3fa0c1b83420e892946c0728a665e560e6caa14921b398",
    AdminCap:
      "0xb99bb8f16ec51a487ffa57cde59637c7e47021e368dda2704b9567a09c1c0e77",
    Random: "0x8",
  },
  mainnet: {
    Package: "0x0",
    Record: "0x0",
    AdminCap: "0x0",
    Random: "0x8",
  },
} as const satisfies Record<NetworkType, ContractAddresses>;

export function getContractConfig(network: NetworkType): ContractAddresses {
  return configs[network];
}
