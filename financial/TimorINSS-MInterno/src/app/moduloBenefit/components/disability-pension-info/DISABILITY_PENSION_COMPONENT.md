# Disability Pension Info Component

## Overview

The `DisabilityPensionInfoComponent` is a reusable Angular component designed to handle Disability Pension assessment, eligibility validation, and pension calculation for the Timor-Leste Social Security system.

---

## Purpose

This component replaces the generic "Retirement Options" step for Disability Pension applicants, providing:
1. **Disability Level Input** - Allows entry of disability percentage (0-100%)
2. **Automatic Eligibility Validation** - Validates against minimum requirements
3. **Pension Calculation** - Calculates estimated monthly pension amount
4. **Type Classification** - Determines Relative vs Absolute disability
5. **Work Permission Display** - Shows whether the applicant can work while receiving pension
6. **Auto-Conversion Info** - Displays information about conversion to Old-Age Pension at age 60

---

## Component API

### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `contributionMonths` | `number` | Total contribution months (required for eligibility) |
| `currentAge` | `number` | Citizen's current age in years |
| `sector` | `'private' \| 'public'` | Employment sector (though not used for disability rules) |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `disabilityInfoChanged` | `EventEmitter<DisabilityInfo>` | Emits disability information when changed |

### DisabilityInfo Interface

```typescript
export interface DisabilityInfo {
  disabilityLevel: number;              // 0-100%
  disabilityType: 'relative' | 'absolute' | null;
  isEligible: boolean;                  // Overall eligibility
  estimatedPension: number;             // Monthly amount in USD
  referenceRemuneration: number;        // Base salary used for calculation
}
```

---

## Validation Rules

### 1. Minimum Disability Level
- **Requirement:** ≥ 66.67% (2/3 labor capacity reduction)
- **Rejection:** < 66.67%

### 2. Minimum Contribution
- **Requirement:** ≥ 60 months (for year 2025)
- **Rejection:** < 60 months

### 3. Disability Types

#### Relative Disability (66.67% - 99%)
- ✅ Can work with limited income
- Total income (pension + salary) ≤ 200% of reference remuneration
- Used for rehabilitation and reintegration

#### Absolute Disability (100%)
- ❌ Cannot work
- If works: Pension stops + must refund received amounts
- Expected to last until retirement age (60)

---

## Calculation Formula

```typescript
P = R × (N / 360)

Where:
- P: Monthly pension amount
- R: Reference remuneration (average of best 120 months)
- N: Total contribution months
- 360: Equivalent to 30 years full contribution
```

### Example Calculations

#### Case 1: 99 months contribution
```
R = $115 (mock value)
N = 99 months

P = $115 × (99 / 360)
P = $115 × 0.275
P = $31.63/month
```

#### Case 2: 264 months contribution (22 years)
```
R = $115
N = 264 months

P = $115 × (264 / 360)
P = $115 × 0.733
P = $84.30/month
```

---

## Usage Example

### In Parent Component Template

```html
<app-disability-pension-info
  [contributionMonths]="contributionMonths"
  [currentAge]="currentAge"
  [sector]="citizenInfo?.employmentSector || 'private'"
  (disabilityInfoChanged)="onDisabilityInfoChanged($event)">
</app-disability-pension-info>
```

### In Parent Component TypeScript

```typescript
export class ParentComponent {
  contributionMonths: number = 99;
  currentAge: number = 45;
  disabilityInfo: DisabilityInfo | null = null;

  onDisabilityInfoChanged(info: DisabilityInfo): void {
    this.disabilityInfo = info;
    
    if (info.isEligible) {
      console.log(`Eligible! Type: ${info.disabilityType}`);
      console.log(`Estimated pension: $${info.estimatedPension}/month`);
    } else {
      console.log('Not eligible for disability pension');
    }
  }
}
```

---

## Component Features

### 1. Real-time Validation
- Validates disability level on every input change
- Checks contribution months against requirements
- Immediately updates eligibility status

### 2. User-Friendly Display

#### Input Section
- Material Design outlined input field
- Percent icon prefix
- Min/Max validation hints
- Clear error messages

#### Eligibility Summary
- Visual badge showing disability type and level
- Color-coded: Red for Absolute, Yellow for Relative
- Clear description of what each type means

#### Calculation Details
- Formula display: P = R × (N / 360)
- Breakdown of each component
- Highlighted final pension amount

#### Important Notes
- Work permission status
- Auto-conversion information
- Medical certification requirement

### 3. Responsive Design
- Mobile-friendly layout
- Flexible grid system
- Readable on all screen sizes

---

## Visual Design

### Color Scheme

