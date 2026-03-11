import { GITHUB_AUTOLINKS_URL } from "@/lib/constants"
import type { GHAutolink } from "@/lib/types"

export const fetchAutolinks = async (): Promise<GHAutolink[]> => {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    }

    const token = process.env.GITHUB_TOKEN_READ_ONLY
    if (token) {
      headers.Authorization = `token ${token}`
    }

    const response = await fetch(GITHUB_AUTOLINKS_URL, {
      headers,
    })

    if (!response.ok) {
      throw new Error(
        `GitHub API responded with ${response.status}: ${response.statusText}`
      )
    }

    return (await response.json()) as GHAutolink[]
  } catch (error) {
    console.error(error)
    return []
  }
}
