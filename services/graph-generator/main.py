import pika
import os, sys, io
import json
from graph import createGephi
import boto3
import redis
from redisgraph import Graph, Node, Edge
PASSWORD = 'noobspark'
r = redis.Redis(host='main.thegoose.work', port=6379, password=PASSWORD, decode_responses=True)
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
    connection = pika.BlockingConnection(pika.ConnectionParameters('171.6.111.197'))
    channel = connection.channel()
    channel.queue_declare(queue='generate-queue')


    def callback(ch, method, properties, body):
        data = json.loads(body)
        scopusId = data.get('scopusId')
        depth = data.get('depth')
        
        try:
            r.set(f'status:{scopusId}:{depth}', 'GENERATING')
            print(f" Generating Gephi for {scopusId} with depth {depth}")
            createGephi(scopus_id=scopusId, depth=depth)
            filename = f"{scopusId}-{depth}"
            with open("cache/"+filename+".gexf", 'rb') as f:
                file_content = f.read()
                s3.upload_fileobj(io.BytesIO(file_content), "kuranasaki-01", "ds-proj/"+filename+".gexf")
            ###################################################
            ## GENEARTE CSV OR JSON FILE HERE AND UPLOAD IT ###
            ###################################################
            q = f"""
                MATCH path = (p1:Paper {{scopusId: '{scopusId}'}})-[:reference*0..3]->(p2) 
                RETURN DISTINCT p2.scopusId, p2.title, p2.field, p2.country, p2.city, p2.author, p2.date, indegree(p2)
            """
            result_set = redis_graph.query(q).result_set
            csv = 'scopusId;title;field;country;city;author;date;indegree\n'
            for row in result_set:
                formatted_row = []
                for item in row:
                    item_str = str(item).replace('"', '""')
                    if ',' in item_str or '"' in item_str:
                        item_str = f'"{item_str}"'
                    formatted_row.append(item_str)
                new_row = ';'.join(formatted_row) + '\n'
                csv += new_row
            
            # with open(f"{scopusId}-{depth}.csv", 'w') as f:
            #     f.write(csv)
            csv_byte = csv.encode('utf-8')

            # with open(f"{scopusId}-{depth}.csv", 'rb') as f:
            s3.upload_fileobj(io.BytesIO(csv_byte), "kuranasaki-01", "ds-proj/"+filename+".csv")

            r.set(f'status:{scopusId}:{depth}', 'OK')
            # r.set(f'data:{scopusId}:{depth}'," ก้อน json string ขอองลิงก์เปิดไฟล์")
                
                
            # print(f" [x] Received {gephi}")
        except:
            redis.set(f'status:{scopusId}:{depth}', 'ERROR')
        
        


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