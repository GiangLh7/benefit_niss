# Benefit Management System - Module Diagram

## System Overview

The Benefit Management System allows administrators to manage the entire benefit process for citizens, including:
- **Search citizen information** by NISS number or name
- **View contribution history** by company and by year
- **Manage list of current beneficiaries** (contributory and non-contributory)
- **Create new benefit requests** for citizens
- **Approve or reject** benefit requests through a 3-level approval process

---

## 1. Main Business Process Flow

```mermaid
flowchart TD
    Start([System Login]) --> Home[Benefit Home Screen]
    
    Home --> |Function 1| Search[Search Citizen]
    Home --> |Function 2| ContribHistory[View Contribution History]
    Home --> |Function 3| Beneficiaries[View Current Beneficiaries]
    Home --> |Function 4| NewRequest[Create New Benefit Request]
    Home --> |Function 5| PendingRequests[Manage Pending Requests]
    
    Search --> |Enter NISS/Name| SearchProcess[Perform Search]
    SearchProcess --> |Found| CitizenInfo[Citizen Information Screen]
    SearchProcess --> |Not Found| Error[Display Error Message]
    
    CitizenInfo --> Tab1[Tab 1: Personal Data]
    CitizenInfo --> Tab2[Tab 2: Contributory Career]
    CitizenInfo --> Tab3[Tab 3: Contributory Situation]
    
    Tab1 --> Info1[Name, DOB, Address<br/>NISS, Marital Status, Dependents]
    Tab2 --> Info2[Career History by Company<br/>Career History by Year<br/>Total Months, Total Contributions]
    Tab3 --> Info3[Total Contribution Years<br/>Total Contribution Amount<br/>Current Status, Eligibility]
    
    ContribHistory --> View1[View Social History]
    ContribHistory --> View2[View Monthly Breakdown]
    View1 --> Filter1[Filter by Company]
    View1 --> Filter2[Filter by Year]
    View1 --> Filter3[Filter by Period]
    
    Beneficiaries --> Type1[Contributory Beneficiaries List]
    Beneficiaries --> Type2[Non-Contributory Beneficiaries List]
    Type1 --> List1[NISS, Name, Benefit Type<br/>Amount, Bank Info, Status]
    Type2 --> List2[NISS, Name, Benefit Type<br/>Amount, Bank Info, Phase]
    
    NewRequest --> RequestType{Select Request Type}
    RequestType --> |Contributory| ContribForm[Contributory Request Form]
    RequestType --> |Non-Contributory| NonContribForm[Non-Contributory Request Form]
    
    ContribForm --> Step1[Step 1: Enter NISS]
    Step1 --> Step2[Step 2: Validate Eligibility]
    Step2 --> |Eligible| Step3[Step 3: Select Benefit Type]
    Step2 --> |Not Eligible| RejectMsg[Show Rejection Reason]
    Step3 --> Step4[Step 4: View Confirm Benefit Scheme]
    Step4 --> Step5[Step 5: Bank Account Info]
    Step5 --> Step6[Step 6: Review and Submit]
    Step6 --> Submit[Submit Request]
    
    NonContribForm --> NStep1[Step 1: Enter ID Number]
    NStep1 --> NStep2[Step 2: Select Benefit Type]
    NStep2 --> NStep3[Step 3: Validate Eligibility]
    NStep3 --> |Eligible| NStep4[Step 4: Fill Form and Submit]
    NStep3 --> |Not Eligible| RejectMsg
    
    Submit --> PendingRequests
    NStep4 --> PendingRequests
    
    PendingRequests --> FilterStatus[Filter by Status]
    FilterStatus --> Status1[Submitted]
    FilterStatus --> Status2[Pending Approval]
    FilterStatus --> Status3[Approved]
    FilterStatus --> Status4[Rejected]
    FilterStatus --> Status5[Expired]
    
    PendingRequests --> ViewDetails[View Request Details]
    ViewDetails --> Details1[Full Information]
    ViewDetails --> Details2[Uploaded Documents]
    ViewDetails --> Details3[Calculation Results]
    ViewDetails --> Details4[Bank Information]
    
    PendingRequests --> Approval{Approval Workflow}
    
    Approval --> |Submitted Requests| Level2[Level 2 Admin Actions]
    Approval --> |Pending Approval| Level3[Level 3 Admin Actions]
    
    Level2 --> Action1[Send for Approval]
    Level2 --> Action2[Reject Request]
    
    Level3 --> Action3[Approve Request]
    Level3 --> Action4[Reject Request]
    
    Action1 --> Change1[Status Submitted to Pending Approval]
    Action2 --> Change2[Status Submitted to Rejected]
    Action3 --> Change3[Status Pending Approval to Approved]
    Action4 --> Change4[Status Pending Approval to Rejected]
    
    Change3 --> AddToList[Add to Current Beneficiaries List]
    Change1 --> PendingRequests
    Change2 --> PendingRequests
    Change4 --> PendingRequests
    
    AddToList --> Beneficiaries
    
    style Start fill:#e1f5ff
    style Home fill:#fff4e6
    style CitizenInfo fill:#e8f5e9
    style PendingRequests fill:#fce4ec
    style Approval fill:#f3e5f5
    style Beneficiaries fill:#e0f2f1
    style AddToList fill:#c8e6c9
```

