import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { BenefitService } from '../services/benefit.service';

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
export class ContributorySituationComponent implements OnInit, OnChanges {
  @Input() niss?: string;
  
  displayedColumns: string[] = ['metric', 'value', 'details'];
  summaryData: ContributorySummaryRow[] = [];
  isLoading = false;

  constructor(private benefitService: BenefitService) { }

  ngOnInit(): void {
    this.loadContributorySituation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['niss'] && !changes['niss'].firstChange) {
      this.loadContributorySituation();
    }
  }

  loadContributorySituation(): void {
    if (!this.niss) {
      return;
    }

    this.isLoading = true;
    this.benefitService.getContributorySituation(this.niss).subscribe({
      next: (data) => {
        if (data && data.summary) {
          this.summaryData = data.summary;
        } else {
          this.summaryData = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contributory situation:', error);
        this.summaryData = [];
        this.isLoading = false;
      }
    });
  }
}
