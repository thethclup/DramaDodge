/**
 * ERC-8004: Trustless Agents (Work in Progress / Stub)
 * Standardizing onchain agent interactions and delegations.
 */

export interface TokenAgentConfig {
  owner: string
  autonomousSigner: string
  permissions: string[]
}

export function generateAgentDelegationPayload(config: TokenAgentConfig) {
  // Mock logic: Generates the necessary payload/signature intent to delegate 
  // limited actions (like submitting non-critical scores automatically).
  return {
    type: 'ERC8004_DELEGATION',
    version: '1',
    message: {
      owner: config.owner,
      agent: config.autonomousSigner,
      permissions: config.permissions,
      timestamp: Date.now()
    }
  }
}