---

## 2. Approval Workflow Diagram

```mermaid
flowchart TD
    Start([Start]) --> Submitted[Submitted<br/>Request Submitted]
    
    Submitted --> |Level 2 Admin: Send for Approval| PendingApproval[Pending Approval<br/>Waiting for Level 3]
    Submitted --> |Level 2 Admin: Reject| Rejected[Rejected<br/>Request Closed]
    Submitted --> |Level 2 Admin: Review| Submitted
    
    PendingApproval --> |Level 3 Admin: Approve| Approved[Approved<br/>Added to List]
    PendingApproval --> |Level 3 Admin: Reject| Rejected
    PendingApproval --> |Level 3 Admin: Review| PendingApproval
    
    Approved --> End1([End<br/>Citizen Receives Benefit])
    Rejected --> End2([End<br/>Request Closed])
    
    style Submitted fill:#fff4e6
    style PendingApproval fill:#e3f2fd
    style Approved fill:#c8e6c9
    style Rejected fill:#ffcdd2
    style Start fill:#e1f5ff
    style End1 fill:#c8e6c9
    style End2 fill:#ffcdd2
```

---

## 3. Search and View Citizen Information

```mermaid
flowchart LR
    A[Admin] --> B[Enter NISS or Name]
    B --> C{Search}
    C --> |Found| D[Display Citizen Info]
    C --> |Not Found| E[Show Error]
    
    D --> F[Personal Data Tab]
    D --> G[Contributory Career Tab]
    D --> H[Contributory Situation Tab]
    
    F --> F1[Name, DOB, Address]
    F --> F2[NISS, Marital Status]
    F --> F3[Dependents Info]
    
    G --> G1[Career by Company]
    G --> G2[Career by Year]
    G --> G3[Total Months/Years]
    G --> G4[Contribution Amounts]
    
    H --> H1[Total Contribution Years]
    H --> H2[Total Amount Contributed]
    H --> H3[Current Status]
    H --> H4[Eligibility Status]
    
    style D fill:#c8e6c9
    style E fill:#ffcdd2
```

---

## 4. View Contribution History

```mermaid
flowchart TD
    A[Contribution History Screen] --> B{Select View}
    
    B --> C[Social History Tab]
    B --> D[Monthly Breakdown Tab]
    
    C --> E[Filter Options]
    E --> F[Filter by Company]
    E --> G[Filter by Year]
    E --> H[Filter by Period]
    
    F --> I[Display: Company Name, Period, Amount]
    G --> J[Display: Year, Total Months, Total Amount]
    H --> K[Display: Period Range, Summary]
    
    D --> L[Monthly Details]
    L --> M[Month, Year, Employer, Amount, Status]
    
    style A fill:#e1f5ff
    style C fill:#e8f5e9
    style D fill:#fff9c4
```

---

## 5. Current Beneficiaries List

```mermaid
flowchart TD
    A[Current Beneficiaries Screen] --> B{Select Type}
    
    B --> C[Contributory Beneficiaries]
    B --> D[Non-Contributory Beneficiaries]
    
    C --> C1[Display Table]
    C1 --> C2[Columns: Position, Type, NISS, Name]
    C1 --> C3[Columns: Municipality, DOB, Age, Sex]
    C1 --> C4[Columns: Bank Name, Account, IBAN]
    C1 --> C5[Columns: Amount, Status]
    
    D --> D1[Display Table]
    D1 --> D2[Columns: Position, Type, NISS, Name]
    D1 --> D3[Columns: Municipality, DOB, Age, Sex]
    D1 --> D4[Columns: Bank Name, Account, IBAN]
    D1 --> D5[Columns: Amount, Phase]
    
    C1 --> E[Actions]
    D1 --> E
    E --> F[Export to Excel]
    E --> G[Generate Payment List]
    E --> H[View Details]
    
    style A fill:#e1f5ff
    style C fill:#c8e6c9
    style D fill:#fff9c4
```

---

## 6. Create New Benefit Request Flow

