import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../auth/auth';

@Component({
  selector: 'app-benefit-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './benefit-dashboard.html',
  styleUrl: './benefit-dashboard.scss',
})
export class BenefitDashboard {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly userName = 'michael';
  readonly nissNumber = '6508000383';

  readonly claims = [
    {
      id: 'claim-1234',
      label: 'Claim #1234',
      steps: [
        {
          id: 1,
          label: 'Submitted',
          status: 'completed',
          date: '15/05/2025',
          note: 'Application received'
        },
        {
          id: 2,
          label: 'Under Review',
          status: 'active',
          date: '15/05/2025',
          note: 'Case officer assigned'
        },
        {
          id: 3,
          label: 'Docs Requested',
          status: 'pending',
          date: '15/05/2025',
          note: 'Bank proof needed'
        },
        {
          id: 4,
          label: 'Approved',
          status: 'idle',
          date: '',
          note: 'Not started'
        },
        {
          id: 5,
          label: 'Payment',
          status: 'idle',
          date: '',
          note: 'Not started'
        }
      ]
    },
    {
      id: 'claim-2456',
      label: 'Claim #2456',
      steps: [
        {
          id: 1,
          label: 'Submitted',
          status: 'completed',
          date: '01/04/2025',
          note: 'Application received'
        },
        {
          id: 2,
          label: 'Under Review',
          status: 'completed',
          date: '05/04/2025',
          note: 'Initial assessment complete'
        },
        {
          id: 3,
          label: 'Docs Requested',
          status: 'completed',
          date: '10/04/2025',
          note: 'Supporting documents received'
        },
        {
          id: 4,
          label: 'Approved',
          status: 'active',
          date: '14/04/2025',
          note: 'Pending director signature'
        },
        {
          id: 5,
          label: 'Payment',
          status: 'idle',
          date: '',
          note: 'Not started'
        }
      ]
    },
    {
      id: 'claim-3620',
      label: 'Claim #3620',
      steps: [
        {
          id: 1,
          label: 'Submitted',
          status: 'completed',
          date: '20/03/2025',
          note: 'Application received'
        },
        {
          id: 2,
          label: 'Under Review',
          status: 'completed',
          date: '25/03/2025',
          note: 'Case officer assigned'
        },
        {
          id: 3,
          label: 'Docs Requested',
          status: 'completed',
          date: '30/03/2025',
          note: 'Documents verified'
        },
        {
          id: 4,
          label: 'Approved',
          status: 'completed',
          date: '02/04/2025',
          note: 'Payment scheduled'
        },
        {
          id: 5,
          label: 'Payment',
          status: 'completed',
          date: '05/04/2025',
          note: 'Funds transferred'
        }
      ]
    }
  ];

  readonly selectedClaimId = signal(this.claims[0].id);

  readonly currentSteps = computed(() => {
    const selected = this.claims.find((claim) => claim.id === this.selectedClaimId());
    return selected ? selected.steps : [];
  });

  readonly contributionSummary = [
    {
      title: 'Total Contributions',
      value: '$5,000',
      icon: '💲',
      linkLabel: 'View Details'
    },
    {
      title: 'Years Contributed',
      value: '15 years',
      icon: '📅',
      linkLabel: 'View Details'
    }
  ];

  readonly benefitHistory = [
    {
      type: 'Old-Age Pension (PV)',
      status: 'Paid',
      amount: '$500',
      date: '20/05/2025',
      reference: 'PV-2025-001'
    },
    {
      type: 'Disability Grant',
      status: 'Paid',
      amount: '$500',
      date: '20/05/2025',
      reference: 'DG-2025-012'
    },
    {
      type: 'Survivor’s Pension',
      status: 'Pending',
      amount: '—',
      date: '—',
      reference: 'SP-2025-005'
    },
    {
      type: 'Social Old-Age (PSV)',
      status: 'Paid',
      amount: '$500',
      date: '20/05/2025',
      reference: 'PSV-2025-008'
    },
    {
      type: 'Unemployment Allowance',
      status: 'Paid',
      amount: '$500',
      date: '20/05/2025',
      reference: 'UA-2025-003'
    }
  ];

  logout(): void {
    this.auth.logout();
  }

  onSelectClaim(id: string): void {
    this.selectedClaimId.set(id);
  }

  viewContributionHistory(): void {
    void this.router.navigate(['/contributions']);
  }
}
