import Redis from "ioredis"
const redis = new Redis(6379, "ds-redis.orb.local")

redis.call('GRAPH.QUERY', 'SocialMedia', `
MATCH path = (p1:Person {name: 'Alex'})-[:friends*1]->(o)-[:friends]->(p2)
RETURN DISTINCT o.name, p2.name`).then(res=>{
    console.log(res )
    res[1].forEach((element: any) => {
         console.log(element)
    })
   //  const jsonString = res[1][0][0].replace(/([{,])(\s*)([A-Za-z0-9-_]+)(\s*):(\s*)([A-Za-z0-9-_]+)/g, '$1"$3": "$6"');
   //  console.log(jsonString)
   //  const data = JSON.parse(jsonString)
   //  console.log(data)
   })

// redis.call('GRAPH.QUERY', 'graph', `MATCH`).then(res=>console.log(res))
// const d =[{title: Alex, age: 35}, {title: Alex, age: 35}, {title: Alex, age: 35}, {title: Jun, age: 33}, {title: Alex, age: 35}, {title: Jun, age: 33}]