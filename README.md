# Data Science Project: Starburst Stream

## Project Overview

This project is dedicated to analyzing and visualizing the reference network of papers in the engineering field, utilizing extensive datasets from Scopus. By sourcing both provided and additional data through the Scopus API, we aim to explore the interconnections and influence across academic literature. The project leverages advanced data engineering techniques and visualization processes within a robust service-oriented architecture.

## Repository

[GitHub Repository](https://github.com/700-38/paper-reference-graph)

## Team Members

- Kongphop Chariyasathapond - 6430014321
- Thanakorn Suthamkasem - 6430140721
- Korawut Sirianuntapat - 6432004421
- Punyaphat Surakiatkamjorn - 6432106821

## Agenda

1. Dataset
2. Diagram
3. Process (Data Engineering and Visualization)
4. Challenges
5. Demo

## Dataset

### Base Data

We utilize the full raw Scopus data provided by the CU Office of Academic Resources, covering metadata from 2018 to 2023, which serves as the foundation for constructing the reference network.

### Additional Data

To deepen our analysis and enrich the network, additional data is sourced via the Scopus API. Data attributes include:

- scopusId
- title
- field
- country
- city
- author
- year
- indegree

## Services

### Data Engineering Services

- **Scopus API Service**: Fetches additional data directly from Scopus to augment the reference network.
- **Spark Temporary Storage**: Manages initial data loads and transformations critical for network construction.
- **RedisDB**: Employs the RedisGraph module to create and manage a graph database, essential for storing and querying complex paper citation relationships.
- **RabbitMQ Microservice Orchestrator**: Coordinates distributed tasks and data management across services, crucial for scaling the network analysis.

### Visualization Services

- **Gephi Graph Generator**: Produces GEFX files for visualizing the reference networks in Gephi.
- **Streamlit Visualization**: Provides interactive visualizations of top-cited papers, fields, years, and geospatial data, illustrating the scope and impact within the network.

## Process

### Data Engineering

- Extract and enhance data using the Scopus API, focusing on building comprehensive reference networks.
- Utilize Spark for efficient data handling during the network construction phase.
- Leverage Redis, specifically the RedisGraph module, for high-performance graph data operations.
- Use RabbitMQ to ensure scalability and robustness in data processing across microservices.

### Visualization

Change
8
of 8

Previous change

Next change

Explain

- Use Gephi for detailed visualization of the reference networks, enabled by NetworkX for network data structuring.
- Deploy Streamlit for dynamic, user-interactive visualizations, directly reflecting changes and updates in the reference network.

## How to Run Services

### API Service

Ensure you have [Bun](https://bun.sh/) installed for package management. Then run:

```bash
cd services/api
bun install
bun run dev
```

### Graph Generator

Ensure you have [Poetry](https://python-poetry.org/docs/) installed for managing Python packages. Then run:

```bash
cd services/graph-generator
poetry install
poetry run python main.py
```

### Paper Query Service

```bash
cd services/paper-query
bun install
bun run dev
```

### Streamlit and Visualization

First, navigate to the project directory and run the Streamlit server:

```bash
streamlit run servicesweb/main.py
```

## Video Presentation and Slides

- **YouTube Video**: [Watch the project overview](https://youtu.be/HKs9PnjKTgU)
- **Google Drive Video**: [Download the presentation video](https://drive.google.com/file/d/1OskQcEO15LlRUjg391b4Ky-dPo1_lnDs/view?usp=sharing)
- **Presentation Slides**: [View the slides](https://drive.google.com/file/d/1gf8eh-wFCF5MtY0olr7oFKcjujk43QZ2/view?usp=sharing)
