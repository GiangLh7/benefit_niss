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

// Ngx-Translate
import { TranslateModule } from '@ngx-translate/core';

// Routing
import { BenefitRoutingModule } from './benefit-routing.module';

// Components
import { BenefitHomeComponent } from './benefit-home/benefit-home.component';
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { BenefitGrantedComponent } from './benefit-granted/benefit-granted.component';
import { PersonalDataComponent } from './personal-data/personal-data.component';
import { ContributorySituationComponent } from './contributory-situation/contributory-situation.component';
import { ContributoryCareerComponent } from './contributory-career/contributory-career.component';
import { ProfessionalSituationComponent } from './professional-situation/professional-situation.component';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    BenefitHomeComponent,
    BenefitGrantedComponent,
    PersonalDataComponent,
    ContributorySituationComponent,
    ContributoryCareerComponent,
    ProfessionalSituationComponent
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
    MatTab,
    MatTabGroup,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatMenuModule
]
})
export class BenefitModule { }

