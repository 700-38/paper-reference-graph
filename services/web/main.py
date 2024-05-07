import sys
import time
import requests
import streamlit as st
import streamlit.components.v1 as components

sys.stdout.reconfigure(encoding="utf-8")
sys.stdin.reconfigure(encoding="utf-8")

src = "https://gephi.org/gephi-lite/"
search_keyword_result = []

loading = False
show_keyword_result = False
is_search_network_graph = False
api_endpoint = "http://192.168.40.97:3000"

def request_gephi(scopus_id,depth):
    # Update the Gephi iframe source based on Scopus ID (assuming a specific URL format)
    if(scopus_id == "" or depth == ""):
        return
    global src,show_keyword_result,is_search_network_graph,loading
    loading = True
    try:
        data = requests.get(f"{api_endpoint}/generate/{scopus_id}").content.decode('utf-8')
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
                status = requests.get(f"{api_endpoint}/status/{scopus_id}").content.decode('utf-8')
                print(status)
                if status == 'true':
                    data = requests.get(f"{api_endpoint}/generate/{scopus_id}").json()
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
    loading = False
    show_keyword_result = False
    is_search_network_graph = True

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

    if st.button("Search", type="primary"):
        request_gephi(scopus_id,depth)
        # st.rerun()
        
    st.write("or")
      
    st.subheader("Try to search by keyword")
    keyword_search = st.text_input(
        "keyword search", value="", key="keyword_search", label_visibility="collapsed"
    )
    if st.button("Search keyword", type="primary"):
        search_by_keyword(keyword_search)
        # st.rerun()

# Display Gephi visualization
st.subheader("Paper Reference Network Visualization")

if show_keyword_result:
    st.subheader("Keyword search result")
    st.write("you can select the paper to visualize the reference network by copy the scopus ID and search!")
    st.table(data=search_keyword_result, )
else:
    if loading:
        st.write("Loading...")
    else: 
        components.iframe(
        src=src,
        height=800,
        scrolling=True,
    )

st.subheader("The Most Cited Papers")

st.subheader("The Most Cited Fields")

st.subheader("The Most Cited Years")