import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#536779"))
        
        # Don't show header/footer on cover/first page
        if self._pageNumber > 1:
            # Header
            self.drawString(36, A4[1] - 28, "PSB & Associates LLP — Website Typography Specification")
            self.drawRightString(A4[0] - 36, A4[1] - 28, "October 2026 Audit")
            self.setStrokeColor(colors.HexColor("#D8E2E9"))
            self.setLineWidth(0.5)
            self.line(36, A4[1] - 32, A4[0] - 36, A4[1] - 32)
            
            # Footer
            self.line(36, 32, A4[0] - 36, 32)
            self.drawString(36, 20, "Confidential — Font Families, Weights, Sizes & Section Breakdown")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(A4[0] - 36, 20, page_text)
            
        self.restoreState()

def build_pdf(filename="PSB_Associates_Typography_Specification.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=44
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    NAVY = colors.HexColor("#10273B")
    DEEP = colors.HexColor("#091C2D")
    GOLD = colors.HexColor("#B89052")
    SLATE = colors.HexColor("#536779")
    PALE = colors.HexColor("#F5F8FA")
    LINE = colors.HexColor("#D8E2E9")
    WHITE = colors.HexColor("#FFFFFF")
    WARN_BG = colors.HexColor("#FFF8EE")
    WARN_BORDER = colors.HexColor("#DDA355")
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=NAVY,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=SLATE,
        spaceAfter=14
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=NAVY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=GOLD,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1D2B36")
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#7C531E")
    )
    
    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=WHITE
    )
    
    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#1D2B36")
    )

    td_bold = ParagraphStyle(
        'TableCellBold',
        parent=td_style,
        fontName='Helvetica-Bold'
    )

    td_serif = ParagraphStyle(
        'TableCellSerif',
        parent=td_style,
        fontName='Times-BoldItalic',
        textColor=colors.HexColor("#94703C")
    )

    td_warn = ParagraphStyle(
        'TableCellWarn',
        parent=td_style,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor("#B24314")
    )

    story = []

    # Title Banner
    story.append(Spacer(1, 10))
    story.append(Paragraph("PSB &amp; ASSOCIATES LLP", ParagraphStyle('Eyebrow', fontName='Helvetica-Bold', fontSize=9, textColor=GOLD, leading=12, spaceAfter=4)))
    story.append(Paragraph("Complete Website Typography &amp; Font Style Specification", title_style))
    story.append(Paragraph("Detailed audit of font families, styles, weights, and desktop/mobile sizes used across every section of all 25 pages in the current codebase.", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceBefore=4, spaceAfter=14))

    # Executive Summary Card
    summary_data = [
        [
            Paragraph("<b>Core Fonts Installed in Codebase:</b><br/>"
                      "• <b>Manrope (Sans-serif)</b>: Headings, numerical metrics, partner titles, and logo subtitle.<br/>"
                      "• <b>DM Sans (Sans-serif)</b>: Body copy, navigation, buttons, form controls, footer, and Briefing headlines.<br/>"
                      "• <b>Libre Baskerville (Serif)</b>: Header &amp; footer brand name ('PSB &amp; Associates LLP').<br/>"
                      "• <b>Georgia (System Serif)</b>: Italic decorative accent in Homepage hero (<i>'A clearer future.'</i>) and background art watermark ('&amp;').<br/>"
                      "• <b>Times New Roman (Browser default)</b>: Renders on unstyled legacy redirect stubs (/industries/ &amp; /resources/).", body_style)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[A4[0] - 72])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PALE),
        ('BOX', (0, 0), (-1, -1), 1, LINE),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 14))

    # SECTION 1: GLOBAL DESIGN SYSTEM SPECIFICATION
    story.append(Paragraph("1. Global Typography System &amp; Shared Layout Elements", h1_style))
    story.append(Paragraph("The header and footer are shared across all pages, maintaining consistent baseline branding and navigation styles:", body_style))
    story.append(Spacer(1, 6))

    global_headers = ["Layout Element", "Component / Selector", "Font Family", "Font Weight", "Desktop Size", "Mobile Size", "Visual Notes"]
    global_rows = [
        ["Header Brand", "header .brand > div", "Libre Baskerville, Georgia, serif", "400 Regular", "1.35rem (21.6px) / 1.6rem", "clamp(0.88rem, 3.6vw, 1.12rem)", "Editorial serif; primary firm brand title"],
        ["Header Brand", "header .brand small", "Manrope, Arial, sans-serif", "500 Medium", "0.76rem (12.2px)", "0.66rem (10.6px)", "Sans-serif uppercase descriptor ('Chartered Accountants')"],
        ["Navigation", "header nav a", "DM Sans, Arial, sans-serif", "500 Medium", "0.82rem – 0.875rem (14px)", "0.9375rem – 1rem (16px)", "Main menu links; 44px tap target on mobile"],
        ["Nav CTA", "header .nav-contact", "DM Sans, Arial, sans-serif", "500 Medium", "0.82rem (13.1px)", "0.9375rem (15px)", "Outlined box CTA ('Contact us')"],
        ["Menu Toggle", "header .menu-toggle", "DM Sans, Arial, sans-serif", "500 Medium", "Hidden > 1100px", "1.5rem icon (24px)", "Hamburger drawer trigger on phone/tablet"],
        ["Reading Bar", ".reading-progress", "N/A (height 3px bar)", "N/A", "Fixed top bar", "Fixed top bar", "Gold scroll indicator across top edge"],
        ["Footer Brand", ".footer-identities .brand div", "Libre Baskerville, Georgia, serif", "400 Regular", "1.35rem (21.6px)", "1.08rem – 1.12rem", "Matches header brand typography"],
        ["Footer Brand", ".footer-identities .brand small", "Manrope, Arial, sans-serif", "500 Medium", "0.76rem (12.2px)", "0.66rem (10.6px)", "Matches header subtitle typography"],
        ["Footer Tagline", ".footer-grid p", "DM Sans, Arial, sans-serif", "400 Regular", "0.875rem (14px)", "0.875rem (14px)", "Line height 1.8; firm summary under logo"],
        ["Footer Accordion", ".footer-links > summary", "DM Sans, sans-serif", "700 Bold", "0.75rem – 0.8125rem", "0.8125rem (13px)", "Uppercase letter-spacing 0.1em"],
        ["Footer Links", ".footer-links a, footer a", "DM Sans, Arial, sans-serif", "400 Regular", "0.875rem (14px)", "0.875rem (14px)", "Explore & Practice area navigation links"],
        ["Footer Legal", ".footer-bottom > p", "DM Sans, Arial, sans-serif", "400 Regular", "0.75rem – 0.8125rem (13px)", "0.8125rem (13px)", "ICAI non-advertisement mandatory disclaimer"],
        ["Footer Meta", ".footer-bottom > div", "DM Sans, Arial, sans-serif", "400 Regular", "0.8125rem (13px)", "0.8125rem (13px)", "Copyright & legal policy links"]
    ]

    t_global = Table([[Paragraph(c, th_style) for c in global_headers]] + [[Paragraph(cell, td_style) for cell in row] for row in global_rows], colWidths=[70, 85, 95, 55, 65, 65, 88])
    t_global.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, PALE]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_global)
    story.append(Spacer(1, 14))

    # SECTION 2: HOMEPAGE IN-DEPTH BREAKDOWN
    story.append(Paragraph("2. Page: Homepage ('/')", h1_style))
    story.append(Paragraph("The Homepage features a distinctive typography mix where modern sans-serif headings are blended with editorial serif italic accents:", body_style))
    story.append(Spacer(1, 6))

    home_headers = ["Section", "Element / Text", "Font Family", "Font Weight", "Desktop Size", "Mobile Size", "Key Observation"]
    home_rows = [
        ["Hero Headline", "h1: 'Your business. / Our expertise.'", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "Clean sans-serif modern grotesque headline"],
        ["Hero Accent", "h1 em: 'A clearer future.'", "Georgia, serif", "400 Italic", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "★ SERIF ITALIC CONTRAST with warm gold (#94703C)"],
        ["Hero Body", ".home-hero-copy > p", "DM Sans, Arial, sans-serif", "400 Regular", "1.08rem – 1.1rem (17.6px)", "1rem (16px)", "Lead paragraph line-height 1.75"],
        ["Hero CTAs", ".home-actions .button", "DM Sans, Arial, sans-serif", "500 Medium", "0.875rem (14px)", "0.875rem (14px)", "Navy button ('Let's talk business')"],
        ["Hero Secondary", ".home-actions .home-secondary", "DM Sans, Arial, sans-serif", "500 Medium", "0.93rem (14.9px)", "0.875rem (14px)", "Text link CTA with directional arrow"],
        ["Partner Stack", ".home-partners strong", "DM Sans, Arial, sans-serif", "600 Semi-Bold", "0.875rem (14px)", "0.75rem (12px)", "Partner avatar bar lead text"],
        ["Partner Sub", ".home-partners small", "DM Sans, Arial, sans-serif", "400 Regular", "0.8125rem (13px)", "0.75rem (12px)", "Muted subtitle ('Meet the partners behind PSB')"],
        ["Art Card Title", ".perspective-heading h2", "Manrope, Arial, sans-serif", "500 Medium", "2rem (32px)", "2rem (32px)", "'Every detail. / The bigger picture.'"],
        ["Art Card Mark", ".art-mark ('&')", "Georgia, serif", "400 Italic", "370px (giant background)", "Hidden/Scaled", "★ GIANT SERIF WATERMARK (#C5B18518)"],
        ["Art Card Items", ".perspective-practices a", "Manrope, Arial, sans-serif", "500 Medium", "0.95rem (15.2px)", "0.95rem (15.2px)", "Numbered practices 01 to 04 with arrow"],
        ["Briefing Intro", ".briefing-intro .eyebrow", "DM Sans, Arial, sans-serif", "700 Bold", "0.75rem (12px)", "0.67rem (10.7px)", "Uppercase tracking 0.17em ('THE PSB BRIEFING')"],
        ["Briefing Intro", ".briefing-intro h2", "Manrope, Arial, sans-serif", "500 Medium", "2.8rem (44.8px)", "2rem (32px)", "Updates section title ('Updates that matter.')"],
        ["Briefing Feeds", ".news-item h3", "DM Sans, sans-serif", "500 Medium", "0.88rem – 0.9375rem", "0.9375rem (15px)", "★ OVERRIDE: Uses DM Sans instead of Manrope h3"],
        ["Feed Meta", ".news-meta time, .category-badge", "DM Sans, Arial, sans-serif", "600 Semi-Bold", "0.6rem – 0.75rem", "0.6875rem – 0.75rem", "Badges for GST, Income Tax, ICAI, RBI"],
        ["Firm Strip", ".firm-strip strong", "Manrope, sans-serif", "400 – 500", "2.4rem (38.4px)", "1.7rem (27.2px)", "Numbers ('2013', '13+', '03', '03')"],
        ["Firm Strip", ".firm-strip span", "DM Sans, Arial, sans-serif", "400 Regular", "0.84rem (13.4px)", "0.76rem (12.2px)", "Labels under metrics"],
        ["Firm Section", ".firm-section .lead", "DM Sans, Arial, sans-serif", "400 Regular", "1rem – 1.45rem", "1.1rem (17.6px)", "Firm intro paragraph"],
        ["Our People", ".people-section h2", "Manrope, Arial, sans-serif", "500 Medium", "1.65rem (26.4px)", "1.65rem (26.4px)", "'Experience with a personal perspective.'"],
        ["Partner Card", ".person h3", "Manrope, Arial, sans-serif", "500 Medium", "1rem (16px)", "1.3rem (20.8px)", "Partner names (Pavan, Sagar, Bharadwaj)"],
        ["Partner Meta", ".person-meta span:first-child", "DM Sans, Arial, sans-serif", "700 Bold", "0.65rem (10.4px)", "0.7rem (11.2px)", "Uppercase role tag ('FOUNDING PARTNER')"],
        ["Contact Band", ".contact-band h2", "Manrope, Arial, sans-serif", "500 Medium", "clamp(1.5rem, 2.3vw, 2rem)", "1.4rem – 2rem", "Closing call to action block"]
    ]

    t_home = Table([[Paragraph(c, th_style) for c in home_headers]] + [[Paragraph(cell, td_serif if "★" in cell else td_style) for cell in row] for row in home_rows], colWidths=[65, 95, 95, 55, 65, 65, 84])
    t_home.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, PALE]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_home)
    story.append(Spacer(1, 14))

    # SECTION 3: THE FIRM (ABOUT PAGE)
    story.append(Paragraph("3. Page: The Firm / About ('/about/')", h1_style))
    story.append(Paragraph("Unlike the Homepage, the About page headline has NO serif accent and is rendered entirely in geometric sans-serif:", body_style))
    story.append(Spacer(1, 6))

    about_headers = ["Section", "Element / Text", "Font Family", "Font Weight", "Desktop Size", "Mobile Size", "Key Observation"]
    about_rows = [
        ["Page Intro", ".eyebrow: 'THE FIRM'", "DM Sans, Arial, sans-serif", "700 Bold", "0.75rem (12px)", "0.67rem (10.7px)", "Uppercase tracking 0.17em; warm gold"],
        ["Page Title", "h1: 'Built on integrity. / Focused on understanding.'", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "★ 100% SANS-SERIF (No italic serif accent)"],
        ["Page Intro Lead", ".page-intro > p", "DM Sans, Arial, sans-serif", "400 Regular", "1.08rem (17.3px)", "1.05rem (16.8px)", "Lead description below H1"],
        ["Office Photo", ".about-photo span", "DM Sans, Arial, sans-serif", "700 Bold", "0.6rem (9.6px)", "0.6rem (9.6px)", "Uppercase caption below office photo"],
        ["About Narrative", ".about-body h2", "Manrope, Arial, sans-serif", "500 Medium", "2rem (32px)", "2rem (32px)", "'A practical perspective, backed by experience.'"],
        ["About Body", ".about-body p", "DM Sans, Arial, sans-serif", "400 Regular", "1rem (16px)", "1rem (16px)", "Firm practice history and client coverage"],
        ["Disclosure", ".view-more summary", "DM Sans, Arial, sans-serif", "600 Semi-Bold", "0.875rem (14px)", "0.875rem (14px)", "'View more about our practice'"],
        ["Principles Head", ".firm-principles h2", "Manrope, Arial, sans-serif", "500 Medium", "2rem (32px)", "2rem (32px)", "'Principles that shape our practice.'"],
        ["Principle Title", ".three-col h3", "Manrope, Arial, sans-serif", "500 Medium", "1.2rem (19.2px)", "1.2rem (19.2px)", "H3 for Partner involvement, Compliance, Oversight"],
        ["Principle Copy", ".three-col p", "DM Sans, Arial, sans-serif", "400 Regular", "0.95rem (15.2px)", "0.95rem (15.2px)", "Descriptive paragraph per principle"],
        ["Contact Band", ".contact-band h2", "Manrope, Arial, sans-serif", "500 Medium", "clamp(1.5rem, 2.3vw, 2rem)", "1.4rem – 2rem", "Standard shared contact block"]
    ]

    t_about = Table([[Paragraph(c, th_style) for c in about_headers]] + [[Paragraph(cell, td_style) for cell in row] for row in about_rows], colWidths=[65, 95, 95, 55, 65, 65, 84])
    t_about.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, PALE]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_about)
    story.append(Spacer(1, 14))

    # SECTION 4: SERVICES INDEX & PRACTICE DETAIL PAGES
    story.append(Paragraph("4. Page: Expertise &amp; Industries ('/services/') and Core Practice Pages", h1_style))
    story.append(Paragraph("Covers the main index and 4 core practices: Audit &amp; Assurance, Taxation, Corporate Advisory, and Accounting &amp; Virtual CFO:", body_style))
    story.append(Spacer(1, 6))

    serv_headers = ["Section", "Element / Text", "Font Family", "Font Weight", "Desktop Size", "Mobile Size", "Key Observation"]
    serv_rows = [
        ["Services H1", ".page-intro h1", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "Clean sans-serif ('Expertise for your business.')"],
        ["Practice Card", ".practice-card h3", "Manrope, Arial, sans-serif", "500 Medium", "1.45rem – 1.6rem (24px)", "1.25rem – 1.4rem (22px)", "4 practice cards on services index"],
        ["Practice Num", ".practice-top .number", "DM Sans, Arial, sans-serif", "700 Bold", "0.7rem – 0.82rem", "0.7rem (11.2px)", "Numbered labels '01 / 04' to '04 / 04'"],
        ["Specialist Link", ".specialist-links h2", "Manrope, Arial, sans-serif", "500 Medium", "2rem (32px)", "2rem (32px)", "'Specialist support' heading"],
        ["Specialist Item", ".specialist-links a", "DM Sans, Arial, sans-serif", "500 Medium", "0.93rem (14.9px)", "0.93rem (14.9px)", "Links to NGO, GST Litigation, LLP pages"],
        ["Industries Head", ".merged-industries h2", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2rem, 3.15vw, 3rem)", "2rem (32px)", "'Experience across sectors.'"],
        ["Industry Sector", ".sector-disclosure summary", "Manrope, Arial, sans-serif", "600 Semi-Bold", "1rem (16px)", "0.9rem (14.4px)", "9 sector disclosure summaries with '+' icon"],
        ["Industry Detail", ".sector-disclosure p", "DM Sans, Arial, sans-serif", "400 Regular", "0.9375rem – 1rem", "0.9375rem (15px)", "Sector client overview text"],
        ["FAQ Question", ".page-services .faq-list summary", "Manrope, Arial, sans-serif", "600 Semi-Bold", "1rem (16px)", "0.9375rem (15px)", "Interactive questions with plus icon"],
        ["FAQ Answer", ".page-services .faq-list details p", "DM Sans, Arial, sans-serif", "400 Regular", "1rem (16px)", "1rem (16px)", "Detailed answer body text"],
        ["Detail Sidebar", ".detail-layout aside a", "DM Sans, Arial, sans-serif", "500 – 600", "0.9rem (14.4px)", "0.9rem (14.4px)", "Current page highlighted in gold (#9B7138)"],
        ["Scope Heading", ".scope-heading, .detail-layout h2", "Manrope, Arial, sans-serif", "500 Medium", "1.8rem (28.8px)", "1.7rem (27.2px)", "'Scope of services', 'Our approach'"],
        ["Scope Item", ".service-list > div", "DM Sans, Arial, sans-serif", "400 Regular", "0.95rem – 1rem", "0.94rem (15px)", "Numbered deliverable list"],
        ["Scope Number", ".service-list span", "DM Sans, Arial, sans-serif", "700 Bold", "0.75rem (12px)", "0.75rem (12px)", "Warm gold index number ('01', '02', etc.)"],
        ["Common Qs", ".service-answers h2", "Manrope, Arial, sans-serif", "500 Medium", "1.8rem (28.8px)", "1.7rem (27.2px)", "Bottom FAQ section on practice detail pages"]
    ]

    t_serv = Table([[Paragraph(c, th_style) for c in serv_headers]] + [[Paragraph(cell, td_style) for cell in row] for row in serv_rows], colWidths=[65, 95, 95, 55, 65, 65, 84])
    t_serv.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, PALE]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_serv)
    story.append(Spacer(1, 14))

    # SECTION 5: SPECIALIST SERVICE PAGES
    story.append(Paragraph("5. Specialist Services (NGO Registrations, GST Litigation, LLP Structuring)", h1_style))
    story.append(Paragraph("Three dedicated advisory pages: `/services/ngo-public-trust-registrations/`, `/services/gst-litigation-dispute-resolution/`, `/services/llp-partnership-structuring/`:", body_style))
    story.append(Spacer(1, 6))

    spec_headers = ["Section", "Element / Text", "Font Family", "Font Weight", "Desktop Size", "Mobile Size", "Key Observation"]
    spec_rows = [
        ["Page Eyebrow", ".page-intro .eyebrow", "DM Sans, Arial, sans-serif", "700 Bold", "0.75rem (12px)", "0.67rem (10.7px)", "'NONPROFIT ADVISORY', 'INDIRECT TAX', etc."],
        ["Page H1", ".page-intro h1", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "Full service title in pure Manrope sans-serif"],
        ["Intro Lead", ".detail-layout .lead", "DM Sans, Arial, sans-serif", "400 Regular", "1.3rem – 1.45rem", "1.1rem (17.6px)", "Detailed summary of regulatory context"],
        ["Specialist Card", ".specialist-card h3", "Manrope, Arial, sans-serif", "500 Medium", "1.45rem (23.2px)", "1.3rem (20.8px)", "Card titles across related services"],
        ["Specialist Tag", ".specialist-card > span", "DM Sans, Arial, sans-serif", "700 Bold", "0.68rem (10.9px)", "0.68rem (10.9px)", "Gold badge label ('INDIRECT TAX', etc.)"],
        ["Legal Ref Note", ".legal-reference", "DM Sans, Arial, sans-serif", "400 Regular", "0.82rem (13.1px)", "0.82rem (13.1px)", "Statutory reference note with gold left border"]
    ]

    t_spec = Table([[Paragraph(c, th_style) for c in spec_headers]] + [[Paragraph(cell, td_style) for cell in row] for row in spec_rows], colWidths=[65, 95, 95, 55, 65, 65, 84])
    t_spec.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, PALE]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_spec)
    story.append(Spacer(1, 14))

    # SECTION 6: OUR PEOPLE & PARTNER PROFILE PAGES
    story.append(Paragraph("6. Pages: Our People ('/partners/') and Individual Partner Profiles", h1_style))
    story.append(Paragraph("Covers the main partners directory and individual profiles for CA Pavan Toshniwal, CA Bharadwaj Mandhane, and CA Sagar Nikam:", body_style))
    story.append(Spacer(1, 6))

    part_headers = ["Section", "Element / Text", "Font Family", "Font Weight", "Desktop Size", "Mobile Size", "Key Observation"]
    part_rows = [
        ["Directory H1", ".page-intro h1", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "'Partner-led. Personally involved.'"],
        ["Directory Lead", ".page-intro > p", "DM Sans, Arial, sans-serif", "400 Regular", "1.08rem (17.3px)", "1.05rem (16.8px)", "Partner team overview"],
        ["Partner Card H3", ".people-grid .person h3", "Manrope, Arial, sans-serif", "500 Medium", "1rem (16px)", "1.3rem (20.8px)", "Partner name in 3-column grid"],
        ["Partner Qual", ".people-grid .person p", "DM Sans, Arial, sans-serif", "400 Regular", "0.875rem (14px)", "0.9rem (14.4px)", "Qualifications (FCA, ACA, M.Com.)"],
        ["Profile H1", ".partner-profile h1", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "Partner full name (e.g. 'CA Pavan S. Toshniwal')"],
        ["Profile Eyebrow", ".partner-profile .eyebrow", "DM Sans, Arial, sans-serif", "700 Bold", "0.7rem – 0.75rem", "0.67rem (10.7px)", "Role badge ('FOUNDING PARTNER', 'PARTNER')"],
        ["Profile Qual", ".partner-profile .qualification", "DM Sans, Arial, sans-serif", "500 Medium", "1rem (16px)", "1rem (16px)", "Degrees & professional accreditations"],
        ["Profile Bio", ".partner-profile .lead", "DM Sans, Arial, sans-serif", "400 Regular", "1.1rem (17.6px)", "1.1rem (17.6px)", "Career background and practice leadership"],
        ["Profile Focus", ".partner-profile .lead + p", "DM Sans, Arial, sans-serif", "400 Regular", "1rem (16px)", "1rem (16px)", "Specific tax, audit, or corporate focus areas"]
    ]

    t_part = Table([[Paragraph(c, th_style) for c in part_headers]] + [[Paragraph(cell, td_style) for cell in row] for row in part_rows], colWidths=[65, 95, 95, 55, 65, 65, 84])
    t_part.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, PALE]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_part)
    story.append(Spacer(1, 14))

    # SECTION 7: CAREERS & CONTACT PAGES (FORMS BUNDLE)
    story.append(Paragraph("7. Pages: Careers ('/careers/') and Contact &amp; Offices ('/contact/')", h1_style))
    story.append(Paragraph("These two pages load the specialized forms bundle (`forms-*.css`), featuring rich form inputs and office cards:", body_style))
    story.append(Spacer(1, 6))

    form_headers = ["Section", "Element / Text", "Font Family", "Font Weight", "Desktop Size", "Mobile Size", "Key Observation"]
    form_rows = [
        ["Contact Intro", ".contact-introduction .contact-eyebrow", "DM Sans, Arial, sans-serif", "700 Bold", "0.75rem (12px)", "0.75rem (12px)", "Uppercase letter-spacing 0.18em with gold line"],
        ["Contact Title", ".contact-introduction h1", "Manrope, Arial, sans-serif", "500 – 600", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "'A conversation starts with understanding.'"],
        ["Contact Lead", ".contact-lead", "DM Sans, Arial, sans-serif", "400 Regular", "1.15rem (18.4px)", "1rem (16px)", "Contact panel descriptive intro"],
        ["Contact Details", ".contact-detail-label", "DM Sans, Arial, sans-serif", "400 Regular", "0.95rem (15.2px)", "0.875rem (14px)", "'Write to us', 'Working hours', 'Head office'"],
        ["Contact Value", ".contact-email, .contact-detail-value", "Manrope, Arial, sans-serif", "500 Medium", "clamp(1.1rem, 1.7vw, 1.55rem)", "1rem (16px)", "Email address and phone number text"],
        ["Contact Hours", ".contact-details .contact-hours", "DM Sans, Arial, sans-serif", "400 Regular", "1.1rem (17.6px)", "0.9375rem (15px)", "'10:30 AM–7:30 PM IST'"],
        ["Form Heading", ".contact-form-heading h2", "Manrope, Arial, sans-serif", "500 Medium", "1.8rem – 2rem", "1.8rem (28.8px)", "'Share the context.' / 'Your application.'"],
        ["Form Labels", ".contact-form label", "DM Sans, Arial, sans-serif", "500 Medium", "0.85rem (13.6px)", "0.85rem (13.6px)", "Field descriptions above form inputs"],
        ["Form Inputs", ".contact-form input, select, textarea", "DM Sans, Arial, sans-serif", "400 Regular", "1rem (16px)", "1rem (16px)", "Inputs sized at 16px to prevent iOS auto-zoom"],
        ["Service Dropdown", ".contact-service-trigger", "DM Sans, Arial, sans-serif", "400 Regular", "0.875rem (14px)", "0.875rem (14px)", "Interactive multi-select area trigger"],
        ["Consent Notice", ".contact-consent", "DM Sans, Arial, sans-serif", "400 Regular", "0.8125rem – 0.85rem", "0.8125rem (13px)", "Privacy agreement and disclaimer link"],
        ["Submit CTA", ".contact-submit", "DM Sans, Arial, sans-serif", "600 Semi-Bold", "1rem (16px)", "1rem (16px)", "'Send enquiry' / 'Send application'"],
        ["Form Note", ".contact-form-note", "DM Sans, Arial, sans-serif", "400 Regular", "0.8125rem (13px)", "0.8125rem (13px)", "Confidentiality & delivery notice"],
        ["Offices Head", ".contact-offices-heading h2", "Manrope, Arial, sans-serif", "500 Medium", "clamp(1.8rem, 2.7vw, 2.5rem)", "1.8rem (28.8px)", "'Our offices.'"],
        ["Office Card", ".contact-office-card h3", "Manrope, Arial, sans-serif", "500 Medium", "1.55rem – 1.7rem", "1.55rem (24.8px)", "City names (Chhatrapati Sambhajinagar, Hingoli, Pune)"],
        ["Office Address", ".contact-office-address", "DM Sans, Arial, sans-serif", "400 Regular", "0.95rem (15.2px)", "0.95rem (15.2px)", "Full physical street address"],
        ["Careers Intro", ".career-application-copy h1", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "'Join our team.'"],
        ["Careers Subhead", "#career-opportunity-title", "Manrope, Arial, sans-serif", "500 Medium", "1.65rem – 2rem", "1.65rem (26.4px)", "'Build your career with practical experience.'"]
    ]

    t_form = Table([[Paragraph(c, th_style) for c in form_headers]] + [[Paragraph(cell, td_style) for cell in row] for row in form_rows], colWidths=[65, 95, 95, 55, 65, 65, 84])
    t_form.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, PALE]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_form)
    story.append(Spacer(1, 14))

    # SECTION 8: LEGAL, RESOURCES, THANK YOU, 404 & REDIRECTS
    story.append(Paragraph("8. Legal Pages, Insight Articles, Thank You, 404 &amp; Legacy Redirects", h1_style))
    story.append(Paragraph("Covers `/privacy/`, `/disclaimer/`, `/resources/*`, `/thank-you/`, `/404.html`, `/industries/`, and `/resources/`:", body_style))
    story.append(Spacer(1, 6))

    other_headers = ["Page / Route", "Element / Text", "Font Family", "Font Weight", "Desktop Size", "Mobile Size", "Key Observation"]
    other_rows = [
        ["Privacy / Disclaimer", ".page-intro h1", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "Standard sans-serif page title"],
        ["Privacy / Disclaimer", ".legal h2", "Manrope, Arial, sans-serif", "500 Medium", "1.7rem (27.2px)", "1.7rem (27.2px)", "Section subheadings (e.g. 'Information you provide')"],
        ["Privacy / Disclaimer", ".legal p", "DM Sans, Arial, sans-serif", "400 Regular", "1rem (16px)", "1rem (16px)", "Policy text paragraphs; justified alignment"],
        ["Insight Articles", ".page-intro .eyebrow", "DM Sans, Arial, sans-serif", "700 Bold", "0.75rem (12px)", "0.67rem (10.7px)", "Category badge (e.g. 'GST & COMPLIANCE')"],
        ["Insight Articles", ".page-intro h1", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "Full article title in Manrope sans-serif"],
        ["Insight Articles", ".insight-article h2", "Manrope, Arial, sans-serif", "500 Medium", "1.65rem (26.4px)", "1.65rem (26.4px)", "Section headings throughout article body"],
        ["Insight Articles", ".insight-article p", "DM Sans, Arial, sans-serif", "400 Regular", "1rem (16px)", "1rem (16px)", "Line-height 1.85 for extended reading comfort"],
        ["Insight Articles", ".insight-reference", "DM Sans, Arial, sans-serif", "400 Regular", "0.85rem (13.6px)", "0.85rem (13.6px)", "Source citation link (e.g. GST Portal FAQ)"],
        ["Thank You Page", ".page-intro h1", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "'Thank you for getting in touch.'"],
        ["Thank You Page", ".page-intro p", "DM Sans, Arial, sans-serif", "400 Regular", "1.08rem (17.3px)", "1.05rem (16.8px)", "Delivery acceptance confirmation text"],
        ["404 Not Found", ".page-intro h1", "Manrope, Arial, sans-serif", "500 Medium", "clamp(2.65rem, 4.05vw, 4rem)", "clamp(2.2rem, 9vw, 2.8rem)", "'Let's get you back on track.'"],
        ["Legacy Redirects", "h1: 'Industries have moved'", "Times New Roman, serif (browser default)", "700 Bold", "2em (32px default)", "2em (32px default)", "★ DEFECT: No CSS linked; renders in default Times New Roman"],
        ["Legacy Redirects", "a: 'Continue to section'", "Times New Roman, serif (browser default)", "400 Regular", "1em (16px default)", "1em (16px default)", "★ DEFECT: Default blue underlined browser hyperlink"]
    ]

    t_other = Table([[Paragraph(c, th_style) for c in other_headers]] + [[Paragraph(cell, td_warn if "★" in cell else td_style) for cell in row] for row in other_rows], colWidths=[65, 95, 95, 55, 65, 65, 84])
    t_other.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, PALE]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_other)
    story.append(Spacer(1, 14))

    # SECTION 9: SUMMARY OF FONT INCONSISTENCIES & RECOMMENDATIONS
    story.append(Paragraph("9. Key Typography Inconsistencies &amp; Technical Recommendations", h1_style))
    story.append(Spacer(1, 4))

    findings_data = [
        [
            Paragraph("<b>1. Hero Headline Font Type Asymmetry (Homepage vs. Inner Pages):</b><br/>"
                      "• <b>Homepage</b>: Uses a hybrid heading combining <i>Manrope</i> with <i>Georgia Serif Italic</i> ('Your business. Our expertise. <i>A clearer future.</i>').<br/>"
                      "• <b>Inner Pages</b>: All 20+ inner page headlines (About, Services, Partners, Careers, Contact, etc.) use 100% <i>Manrope</i> without any italic serif accent.<br/>"
                      "• <i>Recommendation</i>: Either adopt the editorial serif accent across key inner page titles (e.g., <i>'Focused on understanding.'</i> or <i>'Personally involved.'</i>) or standardize all H1 headlines to pure Manrope for uniformity.<br/><br/>"
                      "<b>2. Briefing Feed Headlines Font Override:</b><br/>"
                      "• Everywhere else on the site, <code>&lt;h3&gt;</code> elements use <i>Manrope</i>. In the Briefing feed, <code>.news-item h3</code> explicitly switches to <i>DM Sans</i>.<br/>"
                      "• <i>Recommendation</i>: This is functional for density, but should be documented as an intentional text-hierarchy exception.<br/><br/>"
                      "<b>3. Unstyled Legacy Redirect Stubs (/industries/ and /resources/):</b><br/>"
                      "• The HTML generated in <code>build.mjs</code> (lines 101–105) does not link any CSS stylesheet. Visitors or bots landing on these routes see raw browser-default <i>Times New Roman</i> text.<br/>"
                      "• <i>Recommendation</i>: Inject the compiled site stylesheet into the redirect templates so fallback renders conform to the brand aesthetic.<br/><br/>"
                      "<b>4. Font Preloading Optimization:</b><br/>"
                      "• <code>scripts/optimize-assets.mjs</code> preloads <code>dm-sans-latin.woff2</code> and <code>manrope-latin.woff2</code>, but omits <code>libre-baskerville-latin.woff2</code>.<br/>"
                      "• <i>Recommendation</i>: Add a preload tag for Libre Baskerville to eliminate any Flash of Unstyled Text (FOUT) on the header brand logo.", callout_style)
        ]
    ]
    t_findings = Table(findings_data, colWidths=[A4[0] - 72])
    t_findings.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), WARN_BG),
        ('BOX', (0, 0), (-1, -1), 1, WARN_BORDER),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_findings)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {filename}")

if __name__ == '__main__':
    build_pdf()
