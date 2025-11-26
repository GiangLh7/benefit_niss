import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BenefitHomeComponent } from './benefit-home/benefit-home.component';
import { NewContributoryRequestComponent } from './new-contributory-request/new-contributory-request';
import { PendingRequestsComponent } from './pending-requests/pending-requests';
import { CurrentBeneficiariesComponent } from './current-beneficiaries/current-beneficiaries';

const routes: Routes = [
  {
    path: '',
    component: BenefitHomeComponent,
    children: [
      {
        path: '',
        redirectTo: 'citizen-record',
        pathMatch: 'full',
      },
      {
        path: 'citizen-record',
        component: BenefitHomeComponent,
      },
      {
        path: 'contribution-scheme',
        component: BenefitHomeComponent,
      },
    ],
  },
  {
    path: 'new-contributory-request',
    component: NewContributoryRequestComponent,
  },
  {
    path: 'pending-requests',
    component: PendingRequestsComponent,
  },
  {
    path: 'current-beneficiaries',
    component: CurrentBeneficiariesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BenefitRoutingModule {}
