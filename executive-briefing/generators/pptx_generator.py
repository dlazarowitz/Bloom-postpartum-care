"""
PowerPoint Presentation Generator — TTEC Executive Intelligence Briefing
Generates a 19-slide board-ready presentation from YAML data files.
"""

import sys
import os
from pathlib import Path

# Ensure project root is on path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION
from pptx.chart.data import CategoryChartData

from templates.styles import (
    SLIDE_WIDTH, SLIDE_HEIGHT,
    TITLE_LEFT, TITLE_TOP, TITLE_WIDTH, TITLE_HEIGHT,
    CONTENT_LEFT, CONTENT_TOP, CONTENT_WIDTH, CONTENT_HEIGHT,
    LEFT_COL_LEFT, LEFT_COL_WIDTH, RIGHT_COL_LEFT, RIGHT_COL_WIDTH,
    CHART_LEFT, CHART_TOP, CHART_WIDTH, CHART_HEIGHT, HALF_CHART_WIDTH,
    FOOTER_TOP, FOOTER_HEIGHT,
    hex_to_rgb, get_colors, get_chart_colors, get_font_name,
    add_slide_title, add_accent_bar, add_footer, format_number,
)
from generators.charts import (
    add_bar_chart, add_line_chart, add_table, add_kpi_box, add_bullet_list,
)


def _blank_slide(prs):
    """Add a blank slide."""
    layout = prs.slide_layouts[6]  # Blank layout
    return prs.slides.add_slide(layout)


# -------------------------------------------------------------------------
# Slide 1: Title Slide
# -------------------------------------------------------------------------
def slide_title(prs, data, config):
    slide = _blank_slide(prs)
    colors = get_colors(config)
    font_name = get_font_name(config)
    quarter = config.get("quarter", "Q1")
    year = config.get("year", 2026)

    # Background
    bg = slide.shapes.add_shape(1, Inches(0), Inches(0), SLIDE_WIDTH, SLIDE_HEIGHT)
    bg.fill.solid()
    bg.fill.fore_color.rgb = colors["primary"]
    bg.line.fill.background()

    # Main title
    txBox = slide.shapes.add_textbox(Inches(1), Inches(2.0), Inches(11), Inches(1.5))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Executive Intelligence Briefing"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = colors["text_light"]
    p.font.name = font_name
    p.alignment = PP_ALIGN.CENTER

    # Subtitle
    txBox2 = slide.shapes.add_textbox(Inches(1), Inches(3.5), Inches(11), Inches(1.0))
    tf2 = txBox2.text_frame
    tf2.word_wrap = True
    p2 = tf2.paragraphs[0]
    p2.text = f"{quarter} {year} — {config.get('company_name', 'TTEC Holdings, Inc.')}"
    p2.font.size = Pt(24)
    p2.font.color.rgb = colors["text_light"]
    p2.font.name = font_name
    p2.alignment = PP_ALIGN.CENTER

    # Classification
    txBox3 = slide.shapes.add_textbox(Inches(1), Inches(5.0), Inches(11), Inches(0.5))
    tf3 = txBox3.text_frame
    p3 = tf3.paragraphs[0]
    p3.text = config.get("classification", "CONFIDENTIAL")
    p3.font.size = Pt(14)
    p3.font.color.rgb = hex_to_rgb("AAAAAA")
    p3.font.name = font_name
    p3.alignment = PP_ALIGN.CENTER

    # Accent line
    line = slide.shapes.add_shape(1, Inches(4), Inches(4.7), Inches(5.3), Inches(0.04))
    line.fill.solid()
    line.fill.fore_color.rgb = colors["accent"]
    line.line.fill.background()

    # Date
    txBox4 = slide.shapes.add_textbox(Inches(1), Inches(6.0), Inches(11), Inches(0.5))
    tf4 = txBox4.text_frame
    p4 = tf4.paragraphs[0]
    p4.text = "Corporate Development"
    p4.font.size = Pt(14)
    p4.font.color.rgb = hex_to_rgb("CCCCCC")
    p4.font.name = font_name
    p4.alignment = PP_ALIGN.CENTER


