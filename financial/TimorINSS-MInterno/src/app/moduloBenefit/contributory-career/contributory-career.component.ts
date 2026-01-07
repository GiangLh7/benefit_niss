import { Component, OnInit, OnChanges, Input, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BenefitService } from '../services/benefit.service';

export interface CareerRecord {
  period: string;
  employer: string;
  salary: number;
  contributionRate: number;
  contributionAmount: number;
  monthsContributed: number;
  status: string;
}

@Component({
  standalone: false,
  selector: 'app-contributory-career',
  templateUrl: './contributory-career.component.html',
  styleUrls: ['./contributory-career.component.css']
})
export class ContributoryCareerComponent implements OnInit, OnChanges {
  @Input() niss?: string;
  
  displayedColumns: string[] = ['period', 'employer', 'salary', 'contributionRate', 'contributionAmount', 'monthsContributed', 'status'];
  dataSource: MatTableDataSource<CareerRecord> = new MatTableDataSource<CareerRecord>([]);
  isLoading = false;
  
  totalMonths = 0;
  totalContributions = 0;
  careerStartDate: Date | null = null;
  careerYears = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private benefitService: BenefitService) {}

  ngOnInit(): void {
    this.loadContributoryCareer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['niss'] && !changes['niss'].firstChange) {
      this.loadContributoryCareer();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadContributoryCareer(): void {
    if (!this.niss) {
      return;
    }

    this.isLoading = true;
    this.benefitService.getContributoryCareer(this.niss).subscribe({
      next: (data) => {
        if (data && data.records) {
          this.dataSource.data = data.records;
          this.calculateTotals(data.records);
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        } else {
          this.dataSource.data = [];
          this.calculateTotals([]);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contributory career:', error);
        this.dataSource.data = [];
        this.calculateTotals([]);
        this.isLoading = false;
      }
    });
  }

  calculateTotals(data: CareerRecord[]): void {
    if (!data || data.length === 0) {
      this.totalMonths = 0;
      this.totalContributions = 0;
      this.careerYears = 0;
      this.careerStartDate = null;
      return;
    }

    this.totalMonths = data.reduce((sum, record) => sum + (record.monthsContributed || 0), 0);
    this.totalContributions = data.reduce((sum, record) => sum + ((record.contributionAmount || 0) * (record.monthsContributed || 0)), 0);
    this.careerYears = Math.floor(this.totalMonths / 12);
    
    // Get career start date from the last record (oldest period)
    const lastRecord = data[data.length - 1];
    if (lastRecord && lastRecord.period) {
      this.careerStartDate = new Date(parseInt(lastRecord.period), 0, 1);
    } else {
      this.careerStartDate = null;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  exportCareer(): void {
    console.log('Export contributory career');
    // TODO: Implement export functionality
  }

  printCareer(): void {
    console.log('Print contributory career');
    // TODO: Implement print functionality
  }
}

