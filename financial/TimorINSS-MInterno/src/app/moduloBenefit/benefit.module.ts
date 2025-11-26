import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

// Ngx-Translate
import { TranslateModule } from '@ngx-translate/core';

// Routing
import { BenefitRoutingModule } from './benefit-routing.module';

// Components
import { BenefitHomeComponent } from './benefit-home/benefit-home.component';
import { BenefitGrantedComponent } from './benefit-granted/benefit-granted.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { ContributorySituationComponent } from './contributory-situation/contributory-situation.component';
import { ContributoryCareerComponent } from './contributory-career/contributory-career.component';
import { ProfessionalSituationComponent } from './professional-situation/professional-situation.component';
import { NewContributoryRequestComponent } from './new-contributory-request/new-contributory-request';
import { CurrentBeneficiariesComponent } from './current-beneficiaries/current-beneficiaries';
import { PendingRequestsComponent } from './pending-requests/pending-requests';
import { CalculationResultComponent } from './components/calculation-result/calculation-result.component';
import { ContributionHistoryComponent } from './components/contribution-history/contribution-history.component';
import { SurvivorPensionInfoComponent } from './components/survivor-pension-info/survivor-pension-info.component';
import { EligibilityRejectionDialogComponent } from './components/eligibility-rejection-dialog/eligibility-rejection-dialog.component';
import { DisabilityPensionInfoComponent } from './components/disability-pension-info/disability-pension-info.component';
import { RetirementOptionsComponent } from './components/retirement-options/retirement-options.component';
import { DocumentUploadComponent } from './components/document-upload/document-upload.component';
import { BankAccountComponent } from './components/bank-account/bank-account.component';
import { NonContributoryBenefitsComponent } from './components/non-contributory-benefits/non-contributory-benefits.component';
import { SurvivorBenefitTypeComponent } from './components/survivor-benefit-type/survivor-benefit-type.component';

@NgModule({
  declarations: [
    BenefitHomeComponent,
    BenefitGrantedComponent,
    PersonalDataComponent,
    ContributorySituationComponent,
    ContributoryCareerComponent,
    ProfessionalSituationComponent,
    NewContributoryRequestComponent,
    CurrentBeneficiariesComponent,
    PendingRequestsComponent,
    CalculationResultComponent,
    ContributionHistoryComponent,
    SurvivorPensionInfoComponent,
    EligibilityRejectionDialogComponent,
    DisabilityPensionInfoComponent,
    RetirementOptionsComponent,
    DocumentUploadComponent,
    BankAccountComponent,
    NonContributoryBenefitsComponent,
    SurvivorBenefitTypeComponent,
    // Add more components here as you create them
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BenefitRoutingModule,
    TranslateModule,
    // Material Modules
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatMenuModule,
    MatStepperModule,
    MatRadioModule,
    MatTabsModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
  ],
})
export class BenefitModule {}
