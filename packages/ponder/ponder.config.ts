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
      address: "0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C",
      startBlock: 31874007,
    },
    Resolver: {
      abi: ResolverAbi,
      chain: "arcTestnet",
      address: "0xDF4FaEc0390505f394172D87faa134872b2D54B4",
      startBlock: 31874007,
    },
  },
});