```mermaid
flowchart TD
    A[New Benefit Request Screen] --> B{Select Request Type}
    
    B --> |Contributory| C[Contributory Request]
    B --> |Non-Contributory| D[Non-Contributory Request]
    
    C --> C1[Step 1: Enter NISS]
    C1 --> C2[Step 2: Validate Eligibility]
    C2 --> C2A{Check Age<br/>and Contribution Period}
    C2A --> |Eligible| C3[Step 3: Select Benefit Type]
    C2A --> |Not Eligible| C2B[Show Rejection Reason]
    
    C3 --> C4{Benefit Type?}
    C4 --> |Old Age Pension| C5A[Old Age Pension Form]
    C4 --> |Disability Pension| C5B[Disability Pension Form]
    C4 --> |Survivor Pension| C5C[Survivor Pension Form]
    C4 --> |Parental Benefit| C5D[Parental Benefit Form]
    C4 --> |Death Benefit| C5E[Death Benefit Form]
    
    C5A --> C6[Step 4: View Confirm Benefit Scheme]
    C5B --> C6
    C5C --> C6
    C5D --> C6
    C5E --> C6
    
    C6 --> C7[Step 5: Bank Account Info]
    C7 --> C8[Step 6: Review & Submit]
    C8 --> C9[Submit Request]
    
    D --> D1[Step 1: Enter ID Number]
    D1 --> D2[Step 2: Select Benefit Type]
    D2 --> D3[Old Age Social Pension]
    D2 --> D4[Disability Social Pension]
    D2 --> D5[Other Non-Contributory]
    
    D3 --> D6[Step 3: Validate Eligibility]
    D4 --> D6
    D5 --> D6
    
    D6 --> D7{Check Age<br/>and Conditions}
    D7 --> |Eligible| D8[Step 4: Fill Form & Submit]
    D7 --> |Not Eligible| D9[Show Rejection Reason]
    
    C9 --> E[Pending Requests Queue]
    D8 --> E
    
    style A fill:#e1f5ff
    style C fill:#c8e6c9
    style D fill:#fff9c4
    style E fill:#fce4ec
    style C2A fill:#fff4e6
    style D7 fill:#fff4e6
    style C2B fill:#ffcdd2
    style D9 fill:#ffcdd2
```

---

## Detailed Function Descriptions

### 1. Search Citizen
**Purpose**: Search for citizen information in the system to view history and create benefit requests

**Process**:
- Admin enters NISS number or citizen name in search field
- System searches in database
- If found: Display citizen information with 3 tabs
- If not found: Display error message

**Information Displayed**:
- **Tab 1 - Personal Data**: Name, date of birth, address, NISS, marital status, dependents
- **Tab 2 - Contributory Career**: Career history by company, by year, total months/years of contributions, total contribution amount
- **Tab 3 - Contributory Situation**: Total contribution years, total contribution amount, current status, eligibility status

### 2. View Contribution History
**Purpose**: View detailed contribution history of citizens to assess eligibility for benefits

**Views**:
- **Social History Tab**: Overview of contribution periods
  - Can filter by company
  - Can filter by year
  - Can filter by time period
- **Monthly Breakdown Tab**: View monthly contribution details
  - Month, year
  - Company/employer name
  - Contribution amount
  - Status (paid, unpaid, missing)

**Application**: Used to check if citizen meets eligibility requirements for benefits

### 3. Current Beneficiaries List
**Purpose**: Manage list of all current benefit recipients in the system

**Two Types of Lists**:
- **Contributory Beneficiaries**: People who have contributed and are receiving benefits
  - Information: Position, benefit type, NISS, name, municipality, date of birth, age, sex
  - Bank information: Bank name, account number, IBAN
  - Amount received, status (active, suspended, stopped)
  
- **Non-Contributory Beneficiaries**: People receiving social benefits (no contribution required)
  - Similar information as above
  - Phase (Phase I, II, III) instead of status

**Actions Available**:
- Export list to Excel file
- Generate payment list for bank
- View details of each beneficiary

### 4. Create New Benefit Request
**Purpose**: Create request to add citizen to benefit recipient list

**Two Types of Requests**:

**A. Contributory Request** (6 steps):
1. **Step 1**: Enter NISS number
2. **Step 2**: System validates eligibility (age and contribution period)
   - If eligible: Continue
   - If not eligible: Show rejection reason and stop
3. **Step 3**: Select benefit type (Old Age Pension, Disability Pension, Survivor Pension, Parental Benefit, Death Benefit)
4. **Step 4**: View/Confirm Benefit Scheme (includes: personal data, professional situation, contributory career, contributory situation, calculation & documents)
5. **Step 5**: Enter bank account information for benefit payment
6. **Step 6**: Review all information and submit request

**B. Non-Contributory Request** (simpler):
- Step 1: Enter ID number
- Step 2: Select social benefit type (Old Age Social Pension, Disability Social Pension, etc.)
- Step 3: System validates eligibility (age and conditions)
- Step 4: Fill form and submit request

