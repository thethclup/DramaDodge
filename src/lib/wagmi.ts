import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet, metaMask, injected } from 'wagmi/connectors'
import { DATA_SUFFIX } from './erc8021'

export const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({ appName: 'Drama Dodger' }),
    metaMask(),
    injected(),
  ],
  transports: {
    [base.id]: http(),
  },
  experimental: {
    erc8021: {
      dataSuffix: DATA_SUFFIX,
    }
  }
})
