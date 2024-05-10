import sys
import time
import pandas as pd
import pydeck as pdk
import altair as alt
import requests
import streamlit as st
import streamlit.components.v1 as components
from get_coordinates import CoordinatesGenerator
from urllib.parse import quote_plus

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
    global search_network_graph
    # Update the Gephi iframe source based on Scopus ID (assuming a specific URL format)
    if(scopus_id == "" or depth == ""):
        return
    global src,show_keyword_result,is_search_network_graph,loading
    loading = True
    try:
        data = requests.get(f"{api_endpoint}/generate/{scopus_id}?depth={depth}").json()
        print('data:',data)
        if data["status"] == "OK":
            src = f"https://gephi.org/gephi-lite/?file={quote_plus(data['gexf'])}"
            loading = False
            show_keyword_result = False
            is_search_network_graph = True
            return
    except:
        i = 0
        while True:
            i += 1
            try:
                status = requests.get(f"{api_endpoint}/status/{scopus_id}?depth={depth}").json()
                print(status)
                # if status == 'true':
                #     data = requests.get(f"{api_endpoint}/generate/{scopus_id}?depth={depth}").json()
                #     src = data["uri"]
                #     # src = f"https://gephi.org/gephi-lite/?file=https%3A%2F%2Fgexf.net%2Fdata%2Fhello-world.gexf"
                #     break
                if status["status"] == "OK":
                    src = f"https://gephi.org/gephi-lite/?file={quote_plus(status['gexf'])}"
                    search_network_graph = load_data(f"{status['csv']}")
                    # print(search_network_graph)
                    # with open("query.csv", 'w') as file:
                    #     csv.writer(file).writerows(search_network_graph)
                    print(src)
                    loading = False
                    show_keyword_result = False
                    is_search_network_graph = True
                    break
                print('retry1')
                time.sleep(5)
            except Exception as e:
                print(e)
                print("error")
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
    print("keyword")
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

############################################################### 
@st.cache_data
def load_data(url):
    option = {"User-agent": "Mozilla/5.0"}
    data_types = {
    "scopusId": str,  # Example: IDs are usually read as strings
    "title": str,  # Example: Titles are text
    "field": str,  # Example: Fields are also text
    "country": str,  # Example: Country names are strings
    "city": str,  # Example: City names are strings
    "author": str,  # Example: Authors are usually a list of names or a long text
    "date": str,  # Example: Dates should be parsed as datetime
    "indegree": int  # Example: Indegrees are usually numerical
}

    data = pd.read_csv(url, storage_options=option, dtype=data_types)
    print(data.head())
    return data


