import { Elysia } from "elysia"

import {Kafka } from "kafkajs"
import Redis from "ioredis"

import queue from "./queue"
import { EQueue } from "../../../config/amqp"

const redis = new Redis(6379, "ds-redis.orb.local")
// const queue = new mqConnection()
queue.connect()

const sendPaperQuery = async (scopusId: string) => { 
  queue.sendToQueue(
    EQueue.QUERY_QUEUE, { scopusId }
  )
}
const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .get("/ping", () => "pong")
  .get("/search", (req)=>{
    const search = req.query.search
  })
  .get("/query/:scopusId", (req) => {
    const paper = req.params.scopusId 
    sendPaperQuery(paper)
    return `You are looking for paper with ID: ${paper}`
  })
  .get("/generate/:scopusId", async () => {
    // const redisStatus = await redis.ping()
    // return {
    //   redis: redisStatus
    // }
    
  })
app.listen(3000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)

 