import { Routes } from '@angular/router';
import { PublicHome } from './pages/public-home/public-home';
import { Login } from './auth/login/login';
import { BenefitDashboard } from './pages/benefit-dashboard/benefit-dashboard';
import { authGuard } from './auth/auth-guard';
import { ContributionHistory } from './pages/contribution-history/contribution-history';

export const routes: Routes = [
  {
    path: '',
    component: PublicHome,
    title: 'INSS Portal - Social Security'
  },
  {
    path: 'login',
    component: Login,
    title: 'INSS Portal - Login'
  },
  {
    path: 'benefit',
    canActivate: [authGuard],
    component: BenefitDashboard,
    title: 'INSS Benefit Dashboard'
  },
  {
    path: 'contributions',
    canActivate: [authGuard],
    component: ContributionHistory,
    title: 'Contribution History'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
