import pika 
import os, sys
import json
def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters('some-rabbit.orb.local'))
    channel = connection.channel()
    channel.queue_declare(queue='dbwrite-queue')


    def callback(ch, method, properties, body):
        data = json.loads(body)
        print(f" [x] Received {data}")


    channel.basic_consume(queue='dbwrite-queue',
                        auto_ack=True,
                        on_message_callback=callback)
    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()
if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)