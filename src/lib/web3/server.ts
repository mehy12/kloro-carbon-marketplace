import { createPublicClient, createWalletClient, http, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import abi from "@/contracts/CarbonCredit1155ABI.json";

const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY as string | undefined;
const ERC1155_ADDRESS = process.env.ERC1155_CONTRACT_ADDRESS as `0x${string}` | undefined;

export function isErc1155Configured() {
  return Boolean(RPC_URL && PRIVATE_KEY && ERC1155_ADDRESS);
}

function getClients() {
  if (!RPC_URL) throw new Error("Missing BASE_SEPOLIA_RPC_URL/RPC_URL");
  if (!PRIVATE_KEY) throw new Error("Missing PRIVATE_KEY");
  if (!ERC1155_ADDRESS) throw new Error("Missing ERC1155_CONTRACT_ADDRESS");

  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  const transport = http(RPC_URL);

  const publicClient = createPublicClient({ chain: baseSepolia, transport });
  const walletClient = createWalletClient({ account, chain: baseSepolia, transport });

  const contract = getContract({ address: ERC1155_ADDRESS, abi, client: { public: publicClient, wallet: walletClient } });

  return { publicClient, walletClient, contract } as const;
}

export async function mint1155(to: `0x${string}`, tokenId: bigint, amount: bigint) {
  const { contract, publicClient } = getClients();
  const hash = await contract.write.mint([to, tokenId, amount, "0x"]);
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function retire1155(from: `0x${string}`, tokenId: bigint, amount: bigint, reason: string) {
  const { contract, publicClient } = getClients();
  // retire burns from msg.sender; to burn from another address, use forceRetire with BURNER_ROLE
  const hash = await contract.write.forceRetire([from, tokenId, amount, reason]);
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export function baseSepoliaTxUrl(txHash: `0x${string}`) {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}
