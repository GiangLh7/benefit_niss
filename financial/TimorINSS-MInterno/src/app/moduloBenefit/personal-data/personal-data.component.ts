import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { BenefitService } from '../services/benefit.service';

export interface PersonalDataRow {
  label: string;
  value: string;
}

@Component({
  standalone: false,
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css']
})
export class PersonalDataComponent implements OnInit, OnChanges {
  @Input() niss?: string; // Optional NISS input to load specific person's data
  
  displayedColumns: string[] = ['label', 'value'];
  dataSource: PersonalDataRow[] = [];
  isLoading = false;

  constructor(private benefitService: BenefitService) { }

  ngOnInit(): void {
    this.loadPersonalData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['niss'] && !changes['niss'].firstChange) {
      this.loadPersonalData();
    }
  }

  loadPersonalData(): void {
    this.isLoading = true;
    
    const nissToLoad = this.niss || 'TL123456789'; // Default to first person if no NISS provided
    
    this.benefitService.getPersonalDataByNiss(nissToLoad).subscribe({
      next: (data) => {
        this.dataSource = [
          { label: 'Name:', value: data.name },
          { label: 'Date of Birth:', value: data.dateOfBirth },
          { label: 'Address:', value: data.address },
          { label: 'Social Security ID (NISS):', value: data.niss },
          { label: 'Marital Status:', value: data.maritalStatus },
          { label: 'Dependents:', value: data.dependents || 'None' }
        ];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading personal data:', error);
        this.isLoading = false;
        // Fallback to empty data on error
        this.dataSource = [];
      },
    });
  }
}
