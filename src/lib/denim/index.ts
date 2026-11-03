/**
 * Denim Upgrade Module: 200ms Native Blocks Migration for Base
 *
 * Denim replaces Flashblocks with canonical 200ms blocks.
 * Flashblocks subscriptions and "pending" block tags are deprecated/unavailable after activation.
 *
 * Activation Timeline:
 * - Vibenet: Live for developer testing
 * - Base Sepolia: Activated October 21, 2026 at 18:00 UTC
 * - Base Mainnet: Targeting November 2026
 */

import { PublicClient, BlockTag } from 'viem';

export const DENIM_BLOCK_TIME_MS = 200;

export const DENIM_MIGRATION_MAPPING = {
  subscriptions: {
    newFlashblocks: 'newHeads',
    pendingLogs: 'logs',
    newFlashblockTransactions: 'newHeads (then query transactions from canonical block)',
  },
  rpcCalls: {
    'eth_getBlockByNumber("pending")': 'eth_getBlockByNumber("latest") or canonical block number',
    'eth_getBalance("pending")': 'eth_getBalance("latest")',
    'eth_getTransactionCount("pending")': 'eth_getTransactionCount("latest")',
    'eth_call("pending")': 'eth_call("latest")',
    'eth_estimateGas("pending")': 'eth_estimateGas("latest")',
    'eth_simulateV1("pending")': 'eth_simulateV1("latest")',
    'eth_getLogs(toBlock: "pending")': 'eth_getLogs(toBlock: "latest")',
    'eth_getBlockTransactionCountByNumber("pending")': 'eth_getBlockTransactionCountByNumber("latest")',
  },
  summary: 'Flashblocks preconfirmation state and "pending" tag have no equivalent after Denim; all operations return canonical 200ms blocks.',
} as const;

/**
 * Denim canonical block query: strictly uses 'latest' or explicit block number,
 * never the deprecated 'pending' block tag.
 */
export async function getDenimCanonicalBlock(client: PublicClient, blockNumber?: bigint) {
  if (blockNumber !== undefined) {
    return client.getBlock({ blockNumber });
  }
  return client.getBlock({ blockTag: 'latest' as BlockTag });
}

/**
 * Reads account balance using Denim canonical 200ms block state ('latest').
 */
export async function getDenimBalance(client: PublicClient, address: `0x${string}`) {
  return client.getBalance({
    address,
    blockTag: 'latest' as BlockTag,
  });
}

/**
 * Helper to check if Denim is active for a given chainId.
 */
export function isDenimActive(chainId: number): boolean {
  // Base Sepolia (84532): Activated Oct 21, 2026
  // Base Mainnet (8453): November 2026 target
  // Vibenet (73685): Live for testing
  return chainId === 84532 || chainId === 8453 || chainId === 73685;
}
