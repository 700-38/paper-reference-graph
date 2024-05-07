import redis
from redis.commands.graph.edge import Edge
from redis.commands.graph.node import Node

# Connect to a database
r = redis.Redis(host="ds-redis.orb.local", port="6379")

# Create nodes that represent users
users = {   
        "Alex": Node(label="Person", properties={"name": "Alex", "age": 35}),
        "Jun": Node(label="Person", properties={"name": "Jun", "age": 33}),
        "Taylor": Node(label="Person", properties={"name": "Taylor", "age": 28}),
        "Noor": Node(label="Person", properties={"name": "Noor", "age": 41}),
        "Sara": Node(label="Person", properties={"name": "Sara", "age": 22}),
        "Liam": Node(label="Person", properties={"name": "Liam", "age": 29}),
        "Emma": Node(label="Person", properties={"name": "Emma", "age": 31}),
        "Olivia": Node(label="Person", properties={"name": "Olivia", "age": 27}),
        }
city = {
    "Bangkok": Node(label="City", properties={"name": "Bangkok", "population": 8_280_925}),
    "Tokyo": Node(label="City", properties={"name": "Tokyo", "population": 9_273_000}),
    "New York": Node(label="City", properties={"name": "New York", "population": 8_336_817}),
}

# Define a graph called SocialMedia
social_graph = r.graph("SocialMedia")
# social_graph.delete()
# Add users to the graph as nodes
for key in users.keys():
    social_graph.add_node(users[key])
for key in city.keys():
    social_graph.add_node(city[key])

# Add relationships between user nodes
social_graph.add_edge( Edge(users["Alex"], "friends", users["Jun"]) )
# Make the relationship bidirectional
# social_graph.add_edge( Edge(users["Jun"], "friends", users["Alex"]) )

social_graph.add_edge( Edge(users["Jun"], "friends", users["Taylor"]) )
# social_graph.add_edge( Edge(users["Taylor"], "friends", users["Jun"]) )

social_graph.add_edge( Edge(users["Jun"], "friends", users["Noor"]) )
# social_graph.add_edge( Edge(users["Noor"], "friends", users["Jun"]) )

social_graph.add_edge( Edge(users["Alex"], "friends", users["Noor"]) )
# social_graph.add_edge( Edge(users["Noor"], "friends", users["Alex"]) )

social_graph.add_edge( Edge(users["Alex"], "live_in", city["Tokyo"]) )
social_graph.add_edge( Edge(users["Sara"], "live_in", city["Bangkok"]) )
social_graph.add_edge( Edge(users["Liam"], "live_in", city["New York"]) )
social_graph.add_edge( Edge(users["Emma"], "live_in", city["Bangkok"]) )
social_graph.add_edge( Edge(users["Olivia"], "live_in", city["Tokyo"]) )
social_graph.add_edge( Edge(users["Taylor"], "live_in", city["New York"]) )
social_graph.add_edge( Edge(users["Noor"], "live_in", city["Bangkok"]) )
social_graph.add_edge( Edge(users["Jun"], "live_in", city["Tokyo"]))
social_graph.add_edge( Edge(users["Alex"], "live_in", city["Tokyo"]))


# Create the graph in the database
social_graph.commit()

# Query the graph to find out how many friends Alex has
result1 = social_graph.query("""
                             MATCH path = (p1:Person {name: 'Alex'})-[:friends*1..4]->(p2) 
                             UNWIND relationships(path) as rel
                             WITH startNode(rel) AS a, endNode(rel) AS b 
                             RETURN DISTINCT 
                                a.name, b.name, b.age
                            """)
print("Alex's original friend count:", result1.result_set)
result1.result_set

# # Delete a relationship without deleting any user nodes
# social_graph.query("MATCH (:Person {name: 'Alex'})<-[f:friends]->(:Person {name: 'Jun'}) DELETE f")

# Query the graph again to see Alex's updated friend count
# result2 = social_graph.query("MATCH (p1:Person {name: 'Alex'})-[:friends]->(p2:Person) RETURN count(p2)")
# print("Alex's updated friend count:", result2.result_set)

# Delete the entire graph
# social_graph.delete()