### 5. Approve/Reject Requests
**Purpose**: Review and decide on submitted benefit requests

**3-Level Approval Process**:

**Level 1**: No approval rights (view only)

**Level 2 - Level 2 Admin**:
- Handles requests with "Submitted" status
- Can:
  - **Send for Approval**: Forward request to Level 3 Admin
  - **Reject**: Reject request if not eligible
  - **View Details**: View full information, documents, calculations

**Level 3 - Level 3 Admin**:
- Handles requests with "Pending Approval" status
- Can:
  - **Approve**: Approve request (final decision) → Citizen added to beneficiary list
  - **Reject**: Reject request
  - **View Details**: View full information

**Request Statuses**:
- **Submitted**: New request submitted, waiting for Level 2 Admin review
- **Pending Approval**: Forwarded by Level 2 Admin, waiting for Level 3 Admin approval
- **Approved**: Approved, citizen added to beneficiary list
- **Rejected**: Rejected, request closed
- **Expired**: Request expired after 30 days without processing

**Features**:
- View request details (citizen information, documents, calculation results, bank information)
- Approve/reject individual requests or multiple requests at once
- Add comments/notes when approving or rejecting

---

## Benefit Types

### Contributory Benefits
Benefits for people who have contributed to social security:

1. **Old Age Pension (PV - Pensão de Velhice)**
   - For people who have reached retirement age and contributed sufficient years

2. **Disability Pension (PI - Pensão de Invalidez)**
   - For people with disabilities, loss of work capacity
   - Can receive one-time or monthly

3. **Survivor Pension**
   - For relatives of deceased (spouse, children, parents)
   - Distributed by percentage

4. **Parental Benefit**
   - For people who give birth or adopt children
   - Multiple types: maternity, paternity, clinical risk, etc.

5. **Death Benefit**
   - One-time benefit for family when contributor dies
   - Includes funeral allowance

### Non-Contributory Benefits
Social benefits for people without means to contribute:

1. **Old Age Social Pension (PSV - Pensão Social de Velhice)**
   - For elderly people without income or low income

2. **Disability Social Pension**
   - For disabled people without work capacity and no income

3. **Other Non-Contributory Benefits**
   - Other social benefits as per regulations

---

## Calculation Formulas

The system automatically calculates benefit amounts based on the following formulas:

### 1. Old Age Pension
**Formula**: `P = (R / N) × Total Contribution Months`

**Explanation**:
- **R (Reference Remuneration)**: Reference salary = Average of best 120 months in last 10 years
- **N**: 360 months (equivalent to 30 years - standard contributory career period)
- **Total Contribution Months**: Total months citizen has contributed

**Example**: If R = $500, contributed 308 months → P = (500/360) × 308 = $427.78/month

### 2. Survivor Pension
**Formula**: 
- Monthly pension: `P = (R / N) × Total Contribution Months`
- Funeral allowance: `Funeral Allowance = 3 × R`

**Explanation**: Similar to old age pension, but distributed among multiple relatives by percentage

### 3. Disability Pension
**Two Types**:
- **Monthly pension**: `P = (R / N) × Total Contribution Months` (similar to old age pension)
- **One-time payment**: `One-Time Amount = 24 × Monthly Amount`

### 4. Parental Benefit
**Formula**: 
- Daily benefit: `Daily Benefit = R / 180`
- Total amount: `Total = Daily Benefit × Duration Days`

**Duration varies by type**:
- Maternity: 90 days
- Paternity: 7 days
- Clinical risk: 60 days
- Adoption: 90 days

### 5. Death Benefit
**Formula**: `Amount = 3 × R`

**Explanation**: According to Article 18, DL 19/2017, death benefit equals 3 times reference remuneration (R)

---

## System Summary

The Benefit Management System (Benefit Module) is a comprehensive solution to manage the entire benefit process for citizens, from searching information, viewing contribution history, to creating new benefit requests and approving requests.

### System Strengths:

✅ **Fast Search**: Search citizens by NISS or name in seconds

✅ **Complete Information**: Display full personal information, career history, and contribution status

✅ **Detailed History**: View contribution history by company, by year, or by month

✅ **Centralized Management**: Centralized management of all benefit recipients (contributory and non-contributory)

✅ **Automation**: System automatically checks eligibility and calculates benefit amounts

✅ **Clear Process**: 3-level approval process ensures transparency and control

✅ **Diverse Support**: Supports both contributory and non-contributory benefits with various benefit types

### Benefits:

- **Time Saving**: Automates checking and calculation steps
- **Error Reduction**: System automatically calculates, minimizing human errors
- **Transparency**: Clear approval process, traceable
- **Efficiency**: Centralized management, easy to search and report