def request_stat_csv(data):
    filtertop10_paper = pd.DataFrame(data[["scopusId","title","indegree"]].sort_values(by='indegree',ascending=False).head(10))
    filtertop10_field = pd.DataFrame(data[["field","indegree"]].sort_values(by='indegree',ascending=False).head(10))
    filtertop10_year = pd.DataFrame(data[["year","indegree"]].sort_values(by='indegree',ascending=False).head(10))
    return (filtertop10_paper, filtertop10_field, filtertop10_year)

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
            df_csv = search_network_graph
            df_csv.dropna(inplace=True)
            print(df_csv.shape)
            df_csv['year']=df_csv['date'].apply(lambda x: x.split('-')[0])
            
            df_map = pd.DataFrame(columns=['scopusId', 'latitude', 'longitude'])
            for _, r in df_csv.iterrows():  # Use iterrows to iterate over DataFrame rows
                for city in r["city"].split(","):  # Split the city names and trim any whitespace
                    city = city.strip()  # Remove leading/trailing spaces
                    coordinates = gen.get_coordinates(city)  # Get the coordinates for the city
                    if coordinates:
                        # new_record = pd.DataFrame({"scopusId": r["scopusId"], "latitude": coordinates[0], "longitude": coordinates[1]})
                        # df_map = pd.concat([df_map, new_record], ignore_index=True)
                        print({"scopusId": r["scopusId"], "latitude": float(coordinates[0]), "longitude": float(coordinates[1])})
                        df_map.loc[len(df_map)] = {"scopusId": r["scopusId"], "latitude": float(coordinates[0]), "longitude": float(coordinates[1])}
            
            st.write("### Heat Map")
            layer = pdk.Layer(
                'HeatmapLayer',
                data=df_map,
                get_position=['longitude', 'latitude'],
                get_radius='2000',
                pickable=True
            )
            print(df_map)
            view_state = pdk.ViewState(latitude=df_map['latitude'].mean(), longitude=df_map['longitude'].mean(), zoom=1)
            st.pydeck_chart(pdk.Deck(layers=[layer], initial_view_state=view_state,tooltip={"text": "Scopus ID: {scopusId}\nLatitude: {latitude}\nLongitude: {longitude}"}))

            st.write("### Scatter Map")
            layer = pdk.Layer(
                'ScatterplotLayer',
                data=df_map,
                get_position=['longitude', 'latitude'],
                get_radius='80000',
                get_fill_color=[255, 0, 0, 100],
                pickable=True,
            )
            view_state = pdk.ViewState(latitude=df_map['latitude'].mean(), longitude=df_map['longitude'].mean(), zoom=1)
            st.pydeck_chart(pdk.Deck(layers=[layer], initial_view_state=view_state,tooltip={"text": "Scopus ID: {scopusId}\nLatitude: {latitude}\nLongitude: {longitude}"}))


            def authorcount(author):
                return len(author.strip(',').split(','))
                

            c1, c2 = st.columns(2)

            with c1:
                # Show paper count
                st.write("### Paper Count")
                paper_count = df_csv.shape[0]  # Total number of papers
                st.write(f"Number of Papers: {paper_count}")

            with c2:
                # Show author count
                st.write("### Author Count")
                author_count = df_csv['author'].apply(authorcount).sum()  # Total number of authors
                st.write(f"Number of Authors: {author_count}")
            # for r in df_csv:
                # for city in r['city'].split(','):
                #     coordinates = gen.get_coordinates(city)
                #     if coordinates:
                #         for r in search_network_graph:
                #             if coordinates:
                #                 new_record = {'scopusId': r['scopusId'], 'latitude': coordinates[0], 'longitude': coordinates[1]}
                #                 df_map = df_map.append(new_record, ignore_index=True)
        
################################################################
# @st.cache_data
# def load_data(url):
#     data = pd.read_csv(url)
#     return data
            # df_paper_csv, df_field_csv, df_year_csv = request_stat_csv(df_csv)

            # st.subheader("Top 10 The Most Cited Papers")
            # paper_chart_csv = alt.Chart(df_paper_csv).mark_bar().encode(
            #     x=alt.X("scopusId:N", sort="-y", title="Scopus IDs"),
            #     y=alt.Y("citation_count:Q", title="Citations"),
            #     tooltip=["scopusId", "title", "citation_count"],
            # ).properties(width=600, height=400)
            # st.altair_chart(paper_chart_csv, use_container_width=True)

            # st.subheader("Top 10 The Most Cited Fields")
            # field_chart_csv = alt.Chart(df_field_csv).mark_bar().encode(
            #     x=alt.X("field:N", sort="-y", title="Field"),
            #     y=alt.Y("citation_count:Q", title="Citations"),
            #     tooltip=["field", "citation_count"],
            # ).properties(width=600, height=400)
            # st.altair_chart(field_chart_csv, use_container_width=True)

            # st.subheader("Top 10 The Most Cited Years")
            # year_chart_csv = alt.Chart(df_year_csv).mark_bar().encode(
            #     x=alt.X("year:N", sort="-y", title="Year"),
            #     y=alt.Y("citation_count:Q", title="Citations"),
            #     tooltip=["year", "citation_count"],
            # ).properties(width=600, height=400)
            # st.altair_chart(year_chart_csv, use_container_width=True)

        #     components.iframe(
        #     src=src,
        #     height=800,
        #     scrolling=True,
        # )
        
###############################################################
# df_csv['geosize']=1
# print(df_csv.head())
# print(df_csv.shape)

#map
def color(x):
    return [int(255-50*x), int(255-50*x), 0, int(155+10*x)]

# df_map = df_csv.groupby(['latitude', 'longitude'])['geosize'].sum().reset_index()
# print(df_map.head())
# print(df_map.shape)
# df_map['color'] = df_map['geosize'].apply(lambda x: color(x))