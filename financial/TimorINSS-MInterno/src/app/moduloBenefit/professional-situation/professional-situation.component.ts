import { Component, OnInit, OnChanges, Input, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BenefitService } from '../services/benefit.service';

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
export class ProfessionalSituationComponent implements OnInit, OnChanges {
  @Input() niss?: string;
  
  displayedColumns: string[] = ['employer', 'position', 'startDate', 'endDate', 'status', 'contractType', 'actions'];
  dataSource: MatTableDataSource<ProfessionalRecord> = new MatTableDataSource<ProfessionalRecord>([]);
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private benefitService: BenefitService) {}

  ngOnInit(): void {
    this.loadProfessionalSituation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['niss'] && !changes['niss'].firstChange) {
      this.loadProfessionalSituation();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProfessionalSituation(): void {
    if (!this.niss) {
      return;
    }

    this.isLoading = true;
    this.benefitService.getProfessionalSituation(this.niss).subscribe({
      next: (data) => {
        if (data && data.records) {
          this.dataSource.data = data.records;
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
        } else {
          this.dataSource.data = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading professional situation:', error);
        this.dataSource.data = [];
        this.isLoading = false;
      }
    });
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

