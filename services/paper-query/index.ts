import mqConnection from "./lib/queue"
import Redis from "ioredis"
import { EScopusError, getPaperRef } from "./lib/scopus"
import { EQueue } from "@config/amqp"
const redis = new Redis(6379, "ds-redis.orb.local")
const graphRedis = new Redis({
  host: "ds-redis.orb.local",
  port: 6379,
  db: 1,
})
// const grpahRed

const handleIncomingQuery = async (msg: string) => {
  try {
    const parsedMessage = JSON.parse(msg)
    const { scopusId, depth, parentNode } = parsedMessage
    if (!scopusId) {
      console.error(`Invalid Scopus ID`)
      return
    }
    const status = parseInt((await redis.get(scopusId)) ?? "-1")
    if (status >= depth) {
      return
    } else if (status > 0) {
      try {
        const currentEndNode: any = await graphRedis.call(
          "GRAPH.QUERY",
          "graph",
          `MATCH (a: Paper {scopusId: "${scopusId}"})-[:reference*${status}]->(b)-[:reference]->(c) RETURN b.scopusId, c.scopusId`
        )
        currentEndNode[1].forEach((element: any) => {
          mqConnection.write(EQueue.QUERY_QUEUE, {
            parentNode: element[0],
            scopusId: element[1],
            depth: depth - status,
          })
        })
      } catch (error) {
        console.error(error)
        console.error(`Error while fetching currentEndNode`)
      }
      // if (currentEndNode.length === 0) {
      //   return
      // }
    }
    const paperRef = await getPaperRef(scopusId)
    if (!paperRef) {
      console.error(`Error while fetching paper reference`)
      return
    }
    console.log(parsedMessage)
    if (paperRef === EScopusError.TOO_MANY_REQUESTS) {
      mqConnection.write(EQueue.QUERY_QUEUE, {
        parentNode: parentNode,
        scopusId: scopusId,
        depth: depth,
      })
      return
    }

    if (depth > 1) {
      paperRef["abstracts-retrieval-response"].references.reference.forEach(
        (ref) => {
          mqConnection.write(EQueue.QUERY_QUEUE, {
            parentNode: scopusId,
            scopusId: ref["scopus-id"],
            depth: depth - 1,
          })
        }
      )
    }
    // if (parentNode) {
    //   redis.call('GRAPH.QUERY', 'graph', `MATCH (a {scopusId: "${scopusId}"}), (b {scopusId: "${parentNode}"}) CREATE (a)-[:REFERENCED_BY]->(b)`)
    // }
    // redis.call("GRA")
    mqConnection.write(EQueue.DBWRITE_QUEUE, {
      parentId: parentNode,
      paperRef: paperRef,
      depth: depth,
    })

    // console.log(paperRef)
  } catch (error) {
    console.error(`Error While Parsing the message`)
  }
}

const listen = async () => {
  await mqConnection.connect()

  await mqConnection.consumeQuery(handleIncomingQuery)
}

listen()

