** HERE IS THE STEP BY STEP PROCESS TO EXTRACT DATA **

FOR EXAMPLE WE HAVE TAKEN JANUARY 2025 PDF 

we split pdf in 3 categories
   1. HML Category 
             a) Sector wise 
             b) Major Ongoing peoject
    
    2. Completed Project in that month
    3. All Ongoing project 


we will get 4 csv file from 1 pdf 


**1. FROM HML CATEGORY** 
        a) sector wise 
        b) Major Ongoing peoject

        for this the prompt u can use 
                You are an expert data extraction assistant. I am giving you raw OCR text from a scanned Indian government "Flash Report" (PAIMANA) on infrastructure projects.
                Your task is to extract every completed project row into a standardized, strict RFC 4180-compliant CSV with the following 14 columns in EXACT order:
                **BEFORE YOU START PARSING:**
                ASK THE USER: "What is the month and year of this Flash Report? (e.g., JAN26, DEC25, JAN2026)"
                Save their answer as `[MONTH_YEAR]` (e.g., "JAN26").

                ---

                **YOUR TASK:**

                ### 1. EXTRACT SECTOR-WISE OVERVIEW TABLE
                - Find tables with columns: S.No, Sector Name, Project Count, Original Cost, Revised Cost, Expenditure.
                - Extract all sectors.
                - Output as **CSV #1** with these exact columns:
                `S.No, Sector Name, Project Count, Original Cost (Rs. Crore), Revised Cost (Rs. Crore), Expenditure (Rs. Crore)`

                ---

                ### 2. EXTRACT MAJOR ON-GOING PROJECTS TABLE
                - Find tables with columns: S.No, Project ID, Project Name, Original Cost, Revised Cost, Expenditure, Physical Progress (%).
                - The OCR is messy and often merges numbers (e.g., `24545847297` instead of `24,545 8,472 97`).

                **CRITICAL RULE TO SPLIT MERGED NUMBERS:**
                - Physical Progress is ALWAYS a number between **0 and 100**.
                - Original Cost, Revised Cost, and Expenditure are ALWAYS **greater than 100**.
                - Use regex to find all numbers (e.g., `r'[\d,]+'`).
                - Separate numbers <= 100 (these are Physical Progress) from numbers > 100 (these are Costs).
                - Assign the last 3 numbers > 100 as Original, Revised, and Expenditure.
                - Assign the last number <= 100 as Physical Progress.

                **Example:**
                - Input: `...PROJECT 709857 24,5458,47297...`
                - Output: Orig=24545, Rev=8472, Exp=0 (missing), Prog=97.

                Extract all major projects.

                ---

                ### 3. RENAME THE PROGRESS COLUMN
                - Take the `[MONTH_YEAR]` the user provided (e.g., "JAN26").
                - In the Major Projects CSV, rename the `Physical Progress (%)` column to exactly `[MONTH_YEAR]` (e.g., `JAN26`).

                ---

                ### OUTPUT FORMAT:
                Provide two separate CSV block:

                **CSV #1: Sector Overview**

