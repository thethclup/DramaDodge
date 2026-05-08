/**
 * ERC-8021: Transaction Attribution (Work in Progress / Stub)
 * https://eips.ethereum.org/EIPS/eip-8021
 *
 * Appends attribution tags to transactions to indicate which frontend, 
 * builder, or referer facilitated the action.
 */
import { encodeAbiParameters, parseAbiParameters, Hex } from 'viem'

export const BUILDER_CODE = 'bc_o3a4p35f'
export const ATTRIBUTION_CODE = 'dd_app_v1'

export function applyERC8021Attribution(calldata: Hex, attribution: string = ATTRIBUTION_CODE, builder: string = BUILDER_CODE): Hex {
  // Mock logic: Typically, ERC-8021 appends specific encoded calldata payload
  // representing the attribution to the end of the strict calldata.
  const encodedAttribution = encodeAbiParameters(
    parseAbiParameters('string attribution, string builder'),
    [attribution, builder]
  )
  
  // Real implementation appends the encoded parameters correctly based on standard offset
  const baseCalldata = calldata.startsWith('0x') ? calldata.slice(2) : calldata
  const appended = encodedAttribution.startsWith('0x') ? encodedAttribution.slice(2) : encodedAttribution
  
  return `0x${baseCalldata}${appended}`
}
