/**
 * ERC-8021: Transaction Attribution
 * https://eips.ethereum.org/EIPS/eip-8021
 *
 * Appends attribution tags to transactions to indicate which frontend, 
 * builder, or referer facilitated the action.
 */
import { Hex } from 'viem'
import { Attribution } from 'ox/erc8021'

export const BUILDER_CODE = 'bc_o3a4p35f'
export const ATTRIBUTION_CODE = 'dd_app_v1'

export const DATA_SUFFIX = Attribution.toDataSuffix({ codes: [BUILDER_CODE] })

export function applyERC8021Attribution(calldata: Hex): Hex {
  // We keep this function around to concat the calldata with the data suffix manually for EOAs.
  // We can just use viem's `concat` instead of encodeAbiParameters.
  const baseCalldata = calldata.startsWith('0x') ? calldata.slice(2) : calldata
  const appended = DATA_SUFFIX.startsWith('0x') ? DATA_SUFFIX.slice(2) : DATA_SUFFIX
  
  return `0x${baseCalldata}${appended}` as Hex
}
