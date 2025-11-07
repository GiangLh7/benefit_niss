import { Component, OnInit } from '@angular/core';

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
export class PersonalDataComponent implements OnInit {
  displayedColumns: string[] = ['label', 'value'];
  dataSource: PersonalDataRow[] = [];
  isLoading = false;

  constructor() { }

  ngOnInit(): void {
    this.loadPersonalData();
  }

  loadPersonalData(): void {
    this.isLoading = true;
    
    // Mock data - replace with service call
    this.dataSource = [
      { label: 'Name:', value: 'Maria Fernanda dos Santos' },
      { label: 'Date of Birth:', value: '15/08/1963' },
      { label: 'Address:', value: 'Rua de Timor Lorosae, No. 123, Bairro dos Grilos, Dili, Timor-Leste' },
      { label: 'Social Security ID (NISS):', value: 'TL123456789' },
      { label: 'Marital Status:', value: 'Married' },
      { label: 'Dependents:', value: 'José dos Santos (Son, 12y), Ana dos Santos (Daughter, 8y)' }
    ];

    // TODO: Load from service
    // this.benefitService.getPersonalData().subscribe(...)
    
    this.isLoading = false;
  }
}