**Eligible Card:**
- Background: Purple gradient (#667eea → #764ba2)
- Accent: Gold (#ffd54f)

**Ineligible Card:**
- Background: Light red (#ffebee)
- Border: Red (#f44336)

**Requirements Card:**
- Background: Light grey (#f5f5f5)
- Met requirements: Green (#4caf50)
- Unmet requirements: Grey (#bdbdbd)

### Icons

| Status | Icon | Color |
|--------|------|-------|
| Medical Assessment | `medical_services` | White |
| Eligible | `check_circle` | White |
| Not Eligible | `cancel` | Red |
| Absolute Disability | `block` | White |
| Relative Disability | `work_outline` | White |
| Auto-convert | `autorenew` | White |
| Verification | `verified` | White |

---

## Error Handling

### Validation Errors

**Disability Level < 66.67%:**
```
Disability level must be at least 66.67%
```

**Insufficient Contribution:**
```
Insufficient contribution. Need 60 months, have XX months.
```

### Form Validation

- Required field validation
- Min (0%) validation
- Max (100%) validation
- Number format validation

---

## Special Cases

### 1. Young Worker (Age < 60)
Shows: "Your pension will auto-convert to Old-Age at 60 (in X years)"

### 2. Near Retirement (Age 59)
Shows: "Will auto-convert in 1 year"

### 3. At/Past Retirement Age (Age ≥ 60)
Shows: "You are at or past conversion age. This will be processed as Old-Age Pension."

### 4. Borderline Eligibility
- Exactly 66.67% disability
- Exactly 60 months contribution
- Shows as eligible with "BORDERLINE" indicator

---

## Requirements Display

Live checklist showing:
- ☑️ Disability Level ≥ 66.67% (current: XX%)
- ☑️ Contribution ≥ 60 months (current: XX months)
- ⬜ Medical Certification (to be verified)
- ⬜ Permanent Condition (cannot recover within 3 years)

---

## Integration with New Contributory Request

### Step Flow

**Old Flow (Old-Age Pension):**
1. Citizen Search
2. Choose Scheme Type
3. Retirement Options ← (Old-Age)
4. Upload Documents
5. Bank Account

**New Flow (Disability Pension):**
1. Citizen Search
2. Choose Scheme Type
3. Disability Assessment ← (New step)
4. Upload Documents
5. Bank Account

### Validation in Parent

```typescript
canProceedToNextStep(): boolean {
  // For disability pension, step 2 is disability info
  if (this.selectedBenefitType === 'disability-pension') {
    return this.disabilityInfo !== null && this.disabilityInfo.isEligible;
  }
  // ... other validations
}
```

### Data Collection

```typescript
submitRequest(): void {
  if (this.selectedBenefitType === 'disability-pension') {
    request.disabilityLevel = this.disabilityInfo?.disabilityLevel;
    request.disabilityType = this.disabilityInfo?.disabilityType || undefined;
    request.estimatedPension = this.disabilityInfo?.estimatedPension;
    // ... bank account and documents
  }
}
```

---

## Test Cases Covered

The component is designed to handle all 7 test cases from `mock-data.constants.ts`:

| NISS | Scenario | Expected Behavior |
|------|----------|-------------------|
| **TLD111111111** | Absolute, 99 months | ✅ Eligible - Show absolute type, $31.63/month |
| **TLD222222222** | Relative 75%, 90 months | ✅ Eligible - Show relative type, can work |
| **TLD333333333** | Relative 70%, 56 months | ❌ Reject - Insufficient contribution |
| **TLD444444444** | 50%, 120 months | ❌ Reject - Insufficient disability |
| **TLD555555555** | 66.67%, 60 months | ✅ Eligible - Borderline case |
| **TLD666666666** | Absolute, 75 months, age 28 | ✅ Eligible - Young worker, long-term |
| **TLD777777777** | Relative 80%, 264 months, age 59 | ✅ Eligible - Near 60, high pension |

---

## Technical Implementation

### Component Structure

```
disability-pension-info/
├── disability-pension-info.component.ts      # Logic & validation
├── disability-pension-info.component.html    # Template
├── disability-pension-info.component.css     # Styles
└── DISABILITY_PENSION_COMPONENT.md          # This documentation
```

### Key Methods

```typescript
// Calculate and validate disability information
private calculateDisabilityInfo(): void

// Emit changes to parent component
private emitChange(): void

// Get display label for disability type
getDisabilityTypeLabel(): string

// Get description for disability type
getDisabilityTypeDescription(): string

// Check if can work
canWork(): boolean

// Format currency
formatCurrency(amount: number): string

// Calculate years until auto-conversion
getYearsUntilConversion(): number
```

### Lifecycle

1. **ngOnInit:** Setup form control subscription
2. **ngOnChanges:** Recalculate if inputs change
3. **User Input:** Validate and calculate on every change
4. **Emit:** Send updated info to parent component

---

## Dependencies

### Angular Material Modules Required:
- `MatFormFieldModule`
- `MatInputModule`
- `MatIconModule`
- `MatCardModule`
- `MatDividerModule`

### Angular Core:
- `FormsModule`
- `ReactiveFormsModule`

---

## Future Enhancements

### Potential Features:
1. **Medical Certificate Upload** - Direct integration with certificate verification
2. **Historical Disability Records** - Show previous assessments
3. **Rehabilitation Programs** - Link to available programs for relative disability
4. **Income Calculator** - For relative disability, calculate max allowable income
5. **Appeal Process** - If rejected, provide appeal mechanism
6. **Multi-language Support** - Tetum, Portuguese, English

---

## Accessibility

- ✅ ARIA labels on form fields
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ High contrast mode compatible
- ✅ Error messages clearly announced

---

## Performance

- ✅ OnPush change detection (if needed)
- ✅ Debounced input validation
- ✅ Minimal re-renders
- ✅ Lightweight calculations

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

**Created:** 2025-11-22  
**Version:** 1.0  
**Based on:** Decreto-Lei N.º 17/2017 (Articles 12-19, 30, 33-36)  
**Status:** ✅ Production Ready

