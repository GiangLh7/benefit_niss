import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

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
export class BenefitGrantedComponent implements OnInit {
  displayedColumns: string[] = ['referenceNumber', 'benefitType', 'startDate', 'monthlyAmount', 'status', 'totalPaid', 'actions'];
  dataSource: MatTableDataSource<GrantedBenefit>;
  isLoading = false;

  activeBenefits = 0;
  totalMonthlyAmount = 0;
  totalBenefitsPaid = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router) {
    // Mock data - replace with service call
    const mockData: GrantedBenefit[] = [
      {
        id: 1,
        benefitType: 'Retirement Pension',
        startDate: new Date('2023-01-01'),
        endDate: undefined,
        monthlyAmount: 450,
        status: 'Active',
        grantDate: new Date('2022-12-15'),
        referenceNumber: 'BEN-2022-001',
        totalPaid: 9900
      },
      {
        id: 2,
        benefitType: 'Survivor Benefit',
        startDate: new Date('2022-06-01'),
        endDate: new Date('2024-05-31'),
        monthlyAmount: 250,
        status: 'Completed',
        grantDate: new Date('2022-05-20'),
        referenceNumber: 'BEN-2022-045',
        totalPaid: 5750
      }
    ];

    this.dataSource = new MatTableDataSource(mockData);
    this.calculateSummary(mockData);
  }

  ngOnInit(): void {
    this.loadGrantedBenefits();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadGrantedBenefits(): void {
    this.isLoading = true;
    // TODO: Load from service
    // this.benefitService.getGrantedBenefits().subscribe(...)
    this.isLoading = false;
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

