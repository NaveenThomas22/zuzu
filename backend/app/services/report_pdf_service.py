import io
import os
import urllib.request
from datetime import date
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Colors based on Zuzu retro theme
COLOR_CREAM = colors.HexColor("#FFF8E7")
COLOR_DARK = colors.HexColor("#171717")
COLOR_PINK = colors.HexColor("#EF86AC")
COLOR_CYAN = colors.HexColor("#55C7D8")
COLOR_YELLOW = colors.HexColor("#FFF06A")
COLOR_GREEN = colors.HexColor("#A8D5A2")
COLOR_PURPLE = colors.HexColor("#C68BD8")
COLOR_CREAM_ALT = colors.HexColor("#F5EEDB")

# Setup Fonts
FONT_DIR = os.path.join(os.path.dirname(__file__), "fonts")
os.makedirs(FONT_DIR, exist_ok=True)
DEJAVU_SANS_PATH = os.path.join(FONT_DIR, "DejaVuSans.ttf")
DEJAVU_SANS_BOLD_PATH = os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf")

def _ensure_fonts():
    if not os.path.exists(DEJAVU_SANS_PATH):
        urllib.request.urlretrieve("https://raw.githubusercontent.com/prawnpdf/prawn/master/data/fonts/DejaVuSans.ttf", DEJAVU_SANS_PATH)
    if not os.path.exists(DEJAVU_SANS_BOLD_PATH):
        urllib.request.urlretrieve("https://raw.githubusercontent.com/prawnpdf/prawn/master/data/fonts/DejaVuSans-Bold.ttf", DEJAVU_SANS_BOLD_PATH)
    pdfmetrics.registerFont(TTFont('ZuzuFont', DEJAVU_SANS_PATH))
    pdfmetrics.registerFont(TTFont('ZuzuFont-Bold', DEJAVU_SANS_BOLD_PATH))

_ensure_fonts()

def _on_page(canvas, doc):
    canvas.saveState()
    # Background
    canvas.setFillColor(COLOR_CREAM)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    
    # Footer
    canvas.setStrokeColor(COLOR_DARK)
    canvas.setLineWidth(1.5)
    canvas.line(40, 40, A4[0] - 40, 40)
    
    canvas.setFont('ZuzuFont-Bold', 8)
    canvas.setFillColor(COLOR_DARK)
    canvas.drawString(40, 25, "ZUZU — Make Every Rupee Count")
    canvas.drawCentredString(A4[0] / 2, 25, f"GENERATED {date.today().strftime('%d %b %Y').upper()}")
    canvas.drawRightString(A4[0] - 40, 25, f"{doc.page:02d}")
    canvas.restoreState()

def _create_document(buffer):
    return SimpleDocTemplate(
        buffer, 
        pagesize=A4,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=60,
    )

def _get_styles():
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'ZuzuTitle', parent=styles['Heading1'], fontName='ZuzuFont-Bold',
        fontSize=18, textColor=COLOR_DARK, spaceAfter=2,
    )
    metadata_style = ParagraphStyle(
        'ZuzuMetadata', parent=styles['Normal'], fontName='ZuzuFont',
        fontSize=9, textColor=COLOR_DARK, spaceAfter=20, leading=14
    )
    normal_style = ParagraphStyle(
        'ZuzuNormal', parent=styles['Normal'], fontName='ZuzuFont',
        fontSize=9, textColor=COLOR_DARK, leading=14
    )
    return title_style, metadata_style, normal_style

def _format_date(d: date | None) -> str:
    return d.strftime("%d %b %Y").upper() if d else ""

def _format_amt(amount) -> str:
    return f"₹{float(amount or 0):,.2f}"

def zuzu_header_block():
    data = [
        ["ZUZU", "REPORT"],
        ["Make Every Rupee Count", ""]
    ]
    t = Table(data, colWidths=[4*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), COLOR_CYAN),
        ('TEXTCOLOR', (0,0), (-1,-1), COLOR_DARK),
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('FONTNAME', (0,0), (0,0), 'ZuzuFont-Bold'),
        ('FONTSIZE', (0,0), (0,0), 22),
        ('FONTNAME', (1,0), (1,0), 'ZuzuFont-Bold'),
        ('FONTSIZE', (1,0), (1,0), 12),
        ('FONTNAME', (0,1), (0,1), 'ZuzuFont'),
        ('FONTSIZE', (0,1), (0,1), 9),
        ('SPAN', (1,0), (1,1)),
        ('VALIGN', (1,0), (1,0), 'TOP'),
        ('BOX', (0,0), (-1,-1), 1.5, COLOR_DARK),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    return t

