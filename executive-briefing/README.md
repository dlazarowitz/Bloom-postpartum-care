# TTEC Holdings — Executive Intelligence Briefing Generator

Generates a quarterly board-ready intelligence briefing from structured YAML data files.

## Outputs

- **PowerPoint** (19 slides): Board presentation with charts, tables, and analysis
- **Excel** (8 tabs): Financial benchmarking, valuation comps, M&A tracker, and more
- **Word** (10 sections): Detailed narrative appendix with competitor profiles and strategic analysis

## Quick Start

```bash
cd executive-briefing
pip install -r requirements.txt
python generate.py
```

Generated files appear in `output/`.

### Generate individual documents

```bash
python generate.py --pptx    # PowerPoint only
python generate.py --xlsx    # Excel only
python generate.py --docx    # Word only
```

## Quarterly Update Workflow (Claude-First)

1. **Ask Claude to research & update** (~15 min):
   - Share the current YAML files with Claude
   - Prompt: "Research the latest quarterly earnings and financials for TTEC and all 12 peers. Update all YAML data files with the most recent data."
   - Claude searches SEC filings, earnings releases, and IR websites

2. **Validate against FactSet** (~10 min):
   - Spot-check 3–5 key numbers against FactSet
   - FactSet fields: `FF_SALES`, `FF_EBITDA`, `P_EVT_EBITDA`

3. **Generate and distribute** (~5 min):
   - Copy updated YAML into `data/`
   - Run `python generate.py`
   - Review and distribute

## Data Files

| File | Content | Update Frequency |
|------|---------|-----------------|
| `company_overview.yaml` | TTEC financials, segments, guidance | Quarterly |
| `competitors.yaml` | 12 peer profiles and financials | Quarterly |
| `industry.yaml` | CX/BPO market size, growth data | Semi-annually |
| `ma_transactions.yaml` | Recent M&A deals | As deals occur |
| `technology_trends.yaml` | AI, cloud, automation data | Quarterly |
| `analyst_consensus.yaml` | Sell-side ratings, price targets | Quarterly |
| `capital_allocation.yaml` | Debt, leverage, capital deployment | Quarterly |
| `labor_analytics.yaml` | Attrition, wages, geographic mix | Semi-annually |
| `macro_environment.yaml` | Regulatory, labor, tariff data | Quarterly |
| `executive_summary.yaml` | Key takeaways (manually curated) | Quarterly |

## Competitor Peer Set (12)

**Public:** Concentrix (CNXC), Teleperformance (TEP.PA), TELUS International (TIXT), TaskUs (TASK), Conduent (CNDT), ExlService (EXLS), WNS Holdings (WNS), Genpact (G), Hinduja Global (HGS.NS)

**Private:** Alorica, Foundever, Sutherland Global

## Configuration

Edit `config.yaml` to change branding (colors, fonts), reporting period, or output file names.
