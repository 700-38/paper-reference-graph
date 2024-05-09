// import Redis from "ioredis"
import {createClient} from "redis"
const redis =createClient({url:"redis://main.thegoose.work:6379"})
await redis.connect()
// redis.graph.query
redis.graph.query('graph', `
MATCH path = (p1:Person {name: 'Alex'})-[:friends*1..4]->(p2) 
UNWIND relationships(path) as rel
WITH startNode(rel) AS a, endNode(rel) AS b 
RETURN DISTINCT 
   COLLECT({title: a.name, age: a.age}) AS a,
   COLLECT({title: b.name, age: b.age}) AS b`).then(res=>console.log(res))

// redis.graphQuery('GRAPH.QUERY', 'graph', `MATCH (p1:Person {name: 'Alex'}) RETURN p1`).then(res=>console.log(res))