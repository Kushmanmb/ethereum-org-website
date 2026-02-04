import type { ValueOrError } from "../types"

import { fetchMetric } from "./fetchMetricUtils"

type BlobscanOverallStats = {
  avgBlobAsCalldataFee: number
  avgBlobFee: number
  avgBlobGasPrice: number
  avgMaxBlobGasFee: number
  totalBlobGasUsed: string
  totalBlobAsCalldataGasUsed: string
  totalBlobFee: string
  totalBlobAsCalldataFee: string
  totalBlobs: number
  totalBlobSize: string
  totalBlocks: number
  totalTransactions: number
  totalUniqueBlobs: number
  totalUniqueReceivers: number
  totalUniqueSenders: number
  updatedAt: string
}

/**
 * Fetch the overall stats from Blobscan
 *
 * @see https://api.blobscan.com/#/stats/stats-getOverallStats
 *
 */
export const fetchBlobscanStats = async (): Promise<
  ValueOrError<BlobscanOverallStats>
> => {
  return fetchMetric<[BlobscanOverallStats], BlobscanOverallStats>({
    url: "https://api.blobscan.com/stats/overall",
    metricName: "Blobscan stats",
    extractValue: ([json]) => json,
    errorMessage: "Response for fetchBlobscanStats not okay",
  })
}
