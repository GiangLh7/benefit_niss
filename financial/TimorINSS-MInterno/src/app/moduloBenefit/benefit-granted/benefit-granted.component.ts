import { Component, OnInit, OnChanges, Input, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { BenefitService } from '../services/benefit.service';

export interface GrantedBenefit {
  id: number;
  benefitType: string;
  startDate: Date;
  endDate?: Date;
  monthlyAmount: number;
  status: string;
  grantDate: Date;
  referenceNumber: string;
  totalPaid: number;
}

@Component({
  standalone: false,
  selector: 'app-benefit-granted',
  templateUrl: './benefit-granted.component.html',
  styleUrls: ['./benefit-granted.component.css']
})
export class BenefitGrantedComponent implements OnInit, OnChanges {
  @Input() niss?: string;
  
  displayedColumns: string[] = ['referenceNumber', 'benefitType', 'startDate', 'monthlyAmount', 'status', 'totalPaid', 'actions'];
  dataSource: MatTableDataSource<GrantedBenefit> = new MatTableDataSource<GrantedBenefit>([]);
  isLoading = false;

  activeBenefits = 0;
  totalMonthlyAmount = 0;
  totalBenefitsPaid = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private benefitService: BenefitService
  ) {}

  ngOnInit(): void {
    this.loadGrantedBenefits();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['niss'] && !changes['niss'].firstChange) {
      this.loadGrantedBenefits();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadGrantedBenefits(): void {
    if (!this.niss) {
      return;
    }

    this.isLoading = true;
    this.benefitService.getGrantedBenefits(this.niss).subscribe({
      next: (data) => {
        if (data && data.benefits) {
          this.dataSource.data = data.benefits;
          this.calculateSummary(data.benefits);
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        } else {
          this.dataSource.data = [];
          this.calculateSummary([]);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading granted benefits:', error);
        this.dataSource.data = [];
        this.calculateSummary([]);
        this.isLoading = false;
      }
    });
  }

  calculateSummary(data: GrantedBenefit[]): void {
    this.activeBenefits = data.filter(b => b.status === 'Active').length;
    this.totalMonthlyAmount = data
      .filter(b => b.status === 'Active')
      .reduce((sum, b) => sum + b.monthlyAmount, 0);
    this.totalBenefitsPaid = data.reduce((sum, b) => sum + b.totalPaid, 0);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewBenefitDetails(benefit: GrantedBenefit): void {
    console.log('View benefit details:', benefit);
    // TODO: Navigate to benefit details
    // this.router.navigate(['/benefit/detail', benefit.id]);
  }

  downloadPaymentHistory(benefit: GrantedBenefit): void {
    console.log('Download payment history for:', benefit);
    // TODO: Implement download
  }

  requestBenefitCertificate(benefit: GrantedBenefit): void {
    console.log('Request certificate for:', benefit);
    // TODO: Implement certificate request
  }

  exportAllBenefits(): void {
    console.log('Export all benefits');
    // TODO: Implement export
  }
}

