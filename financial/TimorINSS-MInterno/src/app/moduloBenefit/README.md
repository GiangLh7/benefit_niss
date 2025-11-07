# Benefit Module

This module manages all benefit-related functionality in the TimorINSS application.

## 📁 Structure

```
moduloBenefit/
├── benefit.module.ts                 # Main module file
├── benefit-routing.module.ts         # Routing configuration
├── benefit-home/                     # Home component
│   ├── benefit-home.component.ts
│   ├── benefit-home.component.html
│   └── benefit-home.component.css
├── models/                           # Data models
│   └── benefit.model.ts
├── services/                         # Services
│   └── benefit.service.ts
└── README.md                         # This file
```

## 🚀 Quick Start

### Access the Module

The benefit module is lazy-loaded and accessible at:

```
http://localhost:4200/benefit
```

### In Development

```bash
npm start
# Navigate to http://localhost:4200/benefit
```

### In Docker

```bash
./docker-rebuild.sh
# Navigate to http://localhost:8080/benefit
```

## 📝 Adding New Components

### 1. Create Component

```bash
# Using Angular CLI
cd src/app/moduloBenefit
ng generate component benefit-list --skip-tests

# Or create manually:
mkdir benefit-list
touch benefit-list/benefit-list.component.ts
touch benefit-list/benefit-list.component.html
touch benefit-list/benefit-list.component.css
```

### 2. Add to Module Declarations

Update `benefit.module.ts`:

```typescript
import { BenefitListComponent } from './benefit-list/benefit-list.component';

@NgModule({
  declarations: [
    BenefitHomeComponent,
    BenefitListComponent, // Add here
  ],
  // ...
})
```

### 3. Add Route

Update `benefit-routing.module.ts`:

```typescript
const routes: Routes = [
  {
    path: '',
    component: BenefitHomeComponent,
    children: [
      { path: 'list', component: BenefitListComponent },
      // More routes...
    ]
  }
];
```

## 📊 Available Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/benefit` | BenefitHomeComponent | Main benefit page |
| `/benefit/list` | (To be created) | List all benefits |
| `/benefit/create` | (To be created) | Create new benefit |
| `/benefit/detail/:id` | (To be created) | View benefit details |

## 🔧 Services

### BenefitService

Main service for benefit operations:

```typescript
import { BenefitService } from './services/benefit.service';

constructor(private benefitService: BenefitService) {}

// Get all benefits
this.benefitService.getAllBenefits().subscribe(benefits => {
  console.log(benefits);
});

// Create benefit
this.benefitService.createBenefit(benefitData).subscribe(benefit => {
  console.log('Created:', benefit);
});
```

### Available Methods

- `getAllBenefits()`: Get all benefits
- `getBenefitById(id)`: Get specific benefit
- `getBenefitsFiltered(filter)`: Get filtered benefits
- `getBenefitsByBeneficiaryId(id)`: Get benefits by beneficiary
- `createBenefit(data)`: Create new benefit
- `updateBenefit(id, data)`: Update benefit
- `deleteBenefit(id)`: Delete benefit
- `approveBenefit(id)`: Approve benefit
- `suspendBenefit(id, reason)`: Suspend benefit
- `cancelBenefit(id, reason)`: Cancel benefit
- `reactivateBenefit(id)`: Reactivate benefit

## 📦 Models

### Benefit

```typescript
interface Benefit {
  id?: number;
  name: string;
  description: string;
  type: BenefitType;
  amount: number;
  status: BenefitStatus;
  startDate: Date;
  endDate?: Date;
  beneficiaryId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### BenefitType

```typescript
enum BenefitType {
  RETIREMENT = 'RETIREMENT',
  DISABILITY = 'DISABILITY',
  SURVIVOR = 'SURVIVOR',
  MATERNITY = 'MATERNITY',
  SICKNESS = 'SICKNESS',
  UNEMPLOYMENT = 'UNEMPLOYMENT',
  OTHER = 'OTHER'
}
```

### BenefitStatus

```typescript
enum BenefitStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}
```

## 🌍 Translations

Add translations to your i18n files:

```json
{
  "BENEFIT_MODULE": "Benefit Module",
  "BENEFIT_HOME": "Benefits Home",
  "BENEFIT_HOME_SUBTITLE": "Manage all benefits",
  "VIEW_BENEFITS": "View Benefits",
  "CREATE_BENEFIT": "Create Benefit",
  "BENEFIT_WELCOME_MESSAGE": "Welcome to the Benefit Management System"
}
```

## 🎨 Styling

The module uses Angular Material components with custom theming from `custom-theme.scss`. All components follow the compact density settings.

## 🔒 Security

- All routes should be protected with authentication guards (add as needed)
- Service methods use the API proxy configuration
- Token-based authentication is handled by interceptors

## 📚 Next Steps

1. **Create List Component**: Display all benefits in a table
2. **Create Detail Component**: Show benefit details
3. **Create Form Component**: Add/Edit benefit forms
4. **Add Guards**: Implement route guards for authorization
5. **Add Validators**: Create custom form validators
6. **Add Tests**: Write unit tests for components and services

## 🐛 Troubleshooting

### Module not loading

```bash
# Check if module is properly imported
# Verify lazy loading in app-routing.module.ts
```

### API calls failing

```bash
# Check proxy configuration
# Development: proxy.conf.json
# Production: nginx-default.conf
```

### Styling issues

```bash
# Verify Angular Material is imported in benefit.module.ts
# Check if custom-theme.scss is loaded in angular.json
```

## 📞 Support

For questions or issues, refer to:
- Main project README
- Angular documentation: https://angular.dev
- Material documentation: https://material.angular.io

