import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface ProfessionalRecord {
  id: number;
  employer: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  status: string;
  contractType: string;
  department: string;
}

@Component({
  standalone: false,
  selector: 'app-professional-situation',
  templateUrl: './professional-situation.component.html',
  styleUrls: ['./professional-situation.component.css']
})
export class ProfessionalSituationComponent implements OnInit {
  displayedColumns: string[] = ['employer', 'position', 'startDate', 'endDate', 'status', 'contractType', 'actions'];
  dataSource: MatTableDataSource<ProfessionalRecord>;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Mock data - replace with service call
    const mockData: ProfessionalRecord[] = [
      {
        id: 1,
        employer: 'Government Office',
        position: 'Administrator',
        startDate: new Date('2020-01-15'),
        endDate: undefined,
        status: 'Active',
        contractType: 'Permanent',
        department: 'Finance'
      },
      {
        id: 2,
        employer: 'Private Company Ltd',
        position: 'Accountant',
        startDate: new Date('2018-06-01'),
        endDate: new Date('2019-12-31'),
        status: 'Inactive',
        contractType: 'Contract',
        department: 'Accounting'
      }
    ];

    this.dataSource = new MatTableDataSource(mockData);
  }

  ngOnInit(): void {
    this.loadProfessionalSituation();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProfessionalSituation(): void {
    this.isLoading = true;
    // TODO: Load from service
    // this.benefitService.getProfessionalSituation().subscribe(...)
    this.isLoading = false;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewDetails(record: ProfessionalRecord): void {
    console.log('View details:', record);
    // TODO: Open details dialog or navigate to details page
  }

  addNewRecord(): void {
    console.log('Add new professional record');
    // TODO: Open dialog to add new record
  }

  exportData(): void {
    console.log('Export professional situation data');
    // TODO: Implement export functionality
  }
}

