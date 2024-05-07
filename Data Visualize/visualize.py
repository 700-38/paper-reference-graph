import sys
import requests
import streamlit as st
import streamlit.components.v1 as components

sys.stdout.reconfigure(encoding="utf-8")
sys.stdin.reconfigure(encoding="utf-8")

src = "https://gephi.org/gephi-lite/"

def request_gephi(scopus_id,depth):
    # Update the Gephi iframe source based on Scopus ID (assuming a specific URL format)
    global src
    data = requests.get("https://jsonplaceholder.typicode.com/todos/1").json()
    src = f"https://gephi.org/gephi-lite/?file=https%3A%2F%2Fgexf.net%2Fdata%2Fhello-world.gexf&scopus_id={scopus_id}&depth={depth}"

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

# Display Gephi visualization
components.iframe(
    src=src,
    height=800,
    scrolling=True,
)

st.code(src)

st.subheader("")
