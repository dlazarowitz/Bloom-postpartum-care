# Quarterly Update Prompt for Claude

Copy everything below the line into a new Claude chat conversation (claude.ai).
Update the quarter/year at the top before pasting.

---

## PROMPT STARTS HERE — COPY BELOW THIS LINE

I need you to research and generate updated YAML data files for our TTEC Holdings quarterly executive intelligence briefing. This is for **Q[X] [YEAR]** (update this).

### Context

I work in corporate development at TTEC Holdings (NASDAQ: TTEC). We produce a quarterly intelligence briefing for our Board of Directors covering competitive intelligence, market trends, financial benchmarking, and strategic analysis across the CX/BPO industry.

The briefing is generated from 10 YAML data files that feed into a Python script producing PowerPoint, Excel, and Word outputs. I need you to research the latest publicly available data and produce updated YAML files.

### What I Need

Please research and produce complete, updated YAML files for each of the following. Use web search to find the latest earnings releases, SEC filings, press releases, and industry data. Cite your sources in the YAML comments.

---

### FILE 1: company_overview.yaml

Research TTEC Holdings' latest quarterly/annual results from investors.ttec.com and SEC filings.

Include:
- Latest annual results: revenue, adjusted EBITDA, EBITDA margin, operating income, net income, free cash flow, net debt, employee count
- Latest quarterly segment detail: TTEC Digital and TTEC Engage revenue, growth, margins
- Balance sheet: net debt, leverage ratio
- Forward guidance (if updated)
- Strategic priorities and any leadership changes

Use this YAML structure:
```yaml
company_name: "TTEC Holdings, Inc."
ticker: "TTEC"
annual_results:
  - year: YYYY
    revenue_millions: X
    adj_ebitda_millions: X
    adj_ebitda_margin_pct: X.X
    operating_income_millions: X
    net_income_millions: X
    free_cash_flow_millions: X
    net_debt_millions: X
    employees: X
quarterly_segments:
  period: "QX YYYY"
  ttec_digital:
    revenue_millions: X
    revenue_growth_yoy_pct: X.X
    non_gaap_operating_margin_pct: X.X
  ttec_engage:
    revenue_millions: X
    revenue_growth_yoy_pct: X.X
    non_gaap_operating_margin_pct: X.X
balance_sheet:
  net_debt_millions: X
  net_leverage_ratio: X.X
guidance_2026:  # Update year as needed
  revenue_low_millions: X
  revenue_high_millions: X
  adj_ebitda_low_millions: X
  adj_ebitda_high_millions: X
  commentary:
    - "Key point 1"
    - "Key point 2"
```

---

### FILE 2: competitors.yaml

Research the latest financials for these 12 competitors. Search their IR websites, earnings press releases, and SEC filings.

**Public peers:**
1. Concentrix (CNXC) — FYE November 30
2. Teleperformance (TEP.PA) — FYE December 31, reports in EUR
3. TELUS International / TELUS Digital (TIXT) — FYE December 31
4. TaskUs (TASK) — FYE December 31
5. Conduent (CNDT) — FYE December 31
6. ExlService Holdings (EXLS) — FYE December 31
7. WNS Holdings — acquired by Capgemini Oct 2025
8. Genpact (G) — FYE December 31
9. Hinduja Global Solutions (HGS.NS) — FYE March 31, reports in INR

**Private peers (estimate from industry reports/press):**
10. Alorica
11. Foundever (formerly Sitel)
12. Sutherland Global

For each competitor, provide:
```yaml
competitors:
  - name: "Company Name"
    ticker: "XXXX"
    tier: 1  # or 2
    public: true  # or false
    employees: X
    revenue_millions: X  # USD, latest fiscal year
    revenue_growth_yoy_pct: X.X
    adj_ebitda_millions: X
    adj_ebitda_margin_pct: X.X
    ev_ebitda_multiple: X.X  # public companies only
    market_cap_millions: X
    recent_highlights:
      - "Highlight 1"
      - "Highlight 2"
      - "Highlight 3"
    strategy: "One-line strategy description"
    key_verticals:
      - "Vertical 1"
      - "Vertical 2"
```

---

### FILE 3: industry.yaml

Research the latest CX/BPO market sizing data. Check Grand View Research, Gartner, Everest Group, and Polaris Market Research.

Include: market size (current), projected size, CAGR, market segments, geographic distribution, growth drivers, headwinds, industry concentration.

---

### FILE 4: technology_trends.yaml

Research the latest AI adoption statistics in CX/BPO. Check Gartner, Verint, Forrester, and earnings call transcripts from TTEC and peers.

Include:
- AI adoption rates in CX
- GenAI/agentic AI developments
- CCaaS migration rates
- AI disruption risk scenarios (low/mid/high TAM compression)
- TTEC AI readiness vs peers
- Emerging business models (outcome-based pricing, AI+human hybrid, agentic AI)

---

### FILE 5: ma_transactions.yaml

Research recent M&A transactions in the CX/BPO space (last 12 months). Check press releases, Ryan Strategic Advisory, and Capstone Partners reports.

Include: date, acquirer, target, deal value, multiples (EV/Revenue, EV/EBITDA), rationale, status. Also include valuation benchmark ranges.

---

### FILE 6: analyst_consensus.yaml

Research sell-side analyst coverage of TTEC and key public peers. Check TipRanks, Yahoo Finance, and Visible Alpha.

Include: consensus rating, number of analysts, price target (low/median/high), current stock price, forward EV/EBITDA, sentiment notes.

---

### FILE 7: capital_allocation.yaml

Research TTEC and peer balance sheets, capital deployment, and M&A capacity.

Include: net debt, leverage ratios, debt reduction, acquisitions, buybacks, dividend yield, M&A capacity estimates.

---

### FILE 8: labor_analytics.yaml

Research CX/BPO labor market trends. Check BLS, industry surveys, and company filings.

Include: employees by country, average wages, wage growth, attrition rates, delivery mix trends (offshore/nearshore/onshore/AI), AI impact on workforce.

---

### FILE 9: macro_environment.yaml

Research regulatory and macroeconomic factors affecting CX/BPO.

Include: data privacy regulations, AI regulation (EU AI Act), labor laws, trade/tariff policy, GDP growth, inflation, interest rates, FX considerations, enterprise IT spending outlook.

---

### FILE 10: executive_summary.yaml

Based on all the research above, draft 5 key takeaways for the Board. Each should have a short heading and a 2-3 sentence detail.

```yaml
period: "QX YYYY"
takeaways:
  - heading: "Short headline"
    detail: "2-3 sentence explanation with key data points."
```

---

### Output Instructions

1. Produce each file as a complete, valid YAML document
2. Include a comment header at the top of each file with sources and "Last Updated" date
3. Use the exact field names shown above — the Python generator depends on them
4. For private companies, clearly mark estimates with comments
5. Convert all currencies to USD
6. If you can't find a specific data point, use `null` rather than guessing
7. After all 10 files, provide a brief summary of the most significant changes from the prior quarter

### Important Notes
- TTEC's fiscal year ends December 31
- Concentrix's fiscal year ends November 30
- WNS and HGS have March 31 fiscal year ends
- Teleperformance reports in EUR — convert to USD at current exchange rate
- HGS reports in INR — convert to USD at current exchange rate
- WNS was acquired by Capgemini in October 2025 and is no longer publicly traded

## END OF PROMPT
