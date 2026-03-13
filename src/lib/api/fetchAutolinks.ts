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

    const allAutolinks: GHAutolink[] = []

    const initialUrl = new URL(GITHUB_AUTOLINKS_URL)
    // Use a high per_page to reduce the number of requests; GitHub typically allows up to 100.
    initialUrl.searchParams.set("per_page", "100")

    let nextUrl: URL | null = initialUrl

    while (nextUrl) {
      const response = await fetch(nextUrl.toString(), {
        headers,
      })

      if (!response.ok) {
        throw new Error(
          `GitHub API responded with ${response.status}: ${response.statusText}`
        )
      }

      const pageData = (await response.json()) as GHAutolink[]
      allAutolinks.push(...pageData)

      const linkHeader = response.headers.get("link")
      let newNextUrl: URL | null = null

      if (linkHeader) {
        const links = linkHeader.split(",")
        for (const link of links) {
          const [urlPart, relPart] = link.split(";").map((part) => part.trim())
          if (relPart === 'rel="next"') {
            const match = urlPart.match(/<(.+)>/)
            if (match && match[1]) {
              newNextUrl = new URL(match[1])
            }
            break
          }
        }
      }

      nextUrl = newNextUrl
    }

    return allAutolinks
  } catch (error) {
    console.error(error)
    return []
  }
}
