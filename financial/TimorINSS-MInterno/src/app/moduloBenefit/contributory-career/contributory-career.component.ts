import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

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
export class ContributoryCareerComponent implements OnInit {
  displayedColumns: string[] = ['period', 'employer', 'salary', 'contributionRate', 'contributionAmount', 'monthsContributed', 'status'];
  dataSource: MatTableDataSource<CareerRecord>;
  isLoading = false;
  
  totalMonths = 0;
  totalContributions = 0;
  careerStartDate: Date | null = null;
  careerYears = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Mock data - replace with service call
    const mockData: CareerRecord[] = [
      {
        period: '2024',
        employer: 'Government Office',
        salary: 1000,
        contributionRate: 11,
        contributionAmount: 110,
        monthsContributed: 10,
        status: 'Active'
      },
      {
        period: '2023',
        employer: 'Government Office',
        salary: 950,
        contributionRate: 11,
        contributionAmount: 104.50,
        monthsContributed: 12,
        status: 'Complete'
      },
      {
        period: '2022',
        employer: 'Private Company',
        salary: 900,
        contributionRate: 11,
        contributionAmount: 99,
        monthsContributed: 12,
        status: 'Complete'
      },
      {
        period: '2021',
        employer: 'Private Company',
        salary: 850,
        contributionRate: 11,
        contributionAmount: 93.50,
        monthsContributed: 11,
        status: 'Incomplete'
      },
    ];

    this.dataSource = new MatTableDataSource(mockData);
    this.calculateTotals(mockData);
  }

  ngOnInit(): void {
    this.loadContributoryCareer();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadContributoryCareer(): void {
    this.isLoading = true;
    // TODO: Load from service
    // this.benefitService.getContributoryCareer().subscribe(...)
    this.isLoading = false;
  }

  calculateTotals(data: CareerRecord[]): void {
    this.totalMonths = data.reduce((sum, record) => sum + record.monthsContributed, 0);
    this.totalContributions = data.reduce((sum, record) => sum + (record.contributionAmount * record.monthsContributed), 0);
    this.careerYears = Math.floor(this.totalMonths / 12);
    this.careerStartDate = new Date(parseInt(data[data.length - 1].period), 0, 1);
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

