import asyncio
import re
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional
from lxml import html as lxml_html

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

def _fetch_duckduckgo_lite(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """Performs a synchronous search on DuckDuckGo Lite and extracts text snippets."""
    results = []
    try:
        url = "https://lite.duckduckgo.com/lite/"
        data = urllib.parse.urlencode({"q": query}).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=HEADERS)

        with urllib.request.urlopen(req, timeout=7) as response:
            content = response.read().decode("utf-8", errors="ignore")
            tree = lxml_html.fromstring(content)

            # In duckduckgo lite, results are in table rows
            snippets = tree.xpath('//td[@class="result-snippet"]')
            links = tree.xpath('//a[@class="result-link"]')

            for idx, snip in enumerate(snippets[:max_results]):
                text = " ".join(snip.itertext()).strip()
                # Clean multiple spaces
                text = re.sub(r"\s+", " ", text)
                if not text or len(text) < 15:
                    continue

                title = ""
                if idx < len(links):
                    title = " ".join(links[idx].itertext()).strip()
                    title = re.sub(r"\s+", " ", title)

                results.append({
                    "title": title or f"Market Intelligence ({query[:30]})",
                    "snippet": text,
                    "source_query": query
                })
    except Exception as e:
        print(f"⚠️ Web search warning for query '{query}': {e}")
    return results


async def search_market_intel(
    title: str,
    target_market: str,
    category: str,
    description: str = ""
) -> Dict[str, Any]:
    """
    Executes parallel real-time internet searches for market sizing, TAM/CAGR,
    and competitor dynamics.
    """
    clean_title = re.sub(r"[^\w\s]", "", title).strip()
    clean_cat = re.sub(r"[^\w\s]", "", category).strip()
    clean_market = re.sub(r"[^\w\s]", "", target_market).strip()

    # Formulate 3 distinct search vectors
    q_market = f"{clean_cat} {clean_market} market size TAM CAGR India global 2024 2025".strip()
    q_competitors = f"{clean_title} {clean_cat} {clean_market} competitors startups brands alternatives".strip()
    q_pricing = f"{clean_cat} {clean_market} pricing willingness to pay SaaS subscription".strip()

    loop = asyncio.get_event_loop()

    # Run searches concurrently in executor
    tasks = [
        loop.run_in_executor(None, _fetch_duckduckgo_lite, q_market, 4),
        loop.run_in_executor(None, _fetch_duckduckgo_lite, q_competitors, 4),
        loop.run_in_executor(None, _fetch_duckduckgo_lite, q_pricing, 3),
    ]

    try:
        grouped_results = await asyncio.gather(*tasks, return_exceptions=True)
    except Exception as e:
        print(f"⚠️ Search gathering error: {e}")
        grouped_results = [[], [], []]

    market_snippets = grouped_results[0] if isinstance(grouped_results[0], list) else []
    comp_snippets = grouped_results[1] if isinstance(grouped_results[1], list) else []
    pricing_snippets = grouped_results[2] if isinstance(grouped_results[2], list) else []

    all_sources = market_snippets + comp_snippets + pricing_snippets

    # Heuristic parsing to extract mentioned market numbers and CAGR if present
    extracted_tam = None
    extracted_cagr = None
    all_text = " ".join([s["snippet"] for s in all_sources])

    # Regex for billion/million TAM patterns
    tam_match = re.search(r"(?:USD|\$)\s*([\d\.]+)\s*(Billion|Million|B|M|Cr)", all_text, re.IGNORECASE)
    if tam_match:
        val, unit = tam_match.groups()
        if unit.lower() in ("billion", "b"):
            try:
                num_b = float(val)
                inr_cr = int(num_b * 8300)
                extracted_tam = f"₹{inr_cr:,} Cr (${num_b:.1f}B)"
            except Exception:
                extracted_tam = f"${val} {unit}"
        elif unit.lower() in ("million", "m"):
            try:
                num_m = float(val)
                inr_cr = int(num_m * 8.3)
                extracted_tam = f"₹{inr_cr:,} Cr (${num_m:.1f}M)"
            except Exception:
                extracted_tam = f"${val} {unit}"

    # Regex for CAGR
    cagr_match = re.search(r"CAGR\s*(?:of)?\s*([\d\.]+)%", all_text, re.IGNORECASE)
    if not cagr_match:
        cagr_match = re.search(r"([\d\.]+)%\s*CAGR", all_text, re.IGNORECASE)
    if cagr_match:
        extracted_cagr = f"+{cagr_match.group(1)}% YoY"

    return {
        "queries_run": [q_market, q_competitors, q_pricing],
        "market_sources": market_snippets,
        "competitor_sources": comp_snippets,
        "pricing_sources": pricing_snippets,
        "all_sources": all_sources[:8],
        "extracted_tam": extracted_tam,
        "extracted_cagr": extracted_cagr,
        "raw_intel_text": "\n\n".join([f"[{s['title']}]: {s['snippet']}" for s in all_sources[:6]])
    }
