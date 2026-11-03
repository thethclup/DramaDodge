import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask, injected } from 'wagmi/connectors'
import { DATA_SUFFIX } from './erc8021'
import { DENIM_BLOCK_TIME_MS } from './denim'

// Denim 200ms native blocks chain overrides
export const baseDenim = {
  ...base,
  name: 'Base (Denim 200ms)',
  blockTime: DENIM_BLOCK_TIME_MS,
} as const

export const baseSepoliaDenim = {
  ...baseSepolia,
  name: 'Base Sepolia (Denim 200ms)',
  blockTime: DENIM_BLOCK_TIME_MS,
} as const

export const config = createConfig({
  chains: [baseDenim, baseSepoliaDenim],
  connectors: [
    coinbaseWallet({ appName: 'Drama Dodger' }),
    metaMask(),
    injected(),
  ],
  transports: {
    [baseDenim.id]: http(undefined, { batch: true }),
    [baseSepoliaDenim.id]: http(undefined, { batch: true }),
  },
  pollingInterval: DENIM_BLOCK_TIME_MS,
  // @ts-ignore - Wagmi type might be out of date for this experimental property
  experimental: {
    erc8021: {
      dataSuffix: DATA_SUFFIX,
    }
  }
})

