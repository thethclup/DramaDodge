import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet, metaMask, injected } from 'wagmi/connectors'

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
})
