import pika
import os, sys, io
import json
from graph import createGephi
import boto3
import redis
from redisgraph import Graph, Node, Edge
PASSWORD = 'noobspark'
r = redis.Redis(host='171.6.103.154', port=6379, password=PASSWORD, decode_responses=True)
redis_graph = Graph('ds-paper', r)
token = 'vPg_oQQkpbmEGyNzG4FwPpamWnc_yBCxy-D1LU2C'

s3 = boto3.client(
    service_name ="s3",
    endpoint_url = 'https://14a72408b58c4d98260866e378505d77.r2.cloudflarestorage.com',
    aws_access_key_id = '9b1cced29442f3fa18f93e0e35bb7a61',
    aws_secret_access_key = 'ae6a05d3ee90456dafd1431fb96878375e020d4e4953af6f1058e353bfd70a65',
    region_name="auto", # Must be one of: wnam, enam, weur, eeur, apac, auto
)

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters('171.6.103.154'))
    channel = connection.channel()
    channel.queue_declare(queue='generate-queue')


    def callback(ch, method, properties, body):
        data = json.loads(body)
        scopusId = data.get('scopusId')
        depth = data.get('depth')
        print(f" Generating Gephi for {scopusId} with depth {depth}")
        createGephi(scopus_id=scopusId, depth=depth)
        filename = f"{scopusId}-{depth}.gexf"
        with open(filename, 'rb') as f:
            file_content = f.read()
            s3.upload_fileobj(io.BytesIO(file_content), "kuranasaki-01", filename)
        ###################################################
        ## GENEARTE CSV OR JSON FILE HERE AND UPLOAD IT ###
        ###################################################
        # r.set(f'status:{scopusId}:{depth}', 'OK')
        # r.set(f'data:{scopusId}:{depth}'," ก้อน json string ขอองลิงก์เปิดไฟล์")
            
            
        # print(f" [x] Received {gephi}")
        


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