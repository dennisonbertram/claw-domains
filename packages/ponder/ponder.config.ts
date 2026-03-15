import { createConfig } from "ponder";
import { RegistryAbi } from "./abis/Registry";
import { ResolverAbi } from "./abis/Resolver";

export default createConfig({
  chains: {
    arcTestnet: {
      id: 5042002,
      rpc: process.env.PONDER_RPC_URL_1,
    },
  },
  contracts: {
    Registry: {
      abi: RegistryAbi,
      chain: "arcTestnet",
      address: "0xa3d096c0D43b0fEb317CD1a7b84BA987Bd0C4eC3",
      startBlock: 32041752,
    },
    Resolver: {
      abi: ResolverAbi,
      chain: "arcTestnet",
      address: "0x3DD454c7b4FFe55469a5710A86fe86ab9f85c75e",
      startBlock: 32041752,
    },
  },
});
