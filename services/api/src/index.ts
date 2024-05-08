import { Elysia, t } from "elysia"
import { swagger } from "@elysiajs/swagger"
import Redis from "ioredis"
import axios from "axios"
import queue from "./queue"
import { EQueue } from "@config/amqp"
import { SearchEntry, TSearchResults } from "./search"

const redis = new Redis(6379, "ds-redis.orb.local")
// const queue = new mqConnection()
queue.connect()

const sendPaperQuery = async (scopusId: string, depth: number) => {
  queue.sendToQueue(EQueue.QUERY_QUEUE, { scopusId, depth })
}

const searchPaper = async (search: string): Promise<SearchEntry[] | null> => {
  const url =
    "http://api.elsevier.com/content/search/scopus?query=affil(Chulalongkorn University) AND " +
    search
  const res = await axios
    .get<TSearchResults>(url, {
      headers: {
        "X-ELS-APIKey": "dfc8b19d1f4edc507876504de0b42b17",
      },
    })
    .then((r) => r.data)
    .catch((err) => {
      return null
    })
  console.log(res?.["search-results"]?.entry)
  if (res?.["search-results"]?.entry[0]?.error) {
    return null
  }
  const entryList: SearchEntry[] | undefined = res?.[
    "search-results"
  ]?.entry.map((entry) => {
    console.log(entry["dc:identifier"])
    return {
      title: entry["dc:title"],
      scopusId: entry["dc:identifier"].split(":")[1],
    } as SearchEntry
  })
  if (!entryList) {
    return null
  }
  return entryList
}

const app = new Elysia()
  .use(swagger())
  .get("/", () => "Hello Elysia")
  .get("/ping", () => "pong")
  .get(
    "/search",
    (req) => {
      const search = req.query.search
      if (!search) {
        return "Invalid search"
      }
      const res = searchPaper(search)
      if (!res) {
        return "No result found"
      }
      return res
    },
    {
      query: t.Object({
        search: t.String(),
      }),
    }
  )
  .get("/generate/:scopusId", (req) => {
    const paper = req.params.scopusId
    const depth = parseInt(req.query.depth ?? "") || 10
    sendPaperQuery(paper, depth)
    // queue.sendToQueue(EQueue.DBWRITE_QUEUE, { scopusId: paper, depth })
    
    return `You are looking for paper with ID: ${paper}`
  })
  .get("/status/:scopusId", async (req) => {
    redis.get(req.params.scopusId)
    return "Status"
  })
app.listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