**2. Completed Project in that month**

                You are a data extraction assistant. I will provide text/pages/images from the MoSPI / PAIMANA infrastructure report for "Completed Project During Month".

                Your task is to extract every completed project row into a standardized, strict RFC 4180-compliant CSV with the following 14 columns in EXACT order:

                Sl.No,Project Code,Project Name,Agency,State,Date of Approval (MM/YYYY),Start Date (MM/YYYY),Actual Date of Completion (MM/YYYY),Original DoC (MM/YYYY),Revised DoC (MM/YYYY),Original Cost (Rs. Crore),Revised Cost (Rs. Crore),Cumulative Expenditure (Rs. Crore),Sector

                ### Column & Field Extraction Rules:
                1. **Project Name, Agency & Project Code**:
                - `Project Name` = Title and description of the project.
                - `Agency` = The implementing entity written in brackets/parentheses (e.g., `Bharat Petroleum Corporation Limited [BPCL]`, `RVNL - II`, `POWERGRID`).
                - `Project Code` = The numeric identifier (e.g., `400235`, `611657`).
                2. **Approval & Start Dates**:
                - Top date = `Date of Approval (MM/YYYY)`.
                - Date in parentheses below = `Start Date (MM/YYYY)` (use `-` if missing).
                3. **Completion & Commissioning Dates (3 Dates in Column)**:
                - Top date = `Actual Date of Completion (MM/YYYY)`.
                - First parentheses below = `Original DoC (MM/YYYY)`.
                - Second parentheses below = `Revised DoC (MM/YYYY)` (use `-` if missing or marked `(-)`).
                4. **Costs**:
                - Top figure = `Original Cost (Rs. Crore)`.
                - Figure in parentheses below = `Revised Cost (Rs. Crore)` (use original cost or `-` if blank/marked `(-)`).
                5. **Cumulative Expenditure**:
                - The numeric value in `Cumulative Expenditure in Rs. Crore`.
                6. **Sector**:
                - The sub-header classification above the project (e.g., `Energy Storage`, `Transmission & Distribution`, `Railways`).

                ### Strict RFC 4180 CSV Compliance Rules (To Prevent pandas ParserError):
                - **Mandatory Quoting**: Any field containing commas (`,`)—including multi-state values like `"Multi-States (Bihar, Jharkhand)"` or project names with commas—MUST be wrapped in double quotes (`"..."`).
                - **Exact Field Count**: Every row must strictly contain exactly 14 comma-separated values matching the header.
                - **Output Format**: Output ONLY the raw CSV text inside a single ```csv code block without conversational filler or markdown tables.

                --



**3. All Ongoing project**

        we are using this format to extract all onging projects


        Sl.No

        Project Code

        Project Name

        Agency

        State

        Date of Approval (MM/YYYY)

        Start Date (MM/YYYY)

        Original DoC (MM/YYYY)

        Revised DoC (MM/YYYY)

        Original Cost (Rs. Crore)

        Revised Cost (Rs. Crore)

        Cumulative Expenditure (Rs. Crore)

        JAN26 Progress 

        Sector


        **PROMPT YOU CAN USEE**



        You are a data extraction assistant. I will provide text/pages from the MoSPI PAIMANA report ("Table 6: All Ongoing Projects"). 

        Your task is to extract every project row from the provided text into a standardized, RFC 4180-compliant CSV format with the following 14 columns in EXACT order:

        Sl.No,Project Code,Project Name,Agency,State,Date of Approval (MM/YYYY),Start Date (MM/YYYY),Original DoC (MM/YYYY),Revised DoC (MM/YYYY),Original Cost (Rs. Crore),Revised Cost (Rs. Crore),Cumulative Expenditure (Rs. Crore),Physical Progress (%),Sector

        You are a data extraction assistant. I will provide text/pages from an Indian MoSPI / PAIMANA infrastructure monitoring PDF ("Table 6: All Ongoing Projects").

        You are a data extraction assistant for Indian infrastructure monitoring reports (MoSPI / PAIMANA "Table 6: All Ongoing Projects").

        ### Step 1: Confirm Month and Year
        1. Check if the user has specified the report's month and year (e.g., "December 2025", "Jan 2026").
        2. **If NOT provided**: Ask the user: 
        *"Please specify the month and year of this report (e.g., December 2025) so I can label the progress column as `<MONYY> progress (%)`."*
        3. Convert the month and year into a 5-character tag: `<3-Letter Month Uppercase><2-Digit Year>`.
        - Examples:
            - `December 2025` -> `DEC25` -> `DEC25 progress (%)`
            - `January 2026` -> `JAN26` -> `JAN26 progress (%)`
            - `November 2025` -> `NOV25` -> `NOV25 progress (%)`

        ---

        ### Step 2: Generate RFC 4180-Compliant CSV
        Extract every project row into a CSV format with these 14 columns in EXACT order:

        Sl.No,Project Code,Project Name,Agency,State,Date of Approval (MM/YYYY),Start Date (MM/YYYY),Original DoC (MM/YYYY),Revised DoC (MM/YYYY),Original Cost (Rs. Crore),Revised Cost (Rs. Crore),Cumulative Expenditure (Rs. Crore),<TAG> progress (%),Sector

        ### Parsing Rules:
        1. **Project Name, Agency & Code**: 
        - `Project Name` = Title and technical description.
        - `Agency` = Entity in brackets/parentheses (e.g., `[AAI]`, `[SECL]`, `[NHAI]`).
        - `Project Code` = The numeric ID (e.g., `612786`).
        2. **Approval & Start Dates**: 
        - Top date = `Date of Approval (MM/YYYY)`.
        - Date in parentheses below = `Start Date (MM/YYYY)` (use `-` if missing).
        3. **Commissioning Dates (DoC)**: 
        - Top date = `Original DoC (MM/YYYY)`.
        - Date in parentheses below = `Revised DoC (MM/YYYY)` (use `-` if missing/empty).
        4. **Costs**: 
        - Top figure = `Original Cost (Rs. Crore)`.
        - Figure in parentheses below = `Revised Cost (Rs. Crore)` (use original cost or `-` if blank/unchanged).
        5. **Expenditure & Progress**: 
        - Cumulative expenditure as a numeric value.
        - Physical progress percentage under the dynamically tagged `<TAG> progress (%)` column.
        6. **Sector**: The category section header (e.g., `Aviation & Aviation Infrastructure`, `Coal`, `Railways`, `Roads & Highways`, etc.).

        ### Critical RFC 4180 Quoting Rules (To Prevent pandas ParserError):
        - **Double Quoting**: Any field that contains a comma (`,`)—such as multi-state lists like `"Multi-States (Karnataka, Maharashtra, Telangana, Uttar Pradesh)"` or project names with commas—MUST be enclosed in double quotation marks (`"..."`).
        - **Exact Column Count**: Every row must strictly contain exactly 14 comma-separated fields matching the header.
        - **Output Format**: Output ONLY the raw CSV text inside a single ```csv code block.