# -------------------------------------------------------------------------
# Slide 2: Executive Summary
# -------------------------------------------------------------------------
def slide_executive_summary(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Executive Summary", config)
    add_accent_bar(slide, config)

    exec_data = data.get("executive_summary", {})
    takeaways = exec_data.get("takeaways", [])

    y_pos = Inches(1.4)
    colors = get_colors(config)
    font_name = get_font_name(config)

    for t in takeaways[:5]:
        # Heading
        txBox = slide.shapes.add_textbox(CONTENT_LEFT, y_pos, CONTENT_WIDTH, Inches(0.35))
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = t.get("heading", "")
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = colors["primary"]
        p.font.name = font_name
        y_pos += Inches(0.35)

        # Detail
        txBox2 = slide.shapes.add_textbox(
            CONTENT_LEFT + Inches(0.2), y_pos, CONTENT_WIDTH - Inches(0.2), Inches(0.7)
        )
        tf2 = txBox2.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = t.get("detail", "").strip()
        p2.font.size = Pt(10)
        p2.font.color.rgb = colors["text_dark"]
        p2.font.name = font_name
        y_pos += Inches(0.75)

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 3: TTEC Performance Snapshot
# -------------------------------------------------------------------------
def slide_ttec_performance(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "TTEC Performance Snapshot", config)
    add_accent_bar(slide, config)

    co = data.get("company_overview", {})
    annual = co.get("annual_results", [])
    guidance = co.get("guidance_2026", {})

    # KPI boxes across top
    if annual:
        latest = annual[-1]
        kpis = [
            ("FY2025 Revenue", format_number(latest.get("revenue_millions"), "money")),
            ("Adj. EBITDA", format_number(latest.get("adj_ebitda_millions"), "money")),
            ("EBITDA Margin", format_number(latest.get("adj_ebitda_margin_pct"), "percent")),
            ("Free Cash Flow", format_number(latest.get("free_cash_flow_millions"), "money")),
            ("Net Debt", format_number(co.get("balance_sheet", {}).get("net_debt_millions"), "money")),
        ]
        x_pos = Inches(0.3)
        for label, value in kpis:
            add_kpi_box(slide, label, value, config,
                        left=x_pos, top=Inches(1.5),
                        width=Inches(2.4), height=Inches(1.1))
            x_pos += Inches(2.55)

    # Revenue trend chart
    if len(annual) >= 2:
        years = [str(r["year"]) for r in annual]
        revenues = [r.get("revenue_millions", 0) for r in annual]
        # Add guidance midpoint
        if guidance:
            years.append("2026E")
            mid = (guidance.get("revenue_low_millions", 0) + guidance.get("revenue_high_millions", 0)) / 2
            revenues.append(mid)

        add_bar_chart(
            slide, years, {"Revenue ($M)": revenues}, config,
            left=Inches(0.5), top=Inches(3.0),
            width=Inches(6), height=Inches(3.8),
            show_legend=False,
        )

    # EBITDA margin trend
    if len(annual) >= 2:
        years = [str(r["year"]) for r in annual]
        margins = [r.get("adj_ebitda_margin_pct", 0) for r in annual]
        add_line_chart(
            slide, years, {"EBITDA Margin (%)": margins}, config,
            left=Inches(6.9), top=Inches(3.0),
            width=Inches(6), height=Inches(3.8),
            show_legend=False,
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 4: Industry Overview
# -------------------------------------------------------------------------
def slide_industry_overview(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "CX/BPO Industry Overview", config)
    add_accent_bar(slide, config)

    ind = data.get("industry", {})
    market = ind.get("market_size", {})

    # Market size KPIs
    kpis = [
        ("Market Size (2024)", f"${market.get('current_value_billions', 102)}B"),
        ("Projected (2033)", f"${market.get('projected_value_billions', 296)}B"),
        ("CAGR", f"{market.get('cagr_pct', 12.8)}%"),
    ]
    x_pos = Inches(0.5)
    for label, value in kpis:
        add_kpi_box(slide, label, value, config,
                    left=x_pos, top=Inches(1.5),
                    width=Inches(3.8), height=Inches(1.0))
        x_pos += Inches(4.1)

    # Market size trajectory chart
    by_year = market.get("by_year", {})
    if by_year:
        years = [str(y) for y in sorted(by_year.keys())]
        values = [by_year[int(y)] for y in years]
        add_bar_chart(
            slide, years, {"CX BPO Market Size ($B)": values}, config,
            left=Inches(0.5), top=Inches(2.8),
            width=Inches(7), height=Inches(4.0),
            show_legend=False,
        )

    # Growth drivers
    drivers = ind.get("key_growth_drivers", [])[:5]
    if drivers:
        add_bullet_list(
            slide, drivers, config,
            left=Inches(8), top=Inches(2.8),
            width=Inches(4.8), height=Inches(4.0),
            font_size_pt=10,
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 5: Market Trends — AI & Automation
# -------------------------------------------------------------------------
def slide_ai_trends(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Market Trends — AI & Automation", config)
    add_accent_bar(slide, config)

    tech = data.get("technology_trends", {})
    ai = tech.get("ai_adoption", {})
    stats = ai.get("stats", [])

    # Key stats as KPI boxes
    x_pos = Inches(0.3)
    for stat in stats[:5]:
        val = stat.get("value", "")
        unit = stat.get("unit", "")
        if unit == "percent":
            display = f"{val}%"
        elif unit == "billions_usd":
            display = f"${val}B"
        else:
            display = str(val)
        add_kpi_box(slide, stat.get("metric", "")[:50], display, config,
                    left=x_pos, top=Inches(1.5),
                    width=Inches(2.4), height=Inches(1.2))
        x_pos += Inches(2.55)

    # Emerging models
    models = tech.get("emerging_models", [])
    items = []
    for m in models:
        items.append(f"{m.get('name', '')}: {m.get('description', '')}")
    if items:
        add_bullet_list(
            slide, items, config,
            left=Inches(0.5), top=Inches(3.2),
            width=Inches(12.3), height=Inches(3.5),
            font_size_pt=11,
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 6: AI Disruption Risk Assessment
# -------------------------------------------------------------------------
def slide_ai_disruption(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "AI Disruption Risk Assessment", config)
    add_accent_bar(slide, config)

    tech = data.get("technology_trends", {})
    assessment = tech.get("ai_disruption_assessment", {})
    scenarios = assessment.get("tam_compression_scenario", {})

    # Scenario table
    rows = [["Scenario", "AI Adoption", "Revenue Impact", "Timeline", "Description"]]
    for key in ["scenario_low", "scenario_mid", "scenario_high"]:
        s = scenarios.get(key, {})
        label = key.replace("scenario_", "").capitalize()
        rows.append([
            label,
            f"{s.get('ai_adoption_pct', '')}%",
            f"{s.get('revenue_impact_pct', '')}%",
            s.get("timeline", ""),
            s.get("description", ""),
        ])

    if len(rows) > 1:
        add_table(
            slide, rows,
            [Inches(1.2), Inches(1.3), Inches(1.5), Inches(1.5), Inches(6.8)],
            config,
            left=Inches(0.5), top=Inches(1.5),
        )

    # TTEC readiness
    readiness = assessment.get("ttec_readiness", {})
    strengths = readiness.get("strengths", [])
    vulns = readiness.get("vulnerabilities", [])

    if strengths:
        txBox = slide.shapes.add_textbox(Inches(0.5), Inches(3.5), Inches(6), Inches(0.4))
        tf = txBox.text_frame
        p = tf.paragraphs[0]
        p.text = "TTEC Strengths"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = get_colors(config)["positive"]
        p.font.name = get_font_name(config)
        add_bullet_list(slide, strengths, config,
                        left=Inches(0.5), top=Inches(3.9),
                        width=Inches(6), height=Inches(2.5),
                        font_size_pt=10)

    if vulns:
        txBox2 = slide.shapes.add_textbox(Inches(6.9), Inches(3.5), Inches(6), Inches(0.4))
        tf2 = txBox2.text_frame
        p2 = tf2.paragraphs[0]
        p2.text = "TTEC Vulnerabilities"
        p2.font.size = Pt(14)
        p2.font.bold = True
        p2.font.color.rgb = get_colors(config)["negative"]
        p2.font.name = get_font_name(config)
        add_bullet_list(slide, vulns, config,
                        left=Inches(6.9), top=Inches(3.9),
                        width=Inches(6), height=Inches(2.5),
                        font_size_pt=10)

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 7: Market Trends — Cloud & Digital
# -------------------------------------------------------------------------
def slide_cloud_digital(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Market Trends — Cloud & Digital CX", config)
    add_accent_bar(slide, config)

    tech = data.get("technology_trends", {})
    cloud = tech.get("cloud_and_digital", {})
    trends = cloud.get("trends", [])

    if trends:
        names = [t.get("name", "") for t in trends]
        adoption = [t.get("adoption_pct", 0) for t in trends]
        growth = [t.get("growth_rate_pct", 0) for t in trends]

        add_bar_chart(
            slide, names,
            {"Current Adoption (%)": adoption, "Annual Growth (%)": growth},
            config,
            left=Inches(0.5), top=Inches(1.5),
            width=Inches(7), height=Inches(5.3),
        )

    # CCaaS key players
    if trends and trends[0].get("key_players"):
        players = trends[0]["key_players"]
        add_bullet_list(
            slide, [f"Key CCaaS Players: {', '.join(players)}"], config,
            left=Inches(8), top=Inches(1.5),
            width=Inches(4.8), height=Inches(1.5),
            font_size_pt=10,
        )

    # Trend descriptions
    desc_items = [f"{t.get('name', '')}: {t.get('description', '')}" for t in trends]
    if desc_items:
        add_bullet_list(
            slide, desc_items, config,
            left=Inches(8), top=Inches(3.0),
            width=Inches(4.8), height=Inches(4.0),
            font_size_pt=10,
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 8: Competitive Landscape Overview
# -------------------------------------------------------------------------
def slide_competitive_landscape(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Competitive Landscape Overview", config)
    add_accent_bar(slide, config)

    comps = data.get("competitors", {}).get("competitors", [])
    public_comps = [c for c in comps if c.get("public", False)]

    if public_comps:
        # Revenue vs EBITDA margin positioning table
        rows = [["Company", "Revenue ($M)", "EBITDA Margin", "EV/EBITDA", "Employees", "Tier"]]
        # Add TTEC first
        co = data.get("company_overview", {})
        annual = co.get("annual_results", [])
        if annual:
            latest = annual[-1]
            rows.append([
                "TTEC Holdings",
                format_number(latest.get("revenue_millions"), "money"),
                format_number(latest.get("adj_ebitda_margin_pct"), "percent"),
                "N/A",
                format_number(co.get("employees", 52000) if isinstance(co.get("employees"), (int, float)) else 52000, "integer"),
                "—",
            ])

        for c in comps:
            rows.append([
                c.get("name", ""),
                format_number(c.get("revenue_millions"), "money"),
                format_number(c.get("adj_ebitda_margin_pct"), "percent") if c.get("adj_ebitda_margin_pct") else "N/A",
                format_number(c.get("ev_ebitda_multiple"), "multiple") if c.get("ev_ebitda_multiple") else "N/A",
                format_number(c.get("employees"), "integer") if c.get("employees") else "N/A",
                f"Tier {c.get('tier', '')}",
            ])

        add_table(
            slide, rows,
            [Inches(2.5), Inches(1.8), Inches(1.8), Inches(1.5), Inches(1.8), Inches(1.0)],
            config,
            left=Inches(0.5), top=Inches(1.5),
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 9: Competitor Deep Dive — Tier 1
# -------------------------------------------------------------------------
def slide_competitor_tier1(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Competitor Deep Dive — Tier 1", config)
    add_accent_bar(slide, config)

    comps = data.get("competitors", {}).get("competitors", [])
    tier1 = [c for c in comps if c.get("tier") == 1]

    y_pos = Inches(1.4)
    colors = get_colors(config)
    font_name = get_font_name(config)

    for c in tier1[:4]:
        # Company name
        txBox = slide.shapes.add_textbox(CONTENT_LEFT, y_pos, Inches(3), Inches(0.3))
        tf = txBox.text_frame
        p = tf.paragraphs[0]
        ticker = f" ({c.get('ticker', '')})" if c.get("ticker") else ""
        p.text = f"{c.get('name', '')}{ticker}"
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = colors["primary"]
        p.font.name = font_name

        # Financials
        fin_text = f"Rev: {format_number(c.get('revenue_millions'), 'money')} | "
        fin_text += f"EBITDA Margin: {format_number(c.get('adj_ebitda_margin_pct'), 'percent')} | "
        fin_text += f"Employees: {format_number(c.get('employees'), 'integer')}"
        txBox2 = slide.shapes.add_textbox(Inches(3.5), y_pos, Inches(6), Inches(0.3))
        tf2 = txBox2.text_frame
        p2 = tf2.paragraphs[0]
        p2.text = fin_text
        p2.font.size = Pt(10)
        p2.font.color.rgb = colors["text_dark"]
        p2.font.name = font_name

        # Highlights
        highlights = c.get("recent_highlights", [])[:3]
        if highlights:
            txBox3 = slide.shapes.add_textbox(
                CONTENT_LEFT + Inches(0.2), y_pos + Inches(0.35),
                Inches(12), Inches(0.9)
            )
            tf3 = txBox3.text_frame
            tf3.word_wrap = True
            for i, h in enumerate(highlights):
                if i == 0:
                    p3 = tf3.paragraphs[0]
                else:
                    p3 = tf3.add_paragraph()
                p3.text = f"• {h}"
                p3.font.size = Pt(9)
                p3.font.color.rgb = colors["text_dark"]
                p3.font.name = font_name

        y_pos += Inches(1.4)

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 10: Competitor Deep Dive — Tier 2
# -------------------------------------------------------------------------
def slide_competitor_tier2(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Competitor Deep Dive — Tier 2 & Private", config)
    add_accent_bar(slide, config)

    comps = data.get("competitors", {}).get("competitors", [])
    tier2 = [c for c in comps if c.get("tier") == 2]

    # Condensed table format for 8 competitors
    rows = [["Company", "Revenue", "EBITDA Margin", "Employees", "Strategy"]]
    for c in tier2:
        rows.append([
            c.get("name", ""),
            format_number(c.get("revenue_millions"), "money"),
            format_number(c.get("adj_ebitda_margin_pct"), "percent") if c.get("adj_ebitda_margin_pct") else "N/A",
            format_number(c.get("employees"), "integer") if c.get("employees") else "N/A",
            c.get("strategy", "")[:60],
        ])

    if len(rows) > 1:
        add_table(
            slide, rows,
            [Inches(2.2), Inches(1.3), Inches(1.5), Inches(1.5), Inches(5.8)],
            config,
            left=Inches(0.5), top=Inches(1.5),
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 11: Financial Benchmarking
# -------------------------------------------------------------------------
def slide_financial_benchmarking(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Financial Benchmarking — TTEC vs Peers", config)
    add_accent_bar(slide, config)

    comps = data.get("competitors", {}).get("competitors", [])
    co = data.get("company_overview", {})
    annual = co.get("annual_results", [])

    public_comps = [c for c in comps if c.get("public", False) and c.get("revenue_millions")]

    # Build chart data
    names = ["TTEC"]
    revenues = []
    margins = []

    if annual:
        revenues.append(annual[-1].get("revenue_millions", 0))
        margins.append(annual[-1].get("adj_ebitda_margin_pct", 0))
    else:
        revenues.append(2137)
        margins.append(10.0)

    for c in sorted(public_comps, key=lambda x: x.get("revenue_millions", 0), reverse=True)[:8]:
        names.append(c.get("name", "").split("(")[0].strip()[:15])
        revenues.append(c.get("revenue_millions", 0))
        margins.append(c.get("adj_ebitda_margin_pct", 0) or 0)

    # Revenue comparison chart
    add_bar_chart(
        slide, names, {"Revenue ($M)": revenues}, config,
        left=Inches(0.5), top=Inches(1.5),
        width=Inches(6), height=Inches(5.3),
        show_legend=False,
    )

    # EBITDA margin comparison chart
    add_bar_chart(
        slide, names, {"EBITDA Margin (%)": margins}, config,
        left=Inches(6.9), top=Inches(1.5),
        width=Inches(6), height=Inches(5.3),
        show_legend=False,
    )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 12: Valuation Comparison
# -------------------------------------------------------------------------
def slide_valuation_comparison(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Valuation Comparison — EV/EBITDA", config)
    add_accent_bar(slide, config)

    comps = data.get("competitors", {}).get("competitors", [])
    valued = [c for c in comps if c.get("ev_ebitda_multiple")]

    if valued:
        names = [c.get("name", "")[:15] for c in valued]
        multiples = [c.get("ev_ebitda_multiple", 0) for c in valued]

        add_bar_chart(
            slide, names, {"EV/EBITDA": multiples}, config,
            left=Inches(0.5), top=Inches(1.5),
            width=Inches(12.3), height=Inches(5.3),
            show_legend=False,
        )

    # Valuation benchmarks from M&A data
    ma = data.get("ma_transactions", {})
    benchmarks = ma.get("valuation_benchmarks", {})
    ev_ebitda = benchmarks.get("ev_ebitda_range", {})
    if ev_ebitda:
        txBox = slide.shapes.add_textbox(Inches(9), Inches(1.5), Inches(3.8), Inches(1.5))
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"M&A Multiples: {ev_ebitda.get('low', '')}x - {ev_ebitda.get('high', '')}x (Median: {ev_ebitda.get('median', '')}x)"
        p.font.size = Pt(10)
        p.font.color.rgb = get_colors(config)["text_dark"]
        p.font.name = get_font_name(config)

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 13: Analyst Consensus & Sentiment
# -------------------------------------------------------------------------
def slide_analyst_consensus(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Analyst Consensus & Market Sentiment", config)
    add_accent_bar(slide, config)

    analyst = data.get("analyst_consensus", {})
    ttec = analyst.get("ttec", {})

    # TTEC KPIs
    kpis = [
        ("Consensus Rating", ttec.get("consensus_rating", "N/A")),
        ("Price Target (Median)", f"${ttec.get('price_target', {}).get('median', 'N/A')}"),
        ("Current Price", f"${ttec.get('current_price', 'N/A')}"),
        ("# Analysts", str(ttec.get("num_analysts", "N/A"))),
    ]
    x_pos = Inches(0.3)
    for label, value in kpis:
        add_kpi_box(slide, label, value, config,
                    left=x_pos, top=Inches(1.5),
                    width=Inches(3.0), height=Inches(1.0))
        x_pos += Inches(3.2)

    # Peer consensus table
    peers = analyst.get("key_peers", [])
    if peers:
        rows = [["Company", "Rating", "Price Target", "Current Price", "Fwd EV/EBITDA"]]
        for p in peers:
            rows.append([
                p.get("name", ""),
                p.get("consensus_rating", ""),
                f"${p.get('price_target_median', '')}",
                f"${p.get('current_price', '')}",
                format_number(p.get("fy_forward_ev_ebitda"), "multiple") if p.get("fy_forward_ev_ebitda") else "N/A",
            ])
        add_table(
            slide, rows,
            [Inches(2.5), Inches(1.5), Inches(2.0), Inches(2.0), Inches(2.0)],
            config,
            left=Inches(0.5), top=Inches(2.8),
        )

    # Sentiment notes
    notes = ttec.get("sentiment_notes", [])
    if notes:
        add_bullet_list(
            slide, notes, config,
            left=Inches(0.5), top=Inches(5.5),
            width=Inches(12.3), height=Inches(1.3),
            font_size_pt=9,
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 14: Capital Allocation Analysis
# -------------------------------------------------------------------------
def slide_capital_allocation(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Capital Allocation Analysis", config)
    add_accent_bar(slide, config)

    cap = data.get("capital_allocation", {})
    ttec = cap.get("ttec", {})
    bs = ttec.get("balance_sheet", {})
    ma_cap = ttec.get("ma_capacity", {})

    # TTEC KPIs
    kpis = [
        ("Net Debt", format_number(bs.get("net_debt_millions"), "money")),
        ("Net Leverage", format_number(bs.get("net_leverage_ratio"), "multiple")),
        ("M&A Capacity", format_number(ma_cap.get("estimated_acquisition_capacity_millions"), "money")),
        ("Dividend Yield", format_number(ttec.get("dividend", {}).get("yield_pct"), "percent")),
    ]
    x_pos = Inches(0.3)
    for label, value in kpis:
        add_kpi_box(slide, label, value, config,
                    left=x_pos, top=Inches(1.5),
                    width=Inches(3.0), height=Inches(1.0))
        x_pos += Inches(3.2)

    # Peer leverage comparison
    peers = cap.get("peer_capital_allocation", [])
    if peers:
        names = ["TTEC"] + [p.get("name", "")[:15] for p in peers]
        leverage = [bs.get("net_leverage_ratio", 0)] + [p.get("net_leverage_ratio", 0) for p in peers]
        add_bar_chart(
            slide, names, {"Net Leverage Ratio": leverage}, config,
            left=Inches(0.5), top=Inches(2.8),
            width=Inches(12.3), height=Inches(4.0),
            show_legend=False,
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 15: Labor & Talent Analytics
# -------------------------------------------------------------------------
def slide_labor_analytics(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Labor & Talent Analytics", config)
    add_accent_bar(slide, config)

    labor = data.get("labor_analytics", {})
    geos = labor.get("industry_workforce", {}).get("top_delivery_geographies", [])

    if geos:
        rows = [["Country", "Employees", "Avg Wage (USD)", "Wage Growth", "Attrition"]]
        for g in geos[:6]:
            rows.append([
                g.get("country", ""),
                format_number(g.get("employees_estimate"), "integer"),
                f"${g.get('avg_annual_wage_usd', 0):,}",
                format_number(g.get("wage_growth_yoy_pct"), "percent"),
                format_number(g.get("attrition_rate_pct"), "percent"),
            ])
        add_table(
            slide, rows,
            [Inches(2.0), Inches(1.8), Inches(2.0), Inches(1.8), Inches(1.5)],
            config,
            left=Inches(0.5), top=Inches(1.5),
        )

    # Delivery mix trends
    mix = labor.get("delivery_mix_trends", [])
    if mix:
        names = [m.get("model", "") for m in mix]
        current = [m.get("current_share_pct", 0) for m in mix]
        projected = [m.get("projected_2028_share_pct", 0) for m in mix]
        add_bar_chart(
            slide, names,
            {"Current Share (%)": current, "Projected 2028 (%)": projected},
            config,
            left=Inches(0.5), top=Inches(4.0),
            width=Inches(12.3), height=Inches(2.8),
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 16: Recent M&A & Transactions
# -------------------------------------------------------------------------
def slide_ma_transactions(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Recent M&A & Transactions", config)
    add_accent_bar(slide, config)

    ma = data.get("ma_transactions", {})
    deals = ma.get("recent_transactions", [])

    if deals:
        rows = [["Date", "Acquirer", "Target", "Value ($M)", "Rationale"]]
        for d in deals[:6]:
            val = format_number(d.get("deal_value_millions"), "money") if d.get("deal_value_millions") else "Undisclosed"
            rows.append([
                d.get("date", ""),
                d.get("acquirer", ""),
                d.get("target", ""),
                val,
                d.get("rationale", "")[:60],
            ])
        add_table(
            slide, rows,
            [Inches(1.2), Inches(2.0), Inches(2.5), Inches(1.5), Inches(5.1)],
            config,
            left=Inches(0.5), top=Inches(1.5),
        )

    # Key themes
    themes = ma.get("key_themes", [])
    if themes:
        add_bullet_list(
            slide, themes, config,
            left=Inches(0.5), top=Inches(4.5),
            width=Inches(12.3), height=Inches(2.3),
            font_size_pt=10,
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 17: Regulatory & Macro Environment
# -------------------------------------------------------------------------
def slide_regulatory(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Regulatory & Macro Environment", config)
    add_accent_bar(slide, config)

    macro = data.get("macro_environment", {})
    regs = macro.get("regulatory_landscape", [])

    if regs:
        rows = [["Area", "Key Developments", "Impact on CX", "Risk Level"]]
        for r in regs[:5]:
            devs = r.get("developments", [])
            dev_text = "; ".join(devs[:2])[:80]
            rows.append([
                r.get("area", ""),
                dev_text,
                r.get("impact_on_cx", "")[:50],
                r.get("risk_level", ""),
            ])
        add_table(
            slide, rows,
            [Inches(2.0), Inches(4.5), Inches(3.5), Inches(1.5)],
            config,
            left=Inches(0.5), top=Inches(1.5),
        )

    # Macro indicators
    macro_env = macro.get("macroeconomic_environment", {})
    if macro_env:
        items = [
            f"Global GDP Growth (2026E): {macro_env.get('global_gdp_growth_2026_pct', '')}%",
            f"US GDP Growth (2026E): {macro_env.get('us_gdp_growth_2026_pct', '')}%",
            f"US Inflation: {macro_env.get('us_inflation_pct', '')}%",
            f"Fed Funds Rate: {macro_env.get('interest_rates', {}).get('us_fed_funds_pct', '')}%",
        ]
        add_bullet_list(
            slide, items, config,
            left=Inches(0.5), top=Inches(4.8),
            width=Inches(12.3), height=Inches(1.8),
            font_size_pt=10,
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 18: Strategic Implications
# -------------------------------------------------------------------------
def slide_strategic_implications(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Strategic Implications & Recommendations", config)
    add_accent_bar(slide, config)

    # Draw from executive summary and company overview
    exec_data = data.get("executive_summary", {})
    co = data.get("company_overview", {})
    priorities = co.get("strategic_priorities", [])
    guidance = co.get("guidance_2026", {})
    commentary = guidance.get("commentary", [])

    # Strategic priorities
    if priorities:
        txBox = slide.shapes.add_textbox(Inches(0.5), Inches(1.4), Inches(5.9), Inches(0.4))
        tf = txBox.text_frame
        p = tf.paragraphs[0]
        p.text = "TTEC Strategic Priorities"
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = get_colors(config)["primary"]
        p.font.name = get_font_name(config)

        add_bullet_list(
            slide, priorities, config,
            left=Inches(0.5), top=Inches(1.9),
            width=Inches(5.9), height=Inches(3.0),
            font_size_pt=11,
        )

    # Key implications from guidance
    if commentary:
        txBox2 = slide.shapes.add_textbox(Inches(6.9), Inches(1.4), Inches(5.9), Inches(0.4))
        tf2 = txBox2.text_frame
        p2 = tf2.paragraphs[0]
        p2.text = "FY2026 Guidance Implications"
        p2.font.size = Pt(14)
        p2.font.bold = True
        p2.font.color.rgb = get_colors(config)["secondary"]
        p2.font.name = get_font_name(config)

        add_bullet_list(
            slide, commentary[:5], config,
            left=Inches(6.9), top=Inches(1.9),
            width=Inches(5.9), height=Inches(3.0),
            font_size_pt=11,
        )

    # Observations from capital allocation
    cap = data.get("capital_allocation", {})
    observations = cap.get("key_observations", [])
    if observations:
        txBox3 = slide.shapes.add_textbox(Inches(0.5), Inches(5.2), Inches(12.3), Inches(0.4))
        tf3 = txBox3.text_frame
        p3 = tf3.paragraphs[0]
        p3.text = "Key Observations"
        p3.font.size = Pt(12)
        p3.font.bold = True
        p3.font.color.rgb = get_colors(config)["accent"]
        p3.font.name = get_font_name(config)

        add_bullet_list(
            slide, observations[:3], config,
            left=Inches(0.5), top=Inches(5.6),
            width=Inches(12.3), height=Inches(1.5),
            font_size_pt=9,
        )

    add_footer(slide, config)


# -------------------------------------------------------------------------
# Slide 19: Appendix / Key Sources
# -------------------------------------------------------------------------
def slide_appendix(prs, data, config):
    slide = _blank_slide(prs)
    add_slide_title(slide, prs, "Appendix — Sources & Methodology", config)
    add_accent_bar(slide, config)

    sources = [
        "TTEC Holdings Investor Relations: investors.ttec.com",
        "SEC/EDGAR: Peer company 10-K and 10-Q filings",
        "Grand View Research: CX BPO Market Report",
        "Gartner: Customer Service and Support Technology",
        "Everest Group: CX/BPO Industry Reports",
        "FactSet: Financial data validation and analyst consensus",
        "Company IR websites: Earnings press releases and presentations",
        "Bureau of Labor Statistics: US employment and wage data",
        "Verint: Contact Center AI Trends",
        "Ryan Strategic Advisory: CX/BPO M&A Activity",
    ]

    add_bullet_list(
        slide, sources, config,
        left=Inches(0.5), top=Inches(1.5),
        width=Inches(12.3), height=Inches(4.5),
        font_size_pt=11,
    )

    # Disclaimer
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(6.0), Inches(12.3), Inches(0.8))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = (
        "Disclaimer: This briefing contains estimates and projections based on publicly available data. "
        "Financial figures for private companies are estimated from industry reports. "
        "All data should be validated against primary sources before use in investment decisions."
    )
    p.font.size = Pt(8)
    p.font.italic = True
    p.font.color.rgb = hex_to_rgb("999999")
    p.font.name = get_font_name(config)

    add_footer(slide, config)


# =========================================================================
# Main generation function
# =========================================================================
SLIDE_SEQUENCE = [
    slide_title,                    # 1
    slide_executive_summary,        # 2
    slide_ttec_performance,         # 3
    slide_industry_overview,        # 4
    slide_ai_trends,                # 5
    slide_ai_disruption,            # 6
    slide_cloud_digital,            # 7
    slide_competitive_landscape,    # 8
    slide_competitor_tier1,         # 9
    slide_competitor_tier2,         # 10
    slide_financial_benchmarking,   # 11
    slide_valuation_comparison,     # 12
    slide_analyst_consensus,        # 13
    slide_capital_allocation,       # 14
    slide_labor_analytics,          # 15
    slide_ma_transactions,          # 16
    slide_regulatory,               # 17
    slide_strategic_implications,   # 18
    slide_appendix,                 # 19
]


def generate(data: dict, config: dict, output_path: str):
    """Generate the full PowerPoint presentation."""
    prs = Presentation()
    prs.slide_width = SLIDE_WIDTH
    prs.slide_height = SLIDE_HEIGHT

    for slide_func in SLIDE_SEQUENCE:
        slide_func(prs, data, config)

    prs.save(output_path)
    print(f"  PowerPoint saved: {output_path}")
