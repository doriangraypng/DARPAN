import pdfplumber
import csv
import re

PDF_PATH = "FRApril2025.pdf"
MONTH_TAG = "APR25"

def clean_str(val):
    if val is None:
        return ""
    val = str(val).replace('\n', ' ').strip()
    return re.sub(r'\s+', ' ', val)

def detect_section_pages(pdf):
    """Detect pages for each table section in old OCMS format."""
    sections = {
        'table1_pages': [],   # Sector-wise overview
        'table3_pages': [],   # Completed during month
        'table7_pages': [],   # All ongoing projects
    }
    for i, page in enumerate(pdf.pages):
        text = page.extract_text() or ''
        if 'Table:-1' in text:
            sections['table1_pages'].append(i)
        if 'Table:-3' in text:
            sections['table3_pages'].append(i)
        if 'Table:-7' in text:
            sections['table7_pages'].append(i)
    return sections

def parse_name_agency_code_state(name_col):
    """Parse the combined Project Name/(Agency)/(Code)/(State) cell."""
    lines = [l.strip() for l in name_col.split('\n') if l.strip()]
    if not lines:
        return "", "", "", ""
    
    state = ""
    proj_code = ""
    agency = ""
    
    # Work backwards: last line is state, second-to-last is code, third-to-last is agency
    remaining = list(lines)
    
    # State: last line in parentheses
    if remaining and remaining[-1].startswith("(") and remaining[-1].endswith(")"):
        state = remaining[-1][1:-1].strip()
        remaining = remaining[:-1]
    
    # Code: next-to-last in parentheses
    if remaining and remaining[-1].startswith("(") and remaining[-1].endswith(")"):
        proj_code = remaining[-1][1:-1].strip()
        remaining = remaining[:-1]
    
    # Agency: next in parentheses
    if remaining and remaining[-1].startswith("(") and remaining[-1].endswith(")"):
        agency = remaining[-1][1:-1].strip()
        remaining = remaining[:-1]
    
    proj_name = " ".join(remaining).strip()
    return proj_name, agency, proj_code, state

def parse_cost_field(cost_raw):
    """Parse Original/(Revised)/{Anticipated} cost field."""
    lines = [l.strip() for l in (cost_raw or "").split('\n') if l.strip()]
    orig = lines[0] if len(lines) > 0 else "-"
    revised = "-"
    anticipated = "-"
    for l in lines[1:]:
        if l.startswith("(") and l.endswith(")"):
            revised = l[1:-1].strip()
        elif l.startswith("{") and l.endswith("}"):
            anticipated = l[1:-1].strip()
    if revised == "N.A.":
        revised = "-"
    if anticipated == "N.A.":
        anticipated = "-"
    return orig, revised, anticipated

def parse_doc_field(doc_raw):
    """Parse Original/(Revised)/{Anticipated} date of commissioning field."""
    lines = [l.strip() for l in (doc_raw or "").split('\n') if l.strip()]
    orig = lines[0] if len(lines) > 0 else "-"
    revised = "-"
    anticipated = "-"
    for l in lines[1:]:
        if l.startswith("(") and l.endswith(")"):
            revised = l[1:-1].strip()
        elif l.startswith("{") and l.endswith("}"):
            anticipated = l[1:-1].strip()
    if revised == "N.A.":
        revised = "-"
    if anticipated == "N.A.":
        anticipated = "-"
    return orig, revised, anticipated

# ==================== CSV #1: Sector Overview ====================
def parse_sector_overview(pdf, table1_pages):
    print("Extracting CSV #1: Sector Overview...")
    sectors = []
    for p_num in table1_pages:
        page = pdf.pages[p_num]
        tables = page.extract_tables()
        for t in tables:
            if not t or len(t) < 2:
                continue
            header_str = ' '.join([str(c) for c in t[0] if c])
            if 'Sector' not in header_str or 'Sl' not in header_str:
                continue
            for row in t[1:]:
                if not row or len(row) < 5:
                    continue
                sl = (row[0] or "").strip()
                if not sl or not sl.isdigit():
                    if sl == "Total":
                        continue
                    continue
                sector = clean_str(row[1])
                proj_count = clean_str(row[2])
                cost_raw = row[3] or ""
                exp = clean_str(row[4])
                
                # Parse cost field: Original/(Revised)/{Anticipated}
                orig_cost, rev_cost, ant_cost = parse_cost_field(cost_raw)
                
                sectors.append({
                    "S.No": sl,
                    "Sector Name": sector,
                    "Project Count": proj_count,
                    "Original Cost (Rs. Crore)": orig_cost,
                    "Revised Cost (Rs. Crore)": rev_cost,
                    "Expenditure (Rs. Crore)": exp
                })
    return sectors

