import networkx as nx
import matplotlib.pyplot as plt
import numpy as np
import redis
from redisgraph import Graph, Node, Edge
PASSWORD = 'noobspark'
r = redis.Redis(host='171.6.103.154', port=6379, password=PASSWORD, decode_responses=True)
redis_graph = Graph('ds-paper', r)
import findspark


import os
# os.environ['PYSPARK_DRIVER_PYTHON'] = "/Users/kuranasaki/.pyenv/shims/python"
os.environ['SPARK_HOME'] = "/opt/homebrew/Cellar/apache-spark/3.5.1/libexec"
findspark.init()

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, explode_outer, udf, max
from pyspark.sql.types import StringType, IntegerType, FloatType, StructType, StructField

import json
from pathlib import Path
import tqdm

spark = SparkSession.builder.master('local').appName('Spark SQL').getOrCreate()
SCHEMA = ['sgr_id', 'parent_id', 'depth', 'title']


def generateQuery(scopus_id, depth=10):
    q = f"""
        MATCH path = (p1:Paper {{scopusId: '{scopus_id}'}})-[:reference*1..{depth}]->(p2)
        UNWIND relationships(path) as rel
        WITH startNode(rel) as a, endNode(rel) as b, length(path) as depth
        RETURN DISTINCT a.scopusId, b.scopusId, depth, b.title
    """
    return q
  
def generateSpark(scopus_id, depth=10):
    q = generateQuery(scopus_id, depth)
    result_set = redis_graph.query(q).result_set
    print(result_set)
    rootTitle = redis_graph.query(f" MATCH (p:Paper {{scopusId: '{scopus_id}'}}) RETURN p.title").result_set[0][0]
    print(scopus_id)
    rdepth = r.get(scopus_id) or 0
    df = spark.createDataFrame([[scopus_id, '', rdepth, rootTitle]], SCHEMA)
    for row in result_set[1::]:
        if (None in row):
              continue
        new_row = [[
            row[1],
            row[0],
            row[2],
            row[3]
        ]]
        df = df.union(spark.createDataFrame(new_row, SCHEMA))
    return df


class GraphGephi:
    def __init__(self, tree):
        self.tree = tree
        self.G = nx.DiGraph()
        self.colours = {
            0: (200, 0, 0),
            1: (7, 87, 91),
            2: (97, 164, 173),
            3: (192, 222, 229)
        }
        self.scaler = 1
    
    def init_graph(self):
        self.tree = self.tree.orderBy('depth', ascending = False)

        # add nodes
        for row in self.tree.collect():
            r, g, b = self.colours[int(row.depth) % len(self.colours)]
            self.G.add_node(row.sgr_id,
                            depth = row.depth,
                            title = row.title,
                            viz = {'color': {'r': r, 'g': g, 'b': b, 'a': 0.8},
                                   'size': self.scaler},
                            )

        # add edges
        for row in self.tree.collect():
            if row.parent_id != '':
                self.G.add_edge(row.parent_id, row.sgr_id)

        # modify node size
        out_degrees = np.array([self.G.out_degree(n) for n in self.G.nodes()])
        maximum = np.max(out_degrees)
        minimum = np.min(out_degrees)

        for node in self.G.nodes():
            if self.G.nodes[node] == {}:
                continue
            self.G.nodes[node]['viz']['size'] = self.scaler * (1 + (self.G.out_degree(node) - minimum) / (maximum - minimum))

    def init_pos(self, random_pos = True):
        if random_pos:
            self.pos = nx.random_layout(self.G)
        else:
            self.pos = {}
            initial_radius = 1
            depth_nodes = {}
            for node in self.G.nodes():
                depth = self.G.nodes[node]['depth']
                if depth not in depth_nodes:
                    depth_nodes[depth] = []
                depth_nodes[depth].append(node)
            for depth, node in depth_nodes.items():
                angle = 2 * np.pi / len(node)
                for i, n in enumerate(node):
                    self.pos[n] = (initial_radius * depth * np.cos(i * angle), initial_radius * depth * np.sin(i * angle))

    def draw(self):
        default_colour = (0.5, 0.5, 0.5)
        colours_norm = {k: tuple([x / 255 for x in v]) for k, v in self.colours.items()}
        used_colours = [colours_norm[int(self.G.nodes[node]['depth']) % len(colours_norm)] if self.G.nodes[node] != {} else default_colour for node in self.G.nodes()]
        nx.draw(self.G, self.pos, node_color=used_colours)
        plt.show()

    def export_gexf(self, path):
        nx.write_gexf(self.G, path)


def createGephi(scopus_id, depth=10):
    df = generateSpark(scopus_id, depth)
    gephi = GraphGephi(df)
    gephi.init_graph()
    gephi.init_pos()
    gephi.draw()
    gephi.export_gexf(f"{scopus_id}-{depth}.gexf")
    return gephi