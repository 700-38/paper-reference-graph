import mqConnection from "./lib/queue"
import Redis from "ioredis"
import type { Connection, Channel, ConsumeMessage } from "amqplib"
import { EScopusError, getPaperAbstract } from "./lib/scopus"
import { EQueue } from "@config/amqp"
const redis = new Redis({port:6379, host:"main.thegoose.work", password:"noobspark"})
// const graphRedis = new Redis({
//   host: "main.thegoose.work",
//   port: 6379,
//   db: 1,
// })
const graphRedis = new Redis({port:6379, host:"main.thegoose.work", password:"noobspark"})
// const grpahRed

const handleIncomingQuery = async (cmsg: ConsumeMessage, ch: Channel) => {
  const msg = cmsg.content.toString()
  try {
    const parsedMessage = JSON.parse(msg)
    const { scopusId, depth, parentNode } = parsedMessage
    if (!scopusId) {
      console.error(`Invalid Scopus ID`)
      return ch.ack(cmsg)
    }
    const status = parseInt((await redis.get(scopusId)) ?? "-1")
    if (status >= depth) {
      return ch.ack(cmsg)
    } else if (status > 0) {
      try {
        const currentEndNode: any = await graphRedis.call(
          "GRAPH.QUERY",
          "ds-paper",
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
    const paperData = await getPaperAbstract(scopusId)
    if (!paperData) {
      console.error(`Error while fetching paper data`)
      return ch.ack(cmsg)
    }
    if (paperData === EScopusError.NOT_FOUND) {
      return ch.ack(cmsg)
    } else if (paperData === EScopusError.TOO_MANY_REQUESTS) {
      // mqConnection.write(EQueue.QUERY_QUEUE, {
      //   parentNode: parentNode,
      //   scopusId: scopusId,
      //   depth: depth,
      // })

      return ch.nack(cmsg)
    }
    // console.log(paperData["abstracts-retrieval-response"].affiliation)
    if (!Array.isArray(paperData["abstracts-retrieval-response"].affiliation)) {
      paperData["abstracts-retrieval-response"].affiliation = [
        paperData["abstracts-retrieval-response"].affiliation,
      ]
    }
    const paperNode = {
      scopusId: scopusId,
      title: paperData["abstracts-retrieval-response"].coredata["dc:title"],
      field: paperData["abstracts-retrieval-response"]["subject-areas"][
        "subject-area"
      ].map((a) => a.$),
      country:
        paperData["abstracts-retrieval-response"]?.affiliation.map(
          (a) => a?.["affiliation-country"] ?? ""
        ) ?? [],
      city:
        paperData["abstracts-retrieval-response"]?.affiliation.map(
          (a) => a?.["affiliation-city"] ?? ""
        ) ?? [],
      author: paperData["abstracts-retrieval-response"].authors.author.map(
        (a) => a?.["ce:indexed-name"] ?? ""
      ),
      date: paperData["abstracts-retrieval-response"].coredata[
        "prism:coverDate"
      ],
    }
    if (status < 0) {
      const querystr = `
      MERGE (a: Paper {scopusId: "${scopusId}"})
      ON CREATE SET a.title = "${
        paperNode.title
      }", a.field = "${paperNode.field.join(
        ","
      )}", a.country = "${paperNode.country.join(
        ","
      )}", a.city = "${paperNode.city.join(
        ","
      )}", a.author = "${paperNode.author.join(",")}", a.date = "${
        paperNode.date
      }"
      `
      // console.log(querystr)
      graphRedis.call("GRAPH.QUERY", "ds-paper", querystr)
    }
    if (depth > 1) {
      const refList = []
      if (
        !!paperData["abstracts-retrieval-response"]?.item?.bibrecord?.tail
          ?.bibliography?.reference
      ) {
        try {
          if (
            !Array.isArray(
              paperData["abstracts-retrieval-response"]?.item?.bibrecord?.tail
                ?.bibliography?.reference
            )
          ) {
            paperData[
              "abstracts-retrieval-response"
            ].item.bibrecord.tail.bibliography.reference = [
              paperData["abstracts-retrieval-response"].item.bibrecord.tail
                .bibliography.reference,
            ]
          }
          paperData[
            "abstracts-retrieval-response"
          ].item.bibrecord.tail.bibliography.reference.forEach((ref) => {
            if (!ref?.["ref-info"]?.["refd-itemidlist"]) {
              return
            }
            if (!Array.isArray(ref["ref-info"]["refd-itemidlist"].itemid)) {
              ref["ref-info"]["refd-itemidlist"].itemid = [
                ref["ref-info"]["refd-itemidlist"].itemid,
              ]
            }
            try {
              const sgr = ref["ref-info"]["refd-itemidlist"].itemid.find(
                (item: any) => item["@idtype"] === "SGR"
              )?.$
              if (sgr) {
                mqConnection.write(EQueue.QUERY_QUEUE, {
                  parentNode: scopusId,
                  scopusId: sgr,
                  depth: depth - 1,
                })
              }
            } catch (error) {
              console.log(ref["ref-info"]["refd-itemidlist"])
              console.log(error)
              console.error(`Error while fetching references`)
            }
          })
        } catch (error) {
          console.log(error)
          console.log(
            paperData["abstracts-retrieval-response"].item.bibrecord?.tail
              ?.bibliography?.reference
          )
          console.error(`Error while fetching references`)
        }
      }
      // mqConnection.write(EQueue.QUERY_QUEUE, {
      //   parentNode: scopusId,
      //   scopusId: sgr,
      //   depth: depth - 1,
      // })
    }
    // if (parentNode) {
    //   redis.call('GRAPH.QUERY', 'graph', `MATCH (a {scopusId: "${scopusId}"}), (b {scopusId: "${parentNode}"}) CREATE (a)-[:REFERENCED_BY]->(b)`)
    // }
    // redis.call("GRA")
    // const paperNode = {
    //   scopusId: scopusId,
    //   title: paperRef["abstracts-retrieval-response"].coredata.dc.title,
    //   field: paperRef["abstracts-retrieval-response"].coredata["prism:aggregationType"],
    // }
    console.log("still alive")
    if (parentNode) {
      // mqConnection.write(EQueue.DBWRITE_QUEUE, {
      //   parentId: parentNode,
      //   paperRef: paperNode,
      //   depth: depth,
      // })
      const querystr2 = `
      MATCH (a: Paper {scopusId: "${parentNode}"}), (b: Paper {scopusId: "${scopusId}"})
      CREATE (a)-[:reference]->(b)`
      // console.log(querystr2)
      graphRedis.call("GRAPH.QUERY", "ds-paper", querystr2)
      redis.set(scopusId, depth)
    }

    // console.log(paperRef)
  } catch (error) {
    console.log(error)
    console.log(JSON.stringify(error))
    console.error(`Error While Parsing the message`)
  }
  return ch.ack(cmsg)
}

const listen = async () => {
  await mqConnection.connect()

  await mqConnection.consumeQuery(handleIncomingQuery)
  console.log(`🚀 Listening to incoming queries`)
}

listen()

