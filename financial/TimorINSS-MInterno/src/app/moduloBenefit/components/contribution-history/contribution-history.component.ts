import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ContributionPeriod, HealthStatus } from '../../models/benefit.model';
import { calculateAge, formatAge } from '../../utils/eligibility.utils';
import { DEFAULT_HEALTH_STATUS } from '../../constants/eligibility.constants';
import { BenefitService } from '../../services/benefit.service';

export interface ContributionData {
  contributionHistory: ContributionPeriod[];
  totalContributionYears: number;
  totalContributionMonths: number;
  contributionMonths: number;
  currentAge: string;
  healthStatus: HealthStatus;
}

@Component({
  standalone: false,
  selector: 'app-contribution-history',
  templateUrl: './contribution-history.component.html',
  styleUrls: ['./contribution-history.component.css']
})
export class ContributionHistoryComponent implements OnInit, OnChanges {
  @Input() citizenNiss!: string;
  @Input() dateOfBirth!: string;
  @Output() contributionDataLoaded = new EventEmitter<ContributionData>();

  contributionHistory: ContributionPeriod[] = [];
  totalContributionYears: number = 0;
  totalContributionMonths: number = 0;
  contributionMonths: number = 0;
  currentAge: string = '';
  healthStatus: HealthStatus = { status: DEFAULT_HEALTH_STATUS };
  isLoading: boolean = false;

  constructor(private benefitService: BenefitService) {}

  ngOnInit(): void {
    this.loadContributionHistory();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['citizenNiss'] && !changes['citizenNiss'].firstChange) {
      this.loadContributionHistory();
    }
  }

  private loadContributionHistory(): void {
    if (!this.citizenNiss) {
      return;
    }

    this.isLoading = true;

    this.benefitService.getContributionHistoryByNiss(this.citizenNiss).subscribe({
      next: (data) => {
        if (!data || !data.contributionHistory) {
          this.contributionHistory = [];
          this.totalContributionYears = 0;
          this.totalContributionMonths = 0;
          this.contributionMonths = 0;
          this.isLoading = false;
          this.emitData();
          return;
        }

        this.contributionHistory = data.contributionHistory;
        this.totalContributionYears = data.totalYears || 0;
        this.totalContributionMonths = data.totalMonths || 0;
        this.contributionMonths = this.totalContributionYears * 12 + this.totalContributionMonths;

        // Calculate current age
        if (this.dateOfBirth) {
          const age = calculateAge(this.dateOfBirth);
          this.currentAge = formatAge(age.years, age.months);
        }

        this.isLoading = false;
        this.emitData();
      },
      error: (error) => {
        console.error('Error loading contribution history:', error);
        this.contributionHistory = [];
        this.totalContributionYears = 0;
        this.totalContributionMonths = 0;
        this.contributionMonths = 0;
        this.isLoading = false;
        this.emitData();
      },
    });
  }

  private emitData(): void {
    const data: ContributionData = {
      contributionHistory: this.contributionHistory,
      totalContributionYears: this.totalContributionYears,
      totalContributionMonths: this.totalContributionMonths,
      contributionMonths: this.contributionMonths,
      currentAge: this.currentAge,
      healthStatus: this.healthStatus
    };
    this.contributionDataLoaded.emit(data);
  }
}
