import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import Redis from "ioredis";
import axios from "axios";
import queue from "./queue";
import { EQueue, redisHost } from "@config/amqp";
import { SearchEntry, TSearchResults } from "./search";
import { sleep } from "bun";

const redis = new Redis({
  port: 6379,
  username: "default",
  host: redisHost,
  password: "noobspark",
  showFriendlyErrorStack: process.env.NODE_ENV !== "production",
});
redis.on("error", function (error) {
  console.log(error);
});
// sleep(5000).then(()=>{
//   console.log(redis.status)
// })
// var rdping = setInterval(function () {
//   redis.ping(console.log);
// }, 1000);

redis.set("foo", "bar");
// const queue = new mqConnection()
queue.connect();

const sendPaperQuery = async (scopusId: string, depth: number) => {
  queue.sendToQueue(EQueue.QUERY_QUEUE, { scopusId, depth });
};

const sendGenerateTask = async (scopusId: string, depth: number) => {
  queue.sendToQueue(EQueue.GENERATE_QUEUE, { scopusId, depth });
};

const searchPaper = async (search: string): Promise<SearchEntry[] | null> => {
  const url =
    "http://api.elsevier.com/content/search/scopus?query=affil(Chulalongkorn University) AND " +
    search;
  const res = await axios
    .get<TSearchResults>(url, {
      headers: {
        "X-ELS-APIKey": "dfc8b19d1f4edc507876504de0b42b17",
      },
    })
    .then((r) => r.data)
    .catch((err) => {
      return null;
    });
  console.log(res?.["search-results"]?.entry);
  if (res?.["search-results"]?.entry[0]?.error) {
    return null;
  }
  const entryList: SearchEntry[] | undefined = res?.[
    "search-results"
  ]?.entry.map((entry) => {
    console.log(entry["dc:identifier"]);
    return {
      title: entry["dc:title"],
      scopusId: entry["dc:identifier"].split(":")[1],
    } as SearchEntry;
  });
  if (!entryList) {
    return null;
  }
  return entryList;
};

// Function to convert array of arrays into array of objects
const convertToObjects = (header: string[], data: any[][]) => {
  if (data.length > 0 && header.length === data[0].length)
    return data.map((row) => {
      const obj: any = {};
      header.forEach((key, index) => {
        if (key.includes(".")) {
          const keyName = key.split(".")[1]; // Remove the 'p.' prefix
          obj[keyName] = row[index];
        } else {
          obj[key] = row[index];
        }
      });
      return obj;
    });
};

const app = new Elysia()
  .use(swagger())
  .get("/", () => "Hello Elysia")
  .get("/ping", () => "pong")
  .get(
    "/search",
    (req) => {
      const search = req.query.search;
      if (!search) {
        return "Invalid search";
      }
      const res = searchPaper(search);
      if (!res) {
        return "No result found";
      }
      return res;
    },
    {
      query: t.Object({
        search: t.String(),
      }),
    }
  )
  .get(
    "/generate/:scopusId",
    (req) => {
      const paper = req.params.scopusId;
      const depth = parseInt(req.query.depth ?? "") || 10;
      console.log(paper, depth);
      sendPaperQuery(paper, depth);
      // queue.sendToQueue(EQueue.DBWRITE_QUEUE, { scopusId: paper, depth })

      return `You are looking for paper with ID: ${paper}`;
    },
    {
      query: t.Object({
        depth: t.String(),
      }),
    }
  )
  .get(
    "/status/:scopusId",
    async (req) => {
      const depth = parseInt(req.query.depth ?? "") || 10;
      const statusKey = `status:${req.params.scopusId}:${depth}`;
      const cachedStatus = await redis.get(statusKey);
      console.log("cachedStatus", cachedStatus);
      if (cachedStatus === "OK") {
        const cachedData = await redis.get(
          `data:${req.params.scopusId}:${depth}`
        );
        return cachedData;
      }
      // else if (cachedStatus === "GENERATING") {
      //   return "Generating"
      // }
      else {
        const queryStatus: any = await redis.call(
          "GRAPH.QUERY",
          "ds-paper",
          `
        MATCH (startNode: Paper {scopusId: '${req.params.scopusId}'})-[:reference*${depth}]->(otherNode)
        RETURN count(*) > 0 AS has_connection
      `
        );
        console.log(queryStatus?.[1]?.[0]?.[0]);
        if (queryStatus?.[1]?.[0]?.[0] === "true") {
          sendGenerateTask(req.params.scopusId, depth);
          redis.set(statusKey, "GENERATING");
          return "Generating";
        }
      }
      return "Querying";
    },
    {
      query: t.Object({
        depth: t.String(),
      }),
    }
  )
  .get("/stat", async (req) => {
    const topPaperCited: any = await redis.call(
      "GRAPH.QUERY",
      "ds-paper",
      "MATCH (p:Paper)<-[r]-() WHERE p.title IS NOT NULL RETURN p.scopusId, p.title, p.field, p.date, COUNT(r) AS citation_count ORDER BY citation_count DESC LIMIT 10"
    );

    // Convert to array of objects
    const paper = convertToObjects(topPaperCited[0], topPaperCited[1]);

    const topFieldCited: any = await redis.call(
      "GRAPH.QUERY",
      "ds-paper",
      "MATCH (p:Paper)<-[r]-() WHERE p.field IS NOT NULL WITH p.field AS field, COUNT(r) AS citation_count RETURN field, citation_count ORDER BY citation_count DESC LIMIT 10"
    );

    // Convert to array of objects
    const field = convertToObjects(topFieldCited[0], topFieldCited[1]);

    const topYearCited: any = await redis.call(
      "GRAPH.QUERY",
      "ds-paper",
      "MATCH (p:Paper)<-[r]-() WHERE p.date IS NOT NULL WITH SUBSTRING(p.date, 0, 4) AS year, COUNT(r) AS citation_count RETURN year, citation_count ORDER BY citation_count DESC LIMIT 10"
    );

    // Convert to array of objects
    const year = convertToObjects(topYearCited[0], topYearCited[1]);

    return {
      paper,
      field,
      year,
    };
  })
  .get("/all-city", async (req) => {
    const allCity: any = await redis.call(
      "GRAPH.QUERY",
      "ds-paper",
      "MATCH (p:Paper) WHERE p.country IS NOT NULL AND p.city IS NOT NULL RETURN DISTINCT p.city"
    );
    return allCity;
  });

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