# ==================== CSV #2: Completed Projects ====================
def parse_completed_projects(pdf, table3_pages):
    print("Extracting CSV #3: Completed Projects...")
    projects = []
    current_sector = ""
    
    for p_num in table3_pages:
        page = pdf.pages[p_num]
        tables = page.extract_tables()
        for t in tables:
            if not t or len(t) < 2:
                continue
            header_str = ' '.join([str(c) for c in t[0] if c])
            if 'Sl' not in header_str:
                continue
            for row in t[1:]:
                if not row or len(row) < 6:
                    continue
                sector_col = (row[0] or "").strip()
                sl = (row[1] or "").strip()
                
                # Sector tracking
                if sector_col and not sl:
                    current_sector = sector_col
                    continue
                if sector_col and not sector_col.isdigit():
                    current_sector = sector_col
                    
                if not sl or not sl.isdigit():
                    continue
                
                name_col = row[2] or ""
                orig_cost = clean_str(row[3])
                doc_orig = clean_str(row[4])
                exp = clean_str(row[5])
                
                proj_name, agency, proj_code, state = parse_name_agency_code_state(name_col)
                
                projects.append({
                    "Sl.No": sl,
                    "Project Code": proj_code,
                    "Project Name": proj_name,
                    "Agency": agency,
                    "State": state,
                    "Original DoC (MM/YYYY)": doc_orig,
                    "Original Cost (Rs. Crore)": orig_cost,
                    "Cumulative Expenditure (Rs. Crore)": exp,
                    "Sector": current_sector
                })
    return projects

# ==================== CSV #3: All Ongoing Projects ====================
def parse_all_ongoing(pdf, table7_pages):
    print("Extracting CSV #4: All Ongoing Projects...")
    projects = []
    current_sector = ""
    current_state = ""
    
    for p_num in table7_pages:
        page = pdf.pages[p_num]
        tables = page.extract_tables()
        for t in tables:
            if not t or len(t) < 2:
                continue
            header_str = ' '.join([str(c) for c in t[0] if c])
            if 'Project Name' not in header_str and 'Sl' not in header_str:
                continue
            for row in t[1:]:
                if not row or len(row) < 9:
                    continue
                
                state_col = (row[0] or "").strip()
                sector_col = (row[1] or "").strip()
                sl = (row[2] or "").strip() if row[2] else ""
                
                # Track state and sector
                if state_col:
                    current_state = state_col
                if sector_col:
                    current_sector = sector_col
                
                if not sl or not sl.isdigit():
                    continue
                
                name_col = row[3] or ""
                date_approval = clean_str(row[4])
                doc_raw = row[5] or ""
                cost_raw = row[6] or ""
                exp = clean_str(row[7])
                prog = clean_str(row[8])
                
                # Parse name/agency/code (no state in this column for Table 7)
                lines = [l.strip() for l in name_col.split('\n') if l.strip()]
                proj_code = ""
                agency = ""
                remaining = list(lines)
                
                if remaining and remaining[-1].startswith("(") and remaining[-1].endswith(")"):
                    proj_code = remaining[-1][1:-1].strip()
                    remaining = remaining[:-1]
                if remaining and remaining[-1].startswith("(") and remaining[-1].endswith(")"):
                    agency = remaining[-1][1:-1].strip()
                    remaining = remaining[:-1]
                proj_name = " ".join(remaining).strip()
                
                # Parse DoC: Original/(Revised)/{Anticipated}
                orig_doc, rev_doc, ant_doc = parse_doc_field(doc_raw)
                
                # Parse Cost: Original/(Revised)/{Anticipated}
                orig_cost, rev_cost, ant_cost = parse_cost_field(cost_raw)
                
                projects.append({
                    "Sl.No": sl,
                    "Project Code": proj_code,
                    "Project Name": proj_name,
                    "Agency": agency,
                    "State": current_state,
                    "Date of Approval (MM/YYYY)": date_approval,
                    "Original DoC (MM/YYYY)": orig_doc,
                    "Revised DoC (MM/YYYY)": rev_doc,
                    "Original Cost (Rs. Crore)": orig_cost,
                    "Revised Cost (Rs. Crore)": rev_cost,
                    "Cumulative Expenditure (Rs. Crore)": exp,
                    f"{MONTH_TAG} progress (%)": prog,
                    "Sector": current_sector
                })
    return projects

def write_csv(filepath, fieldnames, data):
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(data)
    print(f"Successfully written {len(data)} rows to {filepath}")

def main():
    print(f"Opening {PDF_PATH}...")
    with pdfplumber.open(PDF_PATH) as pdf:
        sections = detect_section_pages(pdf)
        print("Detected section pages:", {k: len(v) for k, v in sections.items()})
        
        # 1. Sector Overview (Table 1)
        sec_overview = parse_sector_overview(pdf, sections['table1_pages'])
        sec_fields = ["S.No", "Sector Name", "Project Count", "Original Cost (Rs. Crore)", "Revised Cost (Rs. Crore)", "Expenditure (Rs. Crore)"]
        write_csv("sector_overview.csv", sec_fields, sec_overview)
        
        # 2. Completed Projects (Table 3)
        completed = parse_completed_projects(pdf, sections['table3_pages'])
        comp_fields = ["Sl.No", "Project Code", "Project Name", "Agency", "State", "Original DoC (MM/YYYY)", "Original Cost (Rs. Crore)", "Cumulative Expenditure (Rs. Crore)", "Sector"]
        write_csv("completed_projects.csv", comp_fields, completed)
        
        # 3. All Ongoing Projects (Table 7)
        all_ongoing = parse_all_ongoing(pdf, sections['table7_pages'])
        ongoing_fields = ["Sl.No", "Project Code", "Project Name", "Agency", "State", "Date of Approval (MM/YYYY)", "Original DoC (MM/YYYY)", "Revised DoC (MM/YYYY)", "Original Cost (Rs. Crore)", "Revised Cost (Rs. Crore)", "Cumulative Expenditure (Rs. Crore)", f"{MONTH_TAG} progress (%)", "Sector"]
        write_csv("all_ongoing_projects.csv", ongoing_fields, all_ongoing)

if __name__ == "__main__":
    main()
