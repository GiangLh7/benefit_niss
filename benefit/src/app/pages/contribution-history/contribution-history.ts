import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ContributionHistoryResponse,
  ContributionService,
} from '../../services/contribution.service';

@Component({
  selector: 'app-contribution-history',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './contribution-history.html',
  styleUrl: './contribution-history.scss',
})
export class ContributionHistory implements OnInit {
  private readonly contributionService = inject(ContributionService);
  private readonly router = inject(Router);

  readonly selectedTab = signal<'social' | 'monthly'>('social');
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly data = signal<ContributionHistoryResponse | null>(null);

  readonly filteredSocialHistory = computed(() => {
    const history = this.data();
    if (!history?.socialHistory) return [];
    return history.socialHistory.filter(record => record != null);
  });

  readonly filteredMonthlyBreakdown = computed(() => {
    const history = this.data();
    if (!history?.monthlyBreakdown) return [];
    return history.monthlyBreakdown.filter(row => row != null && row.month);
  });

  ngOnInit(): void {
    this.fetchContributionHistory();
  }

  onSelectTab(tab: 'social' | 'monthly'): void {
    this.selectedTab.set(tab);
  }

  viewDashboard(): void {
    void this.router.navigate(['/benefit']);
  }

  trackByIndex(index: number): number {
    return index;
  }

  private fetchContributionHistory(): void {
    this.loading.set(true);
    this.error.set(null);

    this.contributionService.loadContributionHistory().subscribe({
      next: (payload) => {
        this.data.set(payload);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load contribution history at the moment.');
        this.loading.set(false);
      },
    });
  }
}

