import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Dependent } from '../../models/survivor-benefit.model';

@Component({
  standalone: false,
  selector: 'app-bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.css']
})
export class BankAccountComponent implements OnInit, OnDestroy, OnChanges {
  @Input() benefitType: string = '';
  @Input() dependents: Dependent[] = [];
  @Input() relationshipLabels: { [key: string]: string } = {};

  @Output() bankAccountChanged = new EventEmitter<any>();
  @Output() validationChanged = new EventEmitter<boolean>();

  // Single bank account form (for non-survivor benefits)
  bankAccountForm!: FormGroup;

  // Multiple bank accounts for dependents (for survivor's pension)
  dependentBankAccountForms = new FormArray<FormGroup>([]);

  // Available banks
  readonly availableBanks = [
    'BNCTL',
    'Mandiri',
    'ANZ',
    'BNU',
    'BRI'
  ];

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initializeForms();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-initialize forms if dependents change
    if (changes['dependents'] && !changes['dependents'].firstChange) {
      // Clear existing subscriptions
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
      // Clear existing forms
      this.dependentBankAccountForms.clear();
      // Re-initialize
      this.initializeForms();
    }
    // Re-initialize if benefitType changes
    if (changes['benefitType'] && !changes['benefitType'].firstChange) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
      this.dependentBankAccountForms.clear();
      if (this.bankAccountForm) {
        this.bankAccountForm.reset();
      }
      this.initializeForms();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Initialize forms based on benefit type
   */
  private initializeForms(): void {
    if (this.benefitType === 'survivor-pension') {
      // Create a form for each dependent
      this.dependents.forEach(dep => {
        const form = this.createBankAccountForm();
        this.dependentBankAccountForms.push(form);
        
        // Subscribe to value changes
        const sub = form.valueChanges.subscribe(() => {
          this.emitChanges();
        });
        this.subscriptions.push(sub);
      });
      // Emit initial validation state
      this.emitChanges();
    } else {
      // Single bank account form
      this.bankAccountForm = this.createBankAccountForm();
      
      // Subscribe to value changes
      const sub = this.bankAccountForm.valueChanges.subscribe(() => {
        this.emitChanges();
      });
      this.subscriptions.push(sub);
      // Emit initial validation state
      this.emitChanges();
    }
  }

  /**
   * Create a bank account form group
   */
  private createBankAccountForm(): FormGroup {
    return new FormGroup({
      bankName: new FormControl('', [Validators.required]),
      accountNumber: new FormControl('', [Validators.required]),
      accountHolderName: new FormControl('', [Validators.required])
    });
  }

  /**
   * Get dependent bank account form by index
   */
  getDependentBankAccountForm(dependentId: string): FormGroup {
    const index = this.dependents.findIndex(dep => dep.id === dependentId);
    return this.dependentBankAccountForms.at(index) as FormGroup;
  }

  /**
   * Check if all forms are valid
   */
  isValid(): boolean {
    if (this.benefitType === 'survivor-pension') {
      return this.dependentBankAccountForms.valid;
    } else {
      return this.bankAccountForm.valid;
    }
  }

  /**
   * Get form data
   */
  getFormData(): any {
    if (this.benefitType === 'survivor-pension') {
      return {
        type: 'multiple',
        accounts: this.dependents.map((dep, index) => ({
          dependentId: dep.id,
          dependentName: dep.fullName,
          ...this.dependentBankAccountForms.at(index).value
        }))
      };
    } else {
      return {
        type: 'single',
        account: this.bankAccountForm.value
      };
    }
  }

  /**
   * Emit changes to parent
   */
  private emitChanges(): void {
    this.bankAccountChanged.emit(this.getFormData());
    this.validationChanged.emit(this.isValid());
  }
}