def zuzu_section_header(title, bg_color=COLOR_CREAM):
    t = Table([[title.upper()]], colWidths=[7.27*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_color), 
        ('TEXTCOLOR', (0,0), (-1,-1), COLOR_DARK),
        ('FONTNAME', (0,0), (-1,-1), 'ZuzuFont-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('BOX', (0,0), (-1,-1), 1.5, COLOR_DARK),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
    ]))
    return t

def create_summary_card(label, value, bg_color, width=2.3*inch):
    t = Table([[label.upper()], [value]], colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_color),
        ('TEXTCOLOR', (0,0), (-1,-1), COLOR_DARK),
        ('FONTNAME', (0,0), (0,0), 'ZuzuFont-Bold'),
        ('FONTSIZE', (0,0), (0,0), 8),
        ('FONTNAME', (0,1), (0,1), 'ZuzuFont-Bold'),
        ('FONTSIZE', (0,1), (0,1), 14),
        ('BOX', (0,0), (-1,-1), 1.5, COLOR_DARK),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    return t

def _metadata_elements(title: str, start_date: date | None, end_date: date | None, filters: dict = None):
    title_style, metadata_style, _ = _get_styles()
    elements = []
    elements.append(zuzu_header_block())
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph(title, title_style))
    
    if start_date and end_date:
        period_str = f"<b>PERIOD:</b> {_format_date(start_date)} — {_format_date(end_date)}"
    elif start_date:
        period_str = f"<b>PERIOD:</b> SINCE {_format_date(start_date)}"
    elif end_date:
        period_str = f"<b>PERIOD:</b> UNTIL {_format_date(end_date)}"
    else:
        period_str = "<b>PERIOD:</b> ALL TIME"
        
    elements.append(Paragraph(period_str, metadata_style))
    
    if filters:
        filter_data = [["FILTERS", ""]]
        for k, v in filters.items():
            filter_data.append([k.upper(), str(v)])
            
        t_filters = Table(filter_data, colWidths=[1.5*inch, 5.77*inch])
        t_filters.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), COLOR_PINK),
            ('TEXTCOLOR', (0,0), (-1,0), COLOR_DARK),
            ('FONTNAME', (0,0), (-1,-1), 'ZuzuFont-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('BACKGROUND', (0,1), (-1,-1), COLOR_CREAM),
            ('BOX', (0,0), (-1,-1), 1.5, COLOR_DARK),
            ('GRID', (0,0), (-1,-1), 1, COLOR_DARK),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(t_filters)
        elements.append(Spacer(1, 20))
        
    return elements

def build_pdf(elements):
    buffer = io.BytesIO()
    doc = _create_document(buffer)
    doc.build(elements, onFirstPage=_on_page, onLaterPages=_on_page)
    return buffer.getvalue()

def generate_overview_pdf(analytics_data: dict, start_date: date | None, end_date: date | None) -> bytes:
    elements = _metadata_elements("OVERVIEW", start_date, end_date)
    overview = analytics_data.get("overview", {})
    
    cards_row_1 = [
        create_summary_card("OPENING BALANCE", _format_amt(overview.get('opening_balance')), COLOR_CYAN),
        "",
        create_summary_card("INCOME", _format_amt(overview.get('total_income')), COLOR_GREEN),
        "",
        create_summary_card("EXPENSES", _format_amt(overview.get('total_expense')), COLOR_PINK),
    ]
    t_row_1 = Table([cards_row_1], colWidths=[2.3*inch, 0.18*inch, 2.3*inch, 0.18*inch, 2.3*inch])
    t_row_1.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    
    cards_row_2 = [
        create_summary_card("INVESTMENTS", _format_amt(overview.get('total_investment')), COLOR_YELLOW),
        "",
        create_summary_card("LENDING", _format_amt(overview.get('total_lending')), COLOR_PURPLE),
        "",
        create_summary_card("REFUNDS", _format_amt(overview.get('total_refund')), COLOR_CREAM),
    ]
    t_row_2 = Table([cards_row_2], colWidths=[2.3*inch, 0.18*inch, 2.3*inch, 0.18*inch, 2.3*inch])
    t_row_2.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    
    elements.append(t_row_1)
    elements.append(Spacer(1, 15))
    elements.append(t_row_2)
    elements.append(Spacer(1, 20))
    
    closing = create_summary_card("CLOSING BALANCE", _format_amt(overview.get('closing_balance')), COLOR_YELLOW, width=7.27*inch)
    elements.append(closing)
    
    return build_pdf(elements)

def generate_expense_analysis_pdf(analytics_data: dict, start_date: date | None, end_date: date | None) -> bytes:
    elements = _metadata_elements("EXPENSE ANALYSIS", start_date, end_date)
    overview = analytics_data.get("overview", {})
    
    cards_row = [
        create_summary_card("TOTAL EXPENSES", _format_amt(overview.get('total_expense')), COLOR_YELLOW),
        "",
        create_summary_card("NEEDS", _format_amt(overview.get('total_needs')), COLOR_GREEN),
        "",
        create_summary_card("WANTS", _format_amt(overview.get('total_wants')), COLOR_PINK),
    ]
    t_row = Table([cards_row], colWidths=[2.3*inch, 0.18*inch, 2.3*inch, 0.18*inch, 2.3*inch])
    t_row.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    
    elements.append(t_row)
    elements.append(Spacer(1, 25))
    
    elements.append(KeepTogether([
        zuzu_section_header("EXPENSE BY CATEGORY", COLOR_PINK),
        Spacer(1, 10),
        _build_category_table(analytics_data.get("expense_by_category", []), overview.get('total_expense', 0))
    ]))
    
    elements.append(Spacer(1, 25))
    
    total_expense = float(overview.get('total_expense', 0))
    total_needs = float(overview.get('total_needs', 0))
    total_wants = float(overview.get('total_wants', 0))
    
    need_pct = (total_needs / total_expense * 100) if total_expense else 0
    want_pct = (total_wants / total_expense * 100) if total_expense else 0
    
    need_bar = "█" * int(need_pct / 2.5) if need_pct > 0 else ""
    want_bar = "█" * int(want_pct / 2.5) if want_pct > 0 else ""
    
    _, _, normal_style = _get_styles()
    
    nw_data = [
        [Paragraph(f"<b>NEED</b>", normal_style), _format_amt(total_needs)],
        [Paragraph(f"<font color='{COLOR_GREEN.hexval()}'>{need_bar}</font>", normal_style), ""],
        [Paragraph(f"<b>WANT</b>", normal_style), _format_amt(total_wants)],
        [Paragraph(f"<font color='{COLOR_PINK.hexval()}'>{want_bar}</font>", normal_style), ""],
    ]
    t_nw = Table(nw_data, colWidths=[5.27*inch, 2*inch])
    t_nw.setStyle(TableStyle([
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('FONTNAME', (1,0), (1,-1), 'ZuzuFont-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 1.5, COLOR_DARK),
        ('BACKGROUND', (0,0), (-1,-1), COLOR_CREAM),
    ]))
    
    elements.append(KeepTogether([
        zuzu_section_header("NEED VS WANT", COLOR_CREAM),
        Spacer(1, 10),
        t_nw
    ]))
    
    return build_pdf(elements)

def _build_category_table(cat_data, total_expense):
    _, _, normal_style = _get_styles()
    if not cat_data:
        return Paragraph("No category data found.", normal_style)
        
    t_data = [["CATEGORY", "AMOUNT", "%"]]
    for c in cat_data:
        amt = float(c.get('amount', 0))
        pct = (amt / float(total_expense) * 100) if float(total_expense) else 0
        t_data.append([
            c.get("category_name", ""),
            _format_amt(amt),
            f"{pct:.0f}%"
        ])
        
    t_cat = Table(t_data, colWidths=[3.27*inch, 2*inch, 2*inch])
    
    style = [
        ('BACKGROUND', (0,0), (-1,0), COLOR_CREAM),
        ('TEXTCOLOR', (0,0), (-1,0), COLOR_DARK),
        ('ALIGN', (0,0), (0,-1), 'LEFT'),
        ('ALIGN', (1,0), (2,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (-1,0), 'ZuzuFont-Bold'),
        ('FONTNAME', (0,1), (-1,-1), 'ZuzuFont'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 1, COLOR_DARK),
        ('BOX', (0,0), (-1,-1), 1.5, COLOR_DARK),
    ]
    for i in range(1, len(t_data)):
        bg = COLOR_CREAM if i % 2 != 0 else COLOR_CREAM_ALT
        style.append(('BACKGROUND', (0,i), (-1,i), bg))
        
    t_cat.setStyle(TableStyle(style))
    return t_cat

def generate_expense_list_pdf(transactions: list, accounts: dict, categories: dict, subcategories: dict, start_date: date | None, end_date: date | None, filters: dict = None) -> bytes:
    elements = _metadata_elements("EXPENSE LIST", start_date, end_date, filters)
    
    t_data = [["DATE", "ITEM", "CATEGORY", "ACCOUNT", "TYPE", "AMOUNT"]]
    total = 0
    for t in transactions:
        need_or_want = str(t.need_or_want).split(".")[-1] if t.need_or_want else ""
        t_data.append([
            t.transaction_date.strftime("%Y-%m-%d") if t.transaction_date else "",
            t.item_name or "",
            categories.get(t.category_id, ""),
            accounts.get(t.account_id, ""),
            need_or_want.upper(),
            _format_amt(t.amount)
        ])
        total += float(t.amount)
        
    t_data.append(["TOTAL", "", "", "", "", _format_amt(total)])
        
    table = Table(t_data, colWidths=[0.9*inch, 1.87*inch, 1.2*inch, 1.2*inch, 0.9*inch, 1.2*inch], repeatRows=1)
    
    style = [
        ('BACKGROUND', (0,0), (-1,0), COLOR_CYAN),
        ('TEXTCOLOR', (0,0), (-1,0), COLOR_DARK),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (5,0), (5,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (-1,0), 'ZuzuFont-Bold'),
        ('FONTNAME', (0,1), (-1,-1), 'ZuzuFont'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 1, COLOR_DARK),
        ('BOX', (0,0), (-1,-1), 1.5, COLOR_DARK),
        ('BACKGROUND', (0,-1), (-1,-1), COLOR_YELLOW),
        ('FONTNAME', (0,-1), (-1,-1), 'ZuzuFont-Bold'),
    ]
    
    for i in range(1, len(t_data) - 1):
        bg = COLOR_CREAM if i % 2 != 0 else COLOR_CREAM_ALT
        style.append(('BACKGROUND', (0,i), (-1,i), bg))
        
    table.setStyle(TableStyle(style))
    
    cards_row = [
        create_summary_card("RECORDS", str(len(transactions)), COLOR_CREAM),
        "",
        create_summary_card("TOTAL", _format_amt(total), COLOR_YELLOW),
        "",
        ""
    ]
    t_row = Table([cards_row], colWidths=[2.3*inch, 0.18*inch, 2.3*inch, 0.18*inch, 2.3*inch])
    
    elements.append(t_row)
    elements.append(Spacer(1, 20))
    elements.append(table)
    
    return build_pdf(elements)

def generate_income_history_pdf(transactions: list, accounts: dict, start_date: date | None, end_date: date | None, filters: dict = None) -> bytes:
    elements = _metadata_elements("INCOME HISTORY", start_date, end_date, filters)
    
    t_data = [["DATE", "DESCRIPTION", "ACCOUNT", "AMOUNT"]]
    total = 0
    for t in transactions:
        desc = t.item_name or t.description or "Income"
        t_data.append([
            t.transaction_date.strftime("%Y-%m-%d") if t.transaction_date else "",
            desc,
            accounts.get(t.account_id, ""),
            _format_amt(t.amount)
        ])
        total += float(t.amount)
        
    t_data.append(["TOTAL", "", "", _format_amt(total)])
        
    table = Table(t_data, colWidths=[1.2*inch, 3.27*inch, 1.4*inch, 1.4*inch], repeatRows=1)
    
    style = [
        ('BACKGROUND', (0,0), (-1,0), COLOR_PINK),
        ('TEXTCOLOR', (0,0), (-1,0), COLOR_DARK),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (3,0), (3,-1), 'RIGHT'),
        ('FONTNAME', (0,0), (-1,0), 'ZuzuFont-Bold'),
        ('FONTNAME', (0,1), (-1,-1), 'ZuzuFont'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 1, COLOR_DARK),
        ('BOX', (0,0), (-1,-1), 1.5, COLOR_DARK),
        ('BACKGROUND', (0,-1), (-1,-1), COLOR_YELLOW),
        ('FONTNAME', (0,-1), (-1,-1), 'ZuzuFont-Bold'),
    ]
    
    for i in range(1, len(t_data) - 1):
        bg = COLOR_CREAM if i % 2 != 0 else COLOR_CREAM_ALT
        style.append(('BACKGROUND', (0,i), (-1,i), bg))
        
    table.setStyle(TableStyle(style))
    
    cards_row = [
        create_summary_card("RECORDS", str(len(transactions)), COLOR_CREAM),
        "",
        create_summary_card("TOTAL", _format_amt(total), COLOR_GREEN),
        "",
        ""
    ]
    t_row = Table([cards_row], colWidths=[2.3*inch, 0.18*inch, 2.3*inch, 0.18*inch, 2.3*inch])
    
    elements.append(t_row)
    elements.append(Spacer(1, 20))
    elements.append(table)
    
    return build_pdf(elements)
