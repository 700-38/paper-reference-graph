import client from "amqplib";
import type { Connection, Channel, ConsumeMessage } from "amqplib";
import { rmqUser, rmqPass, rmqhost, EQueue } from "@config/amqp";

type HandlerCB = (msg: ConsumeMessage, ch: Channel) => Promise<any>;


class RabbitMQConnection {
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    try {
      console.log(`⌛️ Connecting to Rabbit-MQ Server`);

      this.connection = await client.connect(
        `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672/?heartbeat=0`
      );

      console.log(`✅ Rabbit MQ Connection is ready`);

      this.channel = await this.connection.createChannel();

      console.log(`🛸 Created RabbitMQ Channel successfully`);

      this.connected = true;

    } catch (error) {
      console.error(error);
      console.error(`Not connected to MQ Server`);
    }
  }


  async consumeQuery(handleIncomingNotification: HandlerCB) {

    await this.channel.assertQueue(EQueue.QUERY_QUEUE, {
      durable: true,
    });

    this.channel.consume(
      EQueue.QUERY_QUEUE,
      async (msg) => {
        {
          if (!msg) {
            return console.error(`Invalid incoming message`);
          }
          await handleIncomingNotification(msg, this.channel);
          // this.channel.ack(msg);
        }
      },
      {
        noAck: true,
        // ack: true,
      }
    );

  }

  async write(queue: EQueue, message: any) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  
}

const mqConnection = new RabbitMQConnection();

export default mqConnection;