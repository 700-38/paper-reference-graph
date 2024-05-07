import axios from "axios"
import type { TAbsRetRes } from "./types"
export enum EScopusError {
  NOT_FOUND = "NOT_FOUND",
  INVALID_ID = "INVALID_ID",
  UNKNOWN = "UNKNOWN",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",
}
export async function getPaperRef(scopus_id: string): Promise<TAbsRetRes|null|EScopusError.TOO_MANY_REQUESTS> {
  const url = "http://api.elsevier.com/content/abstract/scopus_id/" +
  scopus_id +
  "?httpAccept=application/json&view=REF"
  const res = await axios.get<TAbsRetRes>(url,{
    headers: {
      "X-ELS-APIKey": "dfc8b19d1f4edc507876504de0b42b17",
    },
  }).then((r)=>r.data).catch((err) => {

    if (err.response.status === 429) {
      return EScopusError.TOO_MANY_REQUESTS
    } else {
      console.error(err)
    }
    return null})

  return res
}

const addNode = () => {
  // scopusId, title, field, latitude, longtitude, author, year, referenced_by
  // redis.call('GRAPH.CREATENODE', 'graph', 'label')
  // redis.graph
}
