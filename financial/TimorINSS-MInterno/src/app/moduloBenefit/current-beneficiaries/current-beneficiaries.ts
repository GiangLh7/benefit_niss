import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface BeneficiaryRow {
  position: number;
  type: string;
  niss: string;
  electoralId: string;
  noBi: string;
  fullName: string;
  municipality: string;
  post: string;
  suco: string;
  subVillage: string;
  dob: string;
  age: number;
  sex: string;
  bankName: string;
  bankAccount: string;
  iban: string;
  amount: number;
  phase: string;
}

@Component({
  standalone: false,
  selector: 'app-current-beneficiaries',
  templateUrl: './current-beneficiaries.html',
  styleUrls: ['./current-beneficiaries.css'],
})
export class CurrentBeneficiariesComponent implements OnInit {
  displayedColumns: string[] = [
    'position',
    'type',
    'niss',
    'noBi',
    'fullName',
    'municipality',
    'post',
    'suco',
    'subVillage',
    'dob',
    'age',
    'sex',
    'bankName',
    'bankAccount',
    'iban',
    'amount',
  ];

  nonContributoryBeneficiaries: BeneficiaryRow[] = [];
  contributoryBeneficiaries: BeneficiaryRow[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Mocked data for demonstration purposes. Replace with API data when available.
    this.nonContributoryBeneficiaries = [
      {
        position: 1,
        type: 'Old-Age (PV)',
        niss: 'TL123456',
        electoralId: 'EL987654',
        noBi: 'BI5565',
        fullName: 'Maria Santos',
        municipality: 'Dili',
        post: 'Vera',
        suco: 'Bidau',
        subVillage: 'Vera',
        dob: '15/08/63',
        age: 61,
        sex: 'Female',
        bankName: 'ANZ Bank',
        bankAccount: '323-654321',
        iban: 'TL3800...',
        amount: 300,
        phase: 'I',
      },
      {
        position: 2,
        type: 'Disability (PI)',
        niss: 'TL789012',
        electoralId: 'EL123456',
        noBi: 'BI8565',
        fullName: 'Joao Carlos',
        municipality: 'Baucau',
        post: 'Buco',
        suco: 'Wataboo',
        subVillage: 'Bucoli',
        dob: '18/08/65',
        age: 54,
        sex: 'Male',
        bankName: 'BNU Timor',
        bankAccount: '865-654321',
        iban: 'TL3800...',
        amount: 200,
        phase: 'II',
      },
      {
        position: 3,
        type: 'Social Old Age',
        niss: 'TL545678',
        electoralId: 'EL555555',
        noBi: 'BI6465',
        fullName: 'Ana da Silva',
        municipality: 'Liquica',
        post: 'Bucoli',
        suco: 'Vatvou',
        subVillage: 'Bucoli',
        dob: '15/08/63',
        age: 58,
        sex: 'Female',
        bankName: 'ANZ Bank',
        bankAccount: '987-654321',
        iban: 'TL3800...',
        amount: 250,
        phase: 'III',
      },
    ];

    this.contributoryBeneficiaries = [
      {
        position: 1,
        type: 'Old-Age Pension',
        niss: 'TL112233',
        electoralId: 'EL223344',
        noBi: 'BI1010',
        fullName: 'Jose Manuel',
        municipality: 'Dili',
        post: 'Cristo Rei',
        suco: 'Bairo Pite',
        subVillage: 'Fatuhada',
        dob: '01/01/60',
        age: 64,
        sex: 'Male',
        bankName: 'BNCTL',
        bankAccount: '201-554433',
        iban: 'TL1100...',
        amount: 450,
        phase: 'Active',
      },
      {
        position: 2,
        type: 'Disability Pension',
        niss: 'TL221144',
        electoralId: 'EL334455',
        noBi: 'BI2020',
        fullName: 'Lucia Amaral',
        municipality: 'Ermera',
        post: 'Letefoho',
        suco: 'Catrai Kraic',
        subVillage: 'Hatugau',
        dob: '12/04/1970',
        age: 54,
        sex: 'Female',
        bankName: 'ANZ Bank',
        bankAccount: '445-778899',
        iban: 'TL2200...',
        amount: 380,
        phase: 'Active',
      },
      {
        position: 3,
        type: 'Survivor Pension',
        niss: 'TL889900',
        electoralId: 'EL667788',
        noBi: 'BI3030',
        fullName: 'Pedro Gomes',
        municipality: 'Manatuto',
        post: 'Laclo',
        suco: 'Uma Boco',
        subVillage: 'Uma Boco',
        dob: '25/09/1958',
        age: 66,
        sex: 'Male',
        bankName: 'BNU Timor',
        bankAccount: '112-233445',
        iban: 'TL3300...',
        amount: 420,
        phase: 'Pending Review',
      },
    ];
  }

  goBack(): void {
    this.router.navigate(['/benefit/contribution-scheme']);
  }

  generatePaymentList(): void {
    alert('Payment list generated successfully.');
  }
}
