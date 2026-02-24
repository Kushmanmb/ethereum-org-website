export const DEPOSIT_CONTRACT_ADDRESS =
  "0x00000000219ab540356cBB839Cbe05303d7705Fa"

export interface ContractMetadata {
  address: string
  owner?: string
}

export const WETH_CONTRACT: ContractMetadata = {
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  owner: "Yaketh.eth",
}
