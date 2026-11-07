/**
 * Denim Upgrade Module: 200ms Native Blocks for Base Mainnet & Sepolia
 *
 * Denim replaces Flashblocks with canonical 200ms blocks.
 * Base stopped producing Flashblocks on both networks at activation:
 * - Base Sepolia: Activated October 21, 2026 at 18:00 UTC (LIVE)
 * - Base Mainnet: Activated November 5, 2026 at 18:00 UTC (LIVE)
 *
 * Flashblocks WebSocket streams, pending preconfirmation subscriptions, and
 * flashblock_index predicates are retired.
 */

import { PublicClient, BlockTag } from 'viem';

export const DENIM_BLOCK_TIME_MS = 200;

export const DENIM_ACTIVATION_INFO = {
  mainnet: {
    activated: true,
    activationDate: '2026-11-05T18:00:00Z',
    minNodeVersion: 'base/base v1.5.1',
    status: 'LIVE'
  },
  sepolia: {
    activated: true,
    activationDate: '2026-10-21T18:00:00Z',
    minNodeVersion: 'base/base v1.5.0',
    status: 'LIVE'
  },
  vibenet: {
    activated: true,
    status: 'LIVE'
  }
} as const;

export const DENIM_MIGRATION_MAPPING = {
  retiredStreams: {
    'wss://mainnet.flashblocks.base.org/ws': 'Use eth_subscribe("newHeads") or eth_subscribe("logs") on canonical RPC/WebSocket',
    'wss://sepolia.flashblocks.base.org/ws': 'Use eth_subscribe("newHeads") or eth_subscribe("logs") on canonical RPC/WebSocket',
  },
  subscriptions: {
    newFlashblocks: 'eth_subscribe("newHeads")',
    pendingLogs: 'eth_subscribe("logs")',
    newFlashblockTransactions: 'eth_subscribe("newHeads"), then fetch transactions for each canonical 200ms block',
  },
  rpcCalls: {
    'eth_getBlockByNumber("pending")': 'eth_getBlockByNumber("latest") (reads canonical 200ms block)',
    'eth_getBalance("pending")': 'eth_getBalance("latest")',
    'eth_getTransactionCount("pending")': 'eth_getTransactionCount("latest")',
    'eth_call("pending")': 'eth_call("latest")',
    'eth_estimateGas("pending")': 'eth_estimateGas("latest")',
    'eth_simulateV1("pending")': 'Simulates against canonical state',
    'eth_getLogs(toBlock: "pending")': 'Queries canonical 200ms blocks',
    'eth_getBlockTransactionCountByNumber("pending")': 'Reads latest canonical 200ms block',
    'base_transactionStatus': 'Deprecated on public endpoints; poll eth_getTransactionReceipt for 200ms inclusion',
    'flashblock_index predicates': 'Removed. Bound transactions with block_number only',
  },
  pendingTagBehavior: 'The "pending" tag is still accepted by nodes but resolves directly to the latest canonical 200ms block (no preconfirmation state).',
} as const;

/**
 * Denim canonical block query: strictly uses 'latest' or explicit block number,
 * ensuring clean canonical 200ms block consumption.
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
 * Checks if Denim 200ms native blocks are active for a given chainId.
 * Both Base Mainnet (8453) and Base Sepolia (84532) are fully active.
 */
export function isDenimActive(chainId: number): boolean {
  return chainId === 8453 || chainId === 84532 || chainId === 73685;
}
