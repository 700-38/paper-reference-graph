import Redis from "ioredis"
const redis = new Redis({port:6379, host:"main.thegoose.work", password:"noobspark"})

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
//    GRAPH.QUERY "ds-paper" "MATCH path = (p1:Paper {scopusId: '85084844698'})-[:reference*0..2]->(p2) RETURN DISTINCT p1.title, p2.title"
// redis.call('GRAPH.QUERY', 'graph', `MATCH`).then(res=>console.log(res))
// const d =[{title: Alex, age: 35}, {title: Alex, age: 35}, {title: Alex, age: 35}, {title: Jun, age: 33}, {title: Alex, age: 35}, {title: Jun, age: 33}]

// GRAPH.QUERY "ds-paper" "MATCH path = (p1:Paper {scopusId: '85084844698'})-[:reference*]->(p2) UNWIND relationships(path) as rel WITH startNode(rel) AS a, endNode(rel) AS b  RETURN DISTINCT a.title, b.title"