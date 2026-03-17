import streamlit as st
import requests
from bs4 import BeautifulSoup
import time

# StockFlow Intelligence - SEO Sentinel Core Logic
class SEOSentinel:
    def __init__(self, url):
        self.url = url
        self.start_time = time.time()
        self.results = {"score": 100, "issues": []}

    def analyze(self):
        try:
            response = requests.get(self.url, timeout=10)
            latency = int((time.time() - self.start_time) * 1000)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Metadata Audit
            title = soup.title.string if soup.title else "Missing"
            desc = soup.find("meta", attrs={"name": "description"})
            desc_content = desc["content"] if desc else "Missing"
            
            if title == "Missing": self.results["score"] -= 10
            if desc_content == "Missing": self.results["score"] -= 12
            
            # Heading Audit
            h1s = soup.find_all('h1')
            
            # Image Audit
            images = soup.find_all('img')
            missing_alts = [img.get('src') for img in images if not img.get('alt')]
            
            return {
                "status": response.status_code,
                "latency": latency,
                "title": title,
                "desc": desc_content,
                "h1_count": len(h1s),
                "missing_alts": missing_alts,
                "score": self.results["score"]
            }
        except Exception as e:
            return {"error": str(e)}

# Streamlit UI Configuration
st.set_page_config(page_title="StockFlow SEO Sentinel", page_icon="🛰️")
st.title("🛰️ StockFlow SEO Sentinel")
st.subheader("Autonomous SEO Health Auditing Engine")

target_url = st.text_input("Enter URL to scan:", "https://stockflowai.substack.com/")

if st.button("Run Audit"):
    with st.spinner("Scanning target..."):
        sentinel = SEOSentinel(target_url)
        data = sentinel.analyze()
        
        if "error" in data:
            st.error(f"Scan Failed: {data['error']}")
        else:
            col1, col2, col3 = st.columns(3)
            col1.metric("SEO Score", f"{data['score']}%")
            col2.metric("Latency", f"{data['latency']}ms")
            col3.metric("Status", data['status'])
            
            with st.expander("📋 Detailed Audit Report"):
                st.write(f"**Title:** {data['title']}")
                st.write(f"**Description:** {data['desc']}")
                st.write(f"**H1 Count:** {data['h1_count']}")
                st.write(f"**Images Missing Alt:** {len(data['missing_alts'])}")
