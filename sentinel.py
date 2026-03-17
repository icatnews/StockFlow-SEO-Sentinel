import sys
import requests
from bs4 import BeautifulSoup
import logging
from urllib.parse import urljoin, urlparse
from datetime import datetime
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)

class SEOSentinel:
    def __init__(self, url):
        self.url = url
        self.domain = urlparse(url).netloc
        self.soup = None
        self.response = None
        self.load_time = 0
        self.results = {
            "status": None,
            "title": None,
            "description": None,
            "headings": {"h1": [], "h2": [], "h3": []},
            "images": [],
            "links": []
        }

    def log_ok(self, msg):
        print(f"[\033[92mOK\033[0m] {msg}")

    def log_warn(self, msg):
        print(f"[\033[93mWARN\033[0m] {msg}")

    def log_error(self, msg):
        print(f"[\033[91mERROR\033[0m] {msg}")

    def log_info(self, msg):
        print(f"[\033[94mINFO\033[0m] {msg}")

    def fetch_page(self):
        self.log_info(f"Analyzing: {self.url}")
        start_time = time.time()
        try:
            self.response = requests.get(self.url, timeout=10, headers={'User-Agent': 'StockFlow-Sentinel/1.0'})
            self.load_time = int((time.time() - start_time) * 1000)
            self.results["status"] = self.response.status_code
            if self.response.status_code == 200:
                self.log_ok(f"Status Check: {self.response.status_code}")
                self.soup = BeautifulSoup(self.response.text, 'html.parser')
                return True
            else:
                self.log_error(f"Status Check: {self.response.status_code}")
                return False
        except Exception as e:
            self.log_error(f"Connection failed: {str(e)}")
            return False

    def audit_metadata(self):
        print("\n--- Metadata Audit ---")
        title_tag = self.soup.find('title')
        if title_tag:
            title = title_tag.text.strip()
            self.results["title"] = title
            length = len(title)
            if 30 <= length <= 60:
                self.log_ok(f"Title: '{title}' ({length} chars)")
            else:
                self.log_warn(f"Title: '{title}' ({length} chars) - Recommended 30-60 chars")
        else:
            self.log_error("Title tag missing!")

        desc_tag = self.soup.find('meta', attrs={'name': 'description'})
        if desc_tag:
            desc = desc_tag.get('content', '').strip()
            self.results["description"] = desc
            length = len(desc)
            if 120 <= length <= 160:
                self.log_ok(f"Meta Description: Found ({length} chars)")
            else:
                self.log_warn(f"Meta Description: Found ({length} chars) - Recommended 120-160 chars")
        else:
            self.log_error("Meta description missing!")

    def audit_headings(self):
        print("\n--- Heading Hierarchy ---")
        for h in ['h1', 'h2', 'h3']:
            tags = self.soup.find_all(h)
            self.results["headings"][h] = [t.text.strip() for t in tags]
            count = len(tags)
            
            if h == 'h1':
                if count == 1:
                    self.log_ok(f"H1: Found 1 tag")
                elif count == 0:
                    self.log_error("H1: Missing!")
                else:
                    self.log_warn(f"H1: Found {count} tags (Multiple H1s detected)")
            else:
                self.log_info(f"{h.upper()}: Found {count} tags")

    def audit_images(self):
        print("\n--- Image Audit ---")
        images = self.soup.find_all('img')
        for img in images:
            src = img.get('src', 'Unknown')
            alt = img.get('alt')
            self.results["images"].append({"src": src, "alt": alt})
        
        missing_alt = len([img for img in self.results["images"] if not img["alt"]])
        
        if missing_alt == 0:
            self.log_ok(f"Images: All {len(images)} images have alt attributes")
        else:
            self.log_warn(f"Images: {missing_alt} out of {len(images)} images missing alt attributes")

    def validate_links(self):
        print("\n--- Link Validator ---")
        links = self.soup.find_all('a', href=True)
        for link in links:
            href = link['href']
            text = link.text.strip()
            if not href.startswith('http'):
                href = urljoin(self.url, href)
            
            # For the CLI, we only check the first 10 links to avoid long waits
            status = "Pending"
            if len(self.results["links"]) < 10:
                try:
                    res = requests.head(href, timeout=5, allow_redirects=True)
                    status = str(res.status_code)
                except:
                    status = "Unreachable"
            
            self.results["links"].append({"href": href, "text": text, "status": status})
        
        self.log_info(f"Links: Scanned {len(self.results['links'])} links found on page")

    def calculate_score(self):
        score = 100
        if not self.results["title"] or len(self.results["title"]) < 30: score -= 10
        if not self.results["description"]: score -= 15
        if len(self.results["headings"]["h1"]) != 1: score -= 10
        
        missing_alt = len([img for img in self.results["images"] if not img["alt"]])
        if missing_alt > 0: score -= min(15, missing_alt * 2)
        
        return max(0, score)

    def generate_report(self):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        score = self.calculate_score()
        filename = f"seo-report-{self.domain}.txt"
        
        report = f"==================================================\n"
        report += f"STOCKFLOW PREMIUM SEO AUDIT REPORT\n"
        report += f"==================================================\n\n"
        
        report += f"1. EXECUTIVE SUMMARY\n"
        report += f"--------------------------------------------------\n"
        report += f"Target URL: {self.url}\n"
        report += f"SEO Health Score: {score}%\n"
        report += f"Load Latency: {self.load_time}ms\n"
        report += f"Audit Timestamp: {timestamp}\n\n"
        
        report += f"2. METADATA DETAILS\n"
        report += f"--------------------------------------------------\n"
        report += f"Title: {self.results['title'] or 'NOT FOUND'}\n"
        report += f"Meta Description: {self.results['description'] or 'NOT FOUND'}\n\n"
        
        report += f"3. IMAGE AUDIT LIST (MISSING ALT ATTRIBUTES)\n"
        report += f"--------------------------------------------------\n"
        missing_alts = [img for img in self.results["images"] if not img["alt"]]
        if missing_alts:
            for idx, img in enumerate(missing_alts, 1):
                report += f"[{idx}] Source: {img['src']}\n"
        else:
            report += f"No images missing alt attributes found.\n"
        report += f"\n"
        
        report += f"4. HEADING AUDIT LIST\n"
        report += f"--------------------------------------------------\n"
        for tag in ['h1', 'h2', 'h3']:
            headings = self.results["headings"][tag]
            report += f"{tag.upper()} ({len(headings)} found):\n"
            if headings:
                for h in headings:
                    report += f"  - {h}\n"
            else:
                report += f"  - No {tag.upper()} tags detected.\n"
            report += f"\n"
            
        report += f"5. TECHNICAL SPECS (LINK NETWORK)\n"
        report += f"--------------------------------------------------\n"
        if self.results["links"]:
            for idx, link in enumerate(self.results["links"], 1):
                is_external = "EXTERNAL" if urlparse(link['href']).netloc != self.domain else "INTERNAL"
                report += f"[{idx}] [{is_external}] [Status: {link['status']}] {link['href']}\n"
                report += f"    Anchor Text: {link['text'] or '(None)'}\n"
        else:
            report += f"No links detected on the page.\n"
            
        report += f"\n==================================================\n"
        report += f"END OF REPORT - STOCKFLOW INTELLIGENCE\n"
        report += f"==================================================\n"
        
        with open(filename, "w") as f:
            f.write(report)
        
        self.log_ok(f"Detailed report generated: {filename}")

    def run(self):
        if self.fetch_page():
            self.audit_metadata()
            self.audit_headings()
            self.audit_images()
            self.validate_links()
            self.generate_report()
            print("\nAnalysis Complete.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python sentinel.py <url>")
    else:
        url = sys.argv[1]
        if not url.startswith('http'):
            url = 'https://' + url
        sentinel = SEOSentinel(url)
        sentinel.run()
