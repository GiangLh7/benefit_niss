import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SocialContributionRecord {
  fromDate: string;
  toDate: string;
  employer: string;
  premium: string;
  regime: string;
  contributionType: string;
}

export interface MonthlyContributionRecord {
  month: string;
  workingDays: number;
  declaredRemuneration: string;
  regime: string;
  adherenceType: string;
}

export interface ContributionHistoryResponse {
  socialHistory: SocialContributionRecord[];
  monthlyBreakdown: MonthlyContributionRecord[];
}

@Injectable({
  providedIn: 'root',
})
export class ContributionService {
  private readonly http = inject(HttpClient);

  loadContributionHistory(): Observable<ContributionHistoryResponse> {
    // Placeholder pointing to mock data; swap to real API endpoint when ready.
    return this.http.get<ContributionHistoryResponse>('/assets/mock/contribution-history.json');
  }
}

