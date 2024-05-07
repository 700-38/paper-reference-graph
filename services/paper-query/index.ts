import mqConnection from "./lib/queue";
import axios from "axios"
import type { TAbsRetRes, TServiceErrorRes } from "./lib/scoupusapi"

export async function getPaperRef(scopus_id: string): Promise<TAbsRetRes|null> {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url:
      "http://api.elsevier.com/content/abstract/scopus_id/" +
      scopus_id +
      "?httpAccept=application/json&view=REF",
    headers: {
      "X-ELS-APIKey": "dfc8b19d1f4edc507876504de0b42b17",},
  }
  const url = "http://api.elsevier.com/content/abstract/scopus_id/" +
  scopus_id +
  "?httpAccept=application/json&view=REF"
  const res = await axios.get<TAbsRetRes>(url,{
    headers: {
      "X-ELS-APIKey": "dfc8b19d1f4edc507876504de0b42b17",
    },
  }).then((r)=>r.data).catch((err) => {return null})

  return res
}


const handleIncomingQuery = async (msg: string) => {
  try {

    const parsedMessage = JSON.parse(msg);
    const scopusId = parsedMessage.scopusId;
    if (!scopusId) {
      console.error(`Invalid Scopus ID`);
      return;
    }
    const paperRef = await getPaperRef(scopusId)
    if (!paperRef) {
      console.error(`Error while fetching paper reference`);
      return;
    }
    

    // Implement your own notification flow

  } catch (error) {
    console.error(`Error While Parsing the message`);
  }
};


const listen = async () => {

  await mqConnection.connect();

  await mqConnection.consumeQuery(handleIncomingQuery);
};

listen();
