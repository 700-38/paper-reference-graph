import sys
import time
import pandas as pd
import pydeck as pdk
import altair as alt
import requests
import streamlit as st
import streamlit.components.v1 as components
from get_coordinates import CoordinatesGenerator

gen = CoordinatesGenerator()

sys.stdout.reconfigure(encoding="utf-8")
sys.stdin.reconfigure(encoding="utf-8")

src = "https://gephi.org/gephi-lite/"
search_keyword_result = []
search_network_graph = []

loading = False
show_keyword_result = False
is_search_network_graph = False
# api_endpoint = "http://192.168.40.97:3000"
api_endpoint = "http://localhost:3000"

def request_gephi(scopus_id,depth):
    # Update the Gephi iframe source based on Scopus ID (assuming a specific URL format)
    if(scopus_id == "" or depth == ""):
        return
    global src,show_keyword_result,is_search_network_graph,loading
    loading = True
    try:
        data = requests.get(f"{api_endpoint}/generate/{scopus_id}?depth={depth}").content.decode('utf-8')
        print('data:',data)
        if data["success"] == True:
            src = f"https://gephi.org/gephi-lite/?file=https%3A%2F%2Fgexf.net%2Fdata%2Fhello-world.gexf"
            loading = False
            show_keyword_result = False
            is_search_network_graph = True
            return
    except:
        i = 0
        while True:
            i += 1
            try:
                if i > 11:
                    print('1 minute passed, break')
                    break
                status = requests.get(f"{api_endpoint}/status/{scopus_id}?depth={depth}").content.decode('utf-8')
                print(status)
                if status == 'true':
                    data = requests.get(f"{api_endpoint}/generate/{scopus_id}?depth={depth}").json()
                    src = data["uri"]
                    # src = f"https://gephi.org/gephi-lite/?file=https%3A%2F%2Fgexf.net%2Fdata%2Fhello-world.gexf"
                    break
                print('retry1')
                time.sleep(5)
            except:
                print("retry2")
                print(i);
                time.sleep(5)
        
    # src = f"https://gephi.org/gephi-lite/?file=https%3A%2F%2Fgexf.net%2Fdata%2Fhello-world.gexf&scopus_id={scopus_id}&depth={depth}"
    # loading = False
    # show_keyword_result = False
    # is_search_network_graph = True

def search_by_keyword(keyword_search):
    global show_keyword_result, is_search_network_graph, search_keyword_result
    search_keyword_result = requests.get(f"{api_endpoint}/search?search={keyword_search}").json()
    print(search_keyword_result)
    # src = f"https://gephi.org/gephi-lite/?file=https%3A%2F%2Fgexf.net%2Fdata%2Fhello-world.gexf&keyword_search={keyword_search}"
    show_keyword_result = True
    is_search_network_graph = False

# Streamlit app configuration
st.set_page_config(
    page_title="Paper Reference Network Visualization",
    page_icon="🪄",
    layout="wide",
)

def request_stat():
    data = requests.get(f"{api_endpoint}/stat").json()
    print(data)
    df_paper = pd.DataFrame(data["paper"])
    df_field = pd.DataFrame(data["field"])
    df_year = pd.DataFrame(data["year"])
    return (df_paper, df_field, df_year)
    

# Sidebar with Scopus ID input
with st.sidebar:
    st.header("Search Paper Reference")
    
    st.subheader("Enter Scopus ID")
    scopus_id = st.text_input(
        "scopus id", value="", key="scopus_id", label_visibility="collapsed"
    )
    
    st.subheader("Enter Depth")
    depth = st.text_input(
        "depth", value="", key="depth", label_visibility="collapsed"
    )

    if st.button("Search", type="primary",):
        request_gephi(scopus_id,depth)
        
    st.write("or")
      
    st.subheader("Try to search by keyword")
    keyword_search = st.text_input(
        "keyword search", value="", key="keyword_search", label_visibility="collapsed"
    )
    if st.button("Search keyword", type="primary"):
        search_by_keyword(keyword_search)
        # st.rerun()

