import { createConfig } from "ponder";
import { http } from "viem";
import { RegistryAbi } from "./abis/Registry";
import { ResolverAbi } from "./abis/Resolver";

export default createConfig({
  networks: {
    arcTestnet: {
      chainId: 5042002,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Registry: {
      abi: RegistryAbi,
      network: "arcTestnet",
      address: "0x0fdC78e7a68B8c5197895bf92C0658d47f2cc33C",
      startBlock: 0,
    },
    Resolver: {
      abi: ResolverAbi,
      network: "arcTestnet",
      address: "0xDF4FaEc0390505f394172D87faa134872b2D54B4",
      startBlock: 0,
    },
  },
});
