import mqConnection from "./lib/queue";


const handleIncomingQuery = (msg: string) => {
  try {

    const parsedMessage = JSON.parse(msg);

    console.log(`Received Notification`, parsedMessage);

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
