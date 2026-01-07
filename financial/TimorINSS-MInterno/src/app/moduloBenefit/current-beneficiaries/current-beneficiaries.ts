import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BenefitService } from '../services/benefit.service';

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

  constructor(
    private router: Router,
    private benefitService: BenefitService
  ) {}

  ngOnInit(): void {
    this.loadBeneficiaries();
  }

  loadBeneficiaries(): void {
    // Load non-contributory beneficiaries
    this.benefitService.getBeneficiariesByScheme('non-contributory').subscribe({
      next: (beneficiaries) => {
        this.nonContributoryBeneficiaries = beneficiaries.map((b: any, index: number) => ({
          position: index + 1,
          type: b.type,
          niss: b.niss,
          electoralId: b.electoralId,
          noBi: b.noBi,
          fullName: b.fullName,
          municipality: b.municipality,
          post: b.post,
          suco: b.suco,
          subVillage: b.subVillage,
          dob: b.dob,
          age: b.age,
          sex: b.sex,
          bankName: b.bankName,
          bankAccount: b.bankAccount,
          iban: b.iban,
          amount: b.amount,
          phase: b.phase,
        }));
      },
      error: (error) => {
        console.error('Error loading non-contributory beneficiaries:', error);
      },
    });

    // Load contributory beneficiaries
    this.benefitService.getBeneficiariesByScheme('contributory').subscribe({
      next: (beneficiaries) => {
        this.contributoryBeneficiaries = beneficiaries.map((b: any, index: number) => ({
          position: index + 1,
          type: b.type,
          niss: b.niss,
          electoralId: b.electoralId,
          noBi: b.noBi,
          fullName: b.fullName,
          municipality: b.municipality,
          post: b.post,
          suco: b.suco,
          subVillage: b.subVillage,
          dob: b.dob,
          age: b.age,
          sex: b.sex,
          bankName: b.bankName,
          bankAccount: b.bankAccount,
          iban: b.iban,
          amount: b.amount,
          phase: b.phase,
        }));
      },
      error: (error) => {
        console.error('Error loading contributory beneficiaries:', error);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/benefit/contribution-scheme']);
  }

  generatePaymentList(): void {
    alert('Payment list generated successfully.');
  }
}