# Display Gephi visualization
st.header("Paper Reference Network Visualization")

if show_keyword_result:
    st.subheader("Keyword search result")
    st.write("you can select the paper to visualize the reference network by copy the scopus ID and search!")
    st.table(data=search_keyword_result, )
else:
    if not is_search_network_graph:
        # Get stats
        df_paper, df_field, df_year = request_stat()

        # Bar charts for top 10 most cited papers
        st.subheader("Top 10 The Most Cited Papers")
        paper_chart = alt.Chart(df_paper).mark_bar().encode(
            x=alt.X("scopusId:N", sort="-y", title="Scopus IDs"),
            y=alt.Y("citation_count:Q", title="Citations"),
            tooltip=["scopusId", "title", "citation_count"],
        ).properties(width=600, height=400)
        st.altair_chart(paper_chart, use_container_width=True)

        # Bar charts for top 10 most cited fields
        st.subheader("Top 10 The Most Cited Fields")
        field_chart = alt.Chart(df_field).mark_bar().encode(
            x=alt.X("field:N", sort="-y", title="Field"),
            y=alt.Y("citation_count:Q", title="Citations"),
            tooltip=["field", "citation_count"],
        ).properties(width=600, height=400)
        st.altair_chart(field_chart, use_container_width=True)

        # Bar charts for top 10 most cited years
        st.subheader("Top 10 The Most Cited Years")
        year_chart = alt.Chart(df_year).mark_bar().encode(
            x=alt.X("year:N", sort="-y", title="Year"),
            y=alt.Y("citation_count:Q", title="Citations"),
            tooltip=["year", "citation_count"],
        ).properties(width=600, height=400)
        st.altair_chart(year_chart, use_container_width=True)
    else :   
        if loading:
            st.write("Loading...")
        else: 
            components.iframe(
            src=src,
            height=800,
            scrolling=True,
        )
            
            df_map = pd.DataFrame(columns=['scopusId', 'latitude', 'longitude'])
            for r in search_network_graph:
                for city in r['city'].split(','):
                    coordinates = gen.get_coordinates(city)
                    if coordinates:
                        for r in search_network_graph:
                            if coordinates:
                                new_record = {'scopusId': r['scopusId'], 'latitude': coordinates[0], 'longitude': coordinates[1]}
                                df_map = df_map.append(new_record, ignore_index=True)
        
################################################################
# @st.cache_data
# def load_data(url):
#     data = pd.read_csv(url)
#     return data

# df = load_data('./mockdat.csv')

# df['one']=1
# print(df.head())
# print(df.shape)

# #map
# def color(rain):
#     return [int(255*(1-rain)), int(255*rain), 0, 150]

# df_map = df.groupby(['la', 'long'])['one'].sum().reset_index()
# print(df_map.head())
# print(df_map.shape)
# df_map['color'] = df_map['one'].apply(lambda x: color(x))

# st.write("### Map")
# layer = pdk.Layer(
#     'ScatterplotLayer',
#     data=df_map,
#     get_position=['long', 'la'],
#     get_radius='one * 30000',
#     get_fill_color='color',
# )
# view_state = pdk.ViewState(latitude=df['la'].mean(), longitude=df['long'].mean(), zoom=1)
# st.pydeck_chart(pdk.Deck(layers=[layer], initial_view_state=view_state))

# def authorcount(author):
#     return len(author.strip(',').split(','))
    

# c1, c2 = st.columns(2)

# with c1:
#     # Show paper count
#     st.write("### Paper Count")
#     paper_count = df.shape[0]  # Total number of papers
#     st.write(f"Number of Papers: {paper_count}")

# with c2:
#     # Show author count
#     st.write("### Author Count")
#     author_count = df['author'].apply(authorcount).sum()  # Total number of authors
#     st.write(f"Number of Authors: {author_count}")