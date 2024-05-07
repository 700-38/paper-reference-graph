import pika
import os, sys

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters('some-rabbit.orb.local'))
    channel = connection.channel()
    channel.queue_declare(queue='generate-queue')


    def callback(ch, method, properties, body):
        print(f" [x] Received {body}")


    channel.basic_consume(queue='generate-queue',
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