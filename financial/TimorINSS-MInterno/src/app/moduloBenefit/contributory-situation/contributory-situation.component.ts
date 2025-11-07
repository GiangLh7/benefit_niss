import { Component, OnInit } from '@angular/core';

export interface ContributorySummaryRow {
  metric: string;
  value: string;
  details: string;
  status?: 'active' | 'inactive' | 'verified';
}

@Component({
  standalone: false,
  selector: 'app-contributory-situation',
  templateUrl: './contributory-situation.component.html',
  styleUrls: ['./contributory-situation.component.css']
})
export class ContributorySituationComponent implements OnInit {
  displayedColumns: string[] = ['metric', 'value', 'details'];
  summaryData: ContributorySummaryRow[] = [];
  isLoading = false;

  constructor() { }

  ngOnInit(): void {
    this.loadContributorySituation();
  }

  loadContributorySituation(): void {
    this.isLoading = true;
    
    // Mock data - replace with service call
    this.summaryData = [
      {
        metric: 'Total Contribution Years',
        value: '15 years',
        details: 'Timor-Leste: 12 yrs + Portugal: 3 yrs'
      },
      {
        metric: 'Total Amount Contributed',
        value: '$28,500 USD',
        details: 'Avg. $1,900/yr'
      },
      {
        metric: 'Current Status',
        value: 'Active',
        details: 'Last contribution: May 2025',
        status: 'active'
      },
      {
        metric: 'Minimum Requirement Met?',
        value: 'Yes (15/5 yrs)',
        details: 'Eligible for Full Pension'
      },
      {
        metric: 'Foreign Contributions',
        value: '3 years (Verified)',
        details: 'Agreement: PT-TL 2018',
        status: 'verified'
      }
    ];

    // TODO: Load from service
    // this.benefitService.getContributorySituation().subscribe(...)
    
    this.isLoading = false;
  }
}
