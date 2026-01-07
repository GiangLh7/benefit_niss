/**
 * Custom In-Memory API Service
 * Simple HTTP interceptor that provides mock data without external dependencies
 */

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BenefitRequestDetails } from '../interfaces/benefit-request.interface';
import {
  MOCK_CITIZENS,
  MockCitizenData,
} from '../constants/mock-data.constants';

// Unified data structures
export interface UnifiedBeneficiary {
  id: string;
  position: number;
  type: string;
  niss: string;
  electoralId?: string;
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
  schemeType: 'contributory' | 'non-contributory';
}

export interface UnifiedBenefitRequest {
  id: string;
  niss: string;
  fullName: string;
  dateOfBirth: string;
  schemeType: 'Contributory' | 'Non-Contributory';
  benefitType: string;
  submittedDate: string;
  status:
    | 'submitted'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'expired';
  comment?: string;
  reviewedBy?: string;
  reviewedDate?: string;
}

export interface UnifiedPersonalData {
  niss: string;
  name: string;
  dateOfBirth: string;
  address: string;
  maritalStatus: string;
  dependents: string;
}

@Injectable()
export class CustomInMemoryApiService implements HttpInterceptor {
  private beneficiaries: UnifiedBeneficiary[] = [];
  private benefitRequests: UnifiedBenefitRequest[] = [];
  private personalData: UnifiedPersonalData[] = [];
  private benefitRequestDetails: BenefitRequestDetails[] = [];
  private contributionHistory: any[] = [];
  private professionalSituations: any[] = [];
  private contributorySituations: any[] = [];
  private contributoryCareers: any[] = [];
  private grantedBenefits: any[] = [];

  constructor() {
    this.initializeData();
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Only intercept specific benefit module API calls
    const urlToCheck = req.url;

    // List of benefit-related endpoint patterns to intercept
    const benefitEndpointPatterns = [
      'api/beneficiaries',
      'api/benefitRequests',
      'api/benefitRequestDetails',
      'api/personalData',
      'api/contributionHistory',
      'api/citizens/search',
      'api/professionalSituation',
      'api/contributorySituation',
      'api/contributoryCareer',
      'api/grantedBenefits',
    ];

    const method = req.method;

    // Also intercept POST/PUT/DELETE to benefitRequests endpoints
    const isBenefitPostRequest =
      urlToCheck.includes('api/benefitRequests') &&
      (method === 'POST' || method === 'PUT' || method === 'DELETE');

    // Check if this is a benefit-related request (including query params)
    // Match regardless of leading slash or protocol
    const isBenefitRequest = benefitEndpointPatterns.some((pattern) => {
      // Remove leading slash and protocol if present, then check
      const normalized = urlToCheck
        .replace(/^https?:\/\/[^\/]+/, '')
        .replace(/^\//, '');
      return normalized.startsWith(pattern);
    });

    // If not a benefit request, pass through to real API
    if (!isBenefitRequest && !isBenefitPostRequest) {
      return next.handle(req);
    }

    // Extract the path after api/ (remove protocol, domain, and /api/ prefix)
    let url = urlToCheck
      .replace(/^https?:\/\/[^\/]+/, '') // Remove protocol and domain
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(/^api\//, ''); // Remove api/ prefix

    // Handle GET requests
    if (method === 'GET') {
      return this.handleGet(url, req).pipe(delay(300));
    }

    // Handle POST requests
    if (method === 'POST') {
      return this.handlePost(url, req).pipe(delay(300));
    }

    // Handle PUT requests
    if (method === 'PUT') {
      return this.handlePut(url, req).pipe(delay(300));
    }

    // Handle DELETE requests
    if (method === 'DELETE') {
      return this.handleDelete(url, req).pipe(delay(300));
    }

    // Pass through other requests
    return next.handle(req);
  }

  private handleGet(url: string, req: HttpRequest<any>): Observable<any> {
    // Parse query parameters
    const urlParts = url.split('?');
    const path = urlParts[0];
    const queryParams = this.parseQueryParams(urlParts[1] || '');

    // Beneficiaries
    if (path === 'beneficiaries') {
      let result = [...this.beneficiaries];
      if (queryParams['schemeType']) {
        result = result.filter(
          (b) => b.schemeType === queryParams['schemeType']
        );
      }
      return of(new HttpResponse({ status: 200, body: result }));
    }

    // Benefit Requests
    if (path === 'benefitRequests') {
      return of(
        new HttpResponse({ status: 200, body: [...this.benefitRequests] })
      );
    }

    // Benefit Request Details
    if (path.startsWith('benefitRequestDetails/')) {
      const id = path.split('/')[1];
      const details = this.benefitRequestDetails.find((d) => d.id === id);
      if (details) {
        return of(new HttpResponse({ status: 200, body: details }));
      } else {
        // Return 404 if not found
        return of(
          new HttpResponse({
            status: 404,
            body: { error: 'Request details not found' },
          })
        );
      }
    }

    // Personal Data
    if (path === 'personalData') {
      if (queryParams['niss']) {
        const data = this.personalData.find(
          (p) => p.niss === queryParams['niss']
        );
        return of(new HttpResponse({ status: 200, body: data || null }));
      }
      return of(
        new HttpResponse({ status: 200, body: [...this.personalData] })
      );
    }

    // Contribution History
    if (path === 'contributionHistory') {
      if (queryParams['niss']) {
        const data = this.contributionHistory.find(
          (c) => c.niss === queryParams['niss']
        );
        return of(new HttpResponse({ status: 200, body: data || null }));
      }
      return of(
        new HttpResponse({ status: 200, body: [...this.contributionHistory] })
      );
    }

    // Citizen Search
    if (path === 'citizens/search') {
      const searchQuery = queryParams['q'] || '';
      if (!searchQuery) {
        return of(new HttpResponse({ status: 200, body: null }));
      }

      // Search in personal data by NISS or name (case-insensitive)
      const normalizedQuery = searchQuery.toLowerCase().trim();
      const foundCitizen = this.personalData.find((p) => {
        const nissMatch = p.niss.toLowerCase().includes(normalizedQuery);
        const nameMatch = p.name.toLowerCase().includes(normalizedQuery);
        return nissMatch || nameMatch;
      });

      if (foundCitizen) {
        // Return citizen data in the format expected by the component
        return of(
          new HttpResponse({
            status: 200,
            body: {
              niss: foundCitizen.niss,
              name: foundCitizen.name,
              dateOfBirth: foundCitizen.dateOfBirth,
              found: true,
            },
          })
        );
      }

      // Not found
      return of(new HttpResponse({ status: 200, body: null }));
    }

    // Professional Situation
    if (path === 'professionalSituation') {
      if (queryParams['niss']) {
        const data = this.professionalSituations.find(
          (p) => p.niss === queryParams['niss']
        );
        return of(new HttpResponse({ status: 200, body: data || null }));
      }
      return of(
        new HttpResponse({
          status: 200,
          body: [...this.professionalSituations],
        })
      );
    }

    // Contributory Situation
    if (path === 'contributorySituation') {
      if (queryParams['niss']) {
        const data = this.contributorySituations.find(
          (c) => c.niss === queryParams['niss']
        );
        return of(new HttpResponse({ status: 200, body: data || null }));
      }
      return of(
        new HttpResponse({
          status: 200,
          body: [...this.contributorySituations],
        })
      );
    }

    // Contributory Career
    if (path === 'contributoryCareer') {
      if (queryParams['niss']) {
        const data = this.contributoryCareers.find(
          (c) => c.niss === queryParams['niss']
        );
        return of(new HttpResponse({ status: 200, body: data || null }));
      }
      return of(
        new HttpResponse({ status: 200, body: [...this.contributoryCareers] })
      );
    }

    // Granted Benefits
    if (path === 'grantedBenefits') {
      if (queryParams['niss']) {
        const data = this.grantedBenefits.filter(
          (g) => g.niss === queryParams['niss']
        );
        return of(new HttpResponse({ status: 200, body: data || [] }));
      }
      return of(
        new HttpResponse({ status: 200, body: [...this.grantedBenefits] })
      );
    }

    return of(new HttpResponse({ status: 404, body: { error: 'Not found' } }));
  }

  private handlePost(url: string, req: HttpRequest<any>): Observable<any> {
    const body = req.body;

    // Submit benefit request - add to benefitRequests
    if (url === 'benefitRequests' || url.startsWith('benefitRequests/')) {
      if (body && body.citizenNISS) {
        // Check if NISS is already in beneficiaries list
        const niss = body.citizenNISS.trim();
        const normalizedNiss = niss.toUpperCase().trim();
        const isAlreadyBeneficiary = this.beneficiaries.some((b) => {
          const beneficiaryNiss = (b.niss || '').toUpperCase().trim();
          return beneficiaryNiss === normalizedNiss;
        });

        if (isAlreadyBeneficiary) {
          console.log('Submit blocked: NISS already in beneficiaries:', normalizedNiss);
          return of(
            new HttpResponse({
              status: 400,
              body: {
                success: false,
                error: 'This citizen is already assigned to a beneficiary scheme.',
              },
            })
          );
        }
        
        console.log('Submit allowed: NISS not in beneficiaries:', normalizedNiss);

        // Create new benefit request from submitted data
        const newRequest: UnifiedBenefitRequest = {
          id: String(Date.now()), // Generate unique ID
          niss: niss,
          fullName: body.citizenName || '',
          dateOfBirth: body.citizenDateOfBirth || '',
          schemeType:
            body.schemeType === 'contributory'
              ? 'Contributory'
              : 'Non-Contributory',
          benefitType: this.mapBenefitType(body.benefitType),
          submittedDate: new Date().toISOString().split('T')[0],
          status: 'submitted',
        };

        this.benefitRequests.push(newRequest);

        // Also create benefit request details
        const newDetails: BenefitRequestDetails = {
          id: newRequest.id,
          citizenNISS: body.citizenNISS,
          citizenName: body.citizenName || '',
          citizenDateOfBirth: body.citizenDateOfBirth || '',
          schemeType: body.schemeType || 'contributory',
          benefitType: body.benefitType || '',
          documents: body.documents || [],
          bankAccount: body.bankAccount,
          contributionMonths: body.contributionMonths,
          currentAge: body.currentAge,
          eligibilityMessage: body.eligibilityMessage,
          submittedDate: new Date(),
          requestStatus: 'submitted',
          ...body, // Include all other fields
        };

        this.benefitRequestDetails.push(newDetails);

        return of(
          new HttpResponse({
            status: 200,
            body: { success: true, requestId: newRequest.id },
          })
        );
      }
    }

    // Send for approval, approve, reject actions
    if (
      url.includes('/send-for-approval') ||
      url.includes('/approve') ||
      url.includes('/reject')
    ) {
      const urlParts = url.split('/');
      const requestId =
        urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
      const request = this.benefitRequests.find((r) => r.id === requestId);

      if (request) {
        if (url.includes('/send-for-approval')) {
          request.status = 'pending_approval';
          request.comment = body.comment;
          request.reviewedBy = 'Admin Level 2';
          request.reviewedDate = new Date().toISOString().split('T')[0];
        } else if (url.includes('/approve')) {
          request.status = 'approved';
          request.comment = body.comment;
          request.reviewedBy = 'Admin Level 3';
          request.reviewedDate = new Date().toISOString().split('T')[0];

          // When approved, add to beneficiaries if not already there
          this.addToBeneficiariesIfNeeded(request);
        } else if (url.includes('/reject')) {
          request.status = 'rejected';
          request.comment = body.reason || body.comment;
          request.reviewedBy = 'Admin';
          request.reviewedDate = new Date().toISOString().split('T')[0];
        }

        // Update details as well
        const details = this.benefitRequestDetails.find(
          (d) => d.id === requestId
        );
        if (details) {
          details.requestStatus = request.status as any;
        }
      }

      return of(new HttpResponse({ status: 200, body: { success: true } }));
    }

    // Bulk operations
    if (url.includes('/bulk/')) {
      const requestIds = body.requestIds || [];
      const comment = body.comment || body.reason || '';

      requestIds.forEach((id: string) => {
        const request = this.benefitRequests.find((r) => r.id === id);
        if (request) {
          if (url.includes('/send-for-approval')) {
            request.status = 'pending_approval';
            request.comment = comment;
            request.reviewedBy = 'Admin Level 2';
            request.reviewedDate = new Date().toISOString().split('T')[0];
          } else if (url.includes('/approve')) {
            request.status = 'approved';
            request.comment = comment;
            request.reviewedBy = 'Admin Level 3';
            request.reviewedDate = new Date().toISOString().split('T')[0];
            this.addToBeneficiariesIfNeeded(request);
          } else if (url.includes('/reject')) {
            request.status = 'rejected';
            request.comment = comment;
            request.reviewedBy = 'Admin';
            request.reviewedDate = new Date().toISOString().split('T')[0];
          }

          const details = this.benefitRequestDetails.find((d) => d.id === id);
          if (details) {
            details.requestStatus = request.status as any;
          }
        }
      });

      return of(
        new HttpResponse({
          status: 200,
          body: { success: true, count: requestIds.length },
        })
      );
    }

    // Default: return success
    return of(new HttpResponse({ status: 200, body: { success: true } }));
  }

  private mapBenefitType(benefitType: string): string {
    const typeMap: { [key: string]: string } = {
      'old-age-pension': 'Old Age Pension',
      'disability-pension': 'Disability Pension',
      'survivor-pension': 'Survivor Pension',
      'old-age-social-pension': 'Old Age Social Pension',
    };
    return typeMap[benefitType] || benefitType;
  }

  private addToBeneficiariesIfNeeded(request: UnifiedBenefitRequest): void {
    // Check if already exists
    const exists = this.beneficiaries.some((b) => b.niss === request.niss);
    if (exists) {
      return;
    }

    // Get personal data to create beneficiary
    const personalData = this.personalData.find((p) => p.niss === request.niss);
    if (!personalData) {
      return;
    }

    // Create new beneficiary entry
    const newBeneficiary: UnifiedBeneficiary = {
      id: `b-${Date.now()}`,
      position: this.beneficiaries.length + 1,
      type: request.benefitType,
      niss: request.niss,
      noBi: `BI${Date.now().toString().slice(-4)}`,
      fullName: request.fullName,
      municipality: 'Unknown', // Would come from personal data in real app
      post: 'Unknown',
      suco: 'Unknown',
      subVillage: 'Unknown',
      dob: request.dateOfBirth,
      age: this.calculateAge(request.dateOfBirth),
      sex: 'Unknown', // Would come from personal data
      bankName: 'Unknown',
      bankAccount: 'Unknown',
      iban: 'TL380',
      amount: 0, // Would be calculated
      phase: 'Active',
      schemeType:
        request.schemeType === 'Contributory'
          ? 'contributory'
          : 'non-contributory',
    };

    this.beneficiaries.push(newBeneficiary);
  }

  private calculateAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  private handlePut(url: string, req: HttpRequest<any>): Observable<any> {
    // For now, just return success
    return of(new HttpResponse({ status: 200, body: { success: true } }));
  }

  private handleDelete(url: string, req: HttpRequest<any>): Observable<any> {
    // For now, just return success
    return of(new HttpResponse({ status: 200, body: { success: true } }));
  }

  private parseQueryParams(queryString: string): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    if (!queryString) return params;

    queryString.split('&').forEach((param) => {
      const equalIndex = param.indexOf('=');
      if (equalIndex > 0) {
        const key = param.substring(0, equalIndex);
        const value = param.substring(equalIndex + 1);
        if (key) {
          params[decodeURIComponent(key)] = value
            ? decodeURIComponent(value)
            : '';
        }
      }
    });
    return params;
  }

  private initializeData(): void {
    // Initialize beneficiaries
    this.beneficiaries = [
      // Non-Contributory Beneficiaries
      {
        id: 'nc-1',
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
        iban: 'TL380',
        amount: 300,
        phase: 'I',
        schemeType: 'non-contributory',
      },
      {
        id: 'nc-2',
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
        iban: 'TL380',
        amount: 200,
        phase: 'II',
        schemeType: 'non-contributory',
      },
      {
        id: 'nc-3',
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
        iban: 'TL380',
        amount: 250,
        phase: 'III',
        schemeType: 'non-contributory',
      },
      // Contributory Beneficiaries
      {
        id: 'c-1',
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
        iban: 'TL1100',
        amount: 450,
        phase: 'Active',
        schemeType: 'contributory',
      },
      {
        id: 'c-2',
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
        iban: 'TL2200',
        amount: 380,
        phase: 'Active',
        schemeType: 'contributory',
      },
      {
        id: 'c-3',
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
        iban: 'TL3300',
        amount: 420,
        phase: 'Pending Review',
        schemeType: 'contributory',
      },
      {
        id: 'c-4',
        position: 4,
        type: 'Old-Age Pension',
        niss: 'TL123456789',
        electoralId: 'EL123456',
        noBi: 'BI1234',
        fullName: 'Maria Fernanda dos Santos',
        municipality: 'Dili',
        post: 'Cristo Rei',
        suco: 'Bairro dos Grilos',
        subVillage: 'Rua de Timor Lorosae',
        dob: '15/08/1963',
        age: 61,
        sex: 'Female',
        bankName: 'Banco Nacional Ultramarino',
        bankAccount: '1234567890',
        iban: 'TL380',
        amount: 450,
        phase: 'Active',
        schemeType: 'contributory',
      },
      {
        id: 'nc-4',
        position: 4,
        type: 'Old Age Social Pension',
        niss: 'TL555666777',
        electoralId: 'EL555666',
        noBi: 'BI5556',
        fullName: 'Ana Maria Costa',
        municipality: 'Baucau',
        post: 'Baucau',
        suco: 'Rua dos Combatentes',
        subVillage: 'Rua dos Combatentes',
        dob: '10/12/1958',
        age: 66,
        sex: 'Female',
        bankName: 'ANZ Bank',
        bankAccount: '555666777',
        iban: 'TL380',
        amount: 60,
        phase: 'Active',
        schemeType: 'non-contributory',
      },
    ];

    // Initialize benefit requests
    this.benefitRequests = [
      {
        id: '1',
        niss: 'TL123456789',
        fullName: 'Maria Fernanda dos Santos',
        dateOfBirth: '15/08/1963',
        schemeType: 'Contributory',
        benefitType: 'Old Age Pension',
        submittedDate: '2025-01-15',
        status: 'submitted',
      },
      {
        id: '2',
        niss: 'TL987654321',
        fullName: 'João Carlos Silva',
        dateOfBirth: '20/05/1960',
        schemeType: 'Contributory',
        benefitType: 'Disability Pension',
        submittedDate: '2025-01-18',
        status: 'pending_approval',
        comment: 'Sent for approval by Level 2 Admin',
        reviewedBy: 'Admin Level 2',
        reviewedDate: '2025-01-19',
      },
      {
        id: '3',
        niss: 'TL555666777',
        fullName: 'Ana Maria Costa',
        dateOfBirth: '10/12/1958',
        schemeType: 'Non-Contributory',
        benefitType: 'Old Age Social Pension',
        submittedDate: '2025-01-20',
        status: 'approved',
        comment: 'Approved - All documents verified',
        reviewedBy: 'Admin Level 3',
        reviewedDate: '2025-01-21',
      },
      {
        id: '4',
        niss: 'TL111222333',
        fullName: 'Pedro Alves',
        dateOfBirth: '25/03/1965',
        schemeType: 'Contributory',
        benefitType: 'Survivor Pension',
        submittedDate: '2025-01-22',
        status: 'rejected',
        comment: 'Missing required documents',
        reviewedBy: 'Admin Level 2',
        reviewedDate: '2025-01-23',
      },
      {
        id: '5',
        niss: 'TL444555666',
        fullName: 'Teresa Silva',
        dateOfBirth: '12/04/1962',
        schemeType: 'Contributory',
        benefitType: 'Old Age Pension',
        submittedDate: '2024-12-01',
        status: 'expired',
        comment: 'Request expired after 30 days',
        reviewedDate: '2025-01-01',
      },
    ];

    // Initialize personal data
    this.personalData = [
      {
        niss: 'TL123456789',
        name: 'Maria Fernanda dos Santos',
        dateOfBirth: '15/08/1963',
        address:
          'Rua de Timor Lorosae, No. 123, Bairro dos Grilos, Dili, Timor-Leste',
        maritalStatus: 'Married',
        dependents: 'José dos Santos (Son, 12y), Ana dos Santos (Daughter, 8y)',
      },
      {
        niss: 'TL987654321',
        name: 'João Carlos Silva',
        dateOfBirth: '20/05/1960',
        address: 'Avenida de Portugal, No. 45, Dili, Timor-Leste',
        maritalStatus: 'Married',
        dependents: 'None',
      },
      {
        niss: 'TL555666777',
        name: 'Ana Maria Costa',
        dateOfBirth: '10/12/1958',
        address: 'Rua dos Combatentes, No. 78, Baucau, Timor-Leste',
        maritalStatus: 'Widowed',
        dependents: 'None',
      },
      {
        niss: 'TL111222333',
        name: 'Pedro Alves',
        dateOfBirth: '25/03/1965',
        address: 'Rua da Liberdade, No. 12, Manatuto, Timor-Leste',
        maritalStatus: 'Married',
        dependents: 'Ana Maria Alves (Spouse), Pedro Alves Junior (Son, 29y)',
      },
      {
        niss: 'TL444555666',
        name: 'Teresa Silva',
        dateOfBirth: '12/04/1962',
        address: 'Rua da Independência, No. 34, Dili, Timor-Leste',
        maritalStatus: 'Single',
        dependents: 'None',
      },
      {
        niss: 'TL123456',
        name: 'Maria Santos',
        dateOfBirth: '15/08/1963',
        address: 'Vera, Bidau, Dili, Timor-Leste',
        maritalStatus: 'Married',
        dependents: 'None',
      },
      {
        niss: 'TL789012',
        name: 'Joao Carlos',
        dateOfBirth: '18/08/1965',
        address: 'Bucoli, Wataboo, Baucau, Timor-Leste',
        maritalStatus: 'Single',
        dependents: 'None',
      },
      {
        niss: 'TL545678',
        name: 'Ana da Silva',
        dateOfBirth: '15/08/1963',
        address: 'Bucoli, Vatvou, Liquica, Timor-Leste',
        maritalStatus: 'Widowed',
        dependents: 'None',
      },
      {
        niss: 'TL112233',
        name: 'Jose Manuel',
        dateOfBirth: '01/01/1960',
        address: 'Fatuhada, Bairo Pite, Cristo Rei, Dili, Timor-Leste',
        maritalStatus: 'Married',
        dependents: 'None',
      },
      {
        niss: 'TL221144',
        name: 'Lucia Amaral',
        dateOfBirth: '12/04/1970',
        address: 'Hatugau, Catrai Kraic, Letefoho, Ermera, Timor-Leste',
        maritalStatus: 'Married',
        dependents: 'None',
      },
      {
        niss: 'TL889900',
        name: 'Pedro Gomes',
        dateOfBirth: '25/09/1958',
        address: 'Uma Boco, Laclo, Manatuto, Timor-Leste',
        maritalStatus: 'Married',
        dependents: 'None',
      },
    ];

    // Initialize benefit request details
    this.benefitRequestDetails = [
      {
        id: '1',
        citizenNISS: 'TL123456789',
        citizenName: 'Maria Fernanda dos Santos',
        citizenDateOfBirth: '15/08/1963',
        schemeType: 'contributory',
        benefitType: 'old-age-pension',
        retirementOption: 'NORMAL' as any,
        documents: [
          {
            type: 'Social Security Contribution Confirmation',
            fileName: 'confirmation.pdf',
            fileSize: 1024000,
            fileType: 'application/pdf',
            uploadedAt: new Date('2025-01-15'),
          },
        ],
        bankAccount: {
          bankName: 'Banco Nacional Ultramarino',
          accountNumber: '1234567890',
          accountHolderName: 'Maria Fernanda dos Santos',
        },
        contributionMonths: 308,
        currentAge: '58 years 5 months',
        eligibilityMessage: 'Eligible for old-age pension',
        submittedDate: new Date('2025-01-15'),
        requestStatus: 'submitted',
      },
      {
        id: '2',
        citizenNISS: 'TL987654321',
        citizenName: 'João Carlos Silva',
        citizenDateOfBirth: '20/05/1960',
        schemeType: 'contributory',
        benefitType: 'disability-pension',
        disabilityPaymentType: 'MONTHLY' as any,
        documents: [
          {
            type: 'Labor Capacity Reduction Assessment Report',
            fileName: 'disability_assessment.pdf',
            fileSize: 2048000,
            fileType: 'application/pdf',
            uploadedAt: new Date('2025-01-18'),
          },
          {
            type: 'Hospital Discharge Certificate',
            fileName: 'hospital_discharge.pdf',
            fileSize: 1536000,
            fileType: 'application/pdf',
            uploadedAt: new Date('2025-01-18'),
          },
        ],
        bankAccount: {
          bankName: 'Banco Mandiri',
          accountNumber: '9876543210',
          accountHolderName: 'João Carlos Silva',
        },
        contributionMonths: 200,
        currentAge: '64 years 8 months',
        eligibilityMessage: 'Eligible for disability pension',
        submittedDate: new Date('2025-01-18'),
        requestStatus: 'pending_approval',
      },
      {
        id: '4',
        citizenNISS: 'TL111222333',
        citizenName: 'Pedro Alves',
        citizenDateOfBirth: '25/03/1965',
        schemeType: 'contributory',
        benefitType: 'survivor-pension',
        funeralAllowance: 345,
        dependents: [
          {
            id: '1',
            relationship: 'SPOUSE' as any,
            fullName: 'Ana Maria Alves',
            dateOfBirth: '1967-05-10',
            identificationNumber: 'TL444555666',
            percentage: 60,
            adjustedPercentage: 60,
          },
          {
            id: '2',
            relationship: 'CHILD' as any,
            fullName: 'Pedro Alves Junior',
            dateOfBirth: '1995-08-15',
            identificationNumber: 'TL777888999',
            percentage: 20,
            adjustedPercentage: 20,
          },
        ],
        dependentBankAccounts: [
          {
            dependentId: '1',
            percentage: 60,
            bankName: 'Banco Nacional Ultramarino',
            accountNumber: '1111222233',
            accountHolderName: 'Ana Maria Alves',
          },
          {
            dependentId: '2',
            percentage: 20,
            bankName: 'Banco Mandiri',
            accountNumber: '4444555566',
            accountHolderName: 'Pedro Alves Junior',
          },
        ],
        documents: [
          {
            type: 'Death Certificate',
            fileName: 'death_certificate.pdf',
            fileSize: 512000,
            fileType: 'application/pdf',
            uploadedAt: new Date('2025-01-22'),
          },
        ],
        contributionMonths: 120,
        currentAge: '59 years 10 months',
        eligibilityMessage: 'Eligible for survivor pension',
        submittedDate: new Date('2025-01-22'),
        requestStatus: 'rejected',
      },
      {
        id: '3',
        citizenNISS: 'TL555666777',
        citizenName: 'Ana Maria Costa',
        citizenDateOfBirth: '10/12/1958',
        schemeType: 'non-contributory',
        benefitType: 'old-age-social-pension',
        nonContributoryBenefitType: 'elderly-assistance',
        nonContributoryBenefitLabel: 'Old Age Social Pension',
        nonContributoryBenefitAmount: 60,
        nonContributoryBenefitFrequency: 'monthly',
        documents: [
          {
            type: 'Identity Document',
            fileName: 'id_card.pdf',
            fileSize: 512000,
            fileType: 'application/pdf',
            uploadedAt: new Date('2025-01-20'),
          },
          {
            type: 'Age Verification Certificate',
            fileName: 'age_verification.pdf',
            fileSize: 256000,
            fileType: 'application/pdf',
            uploadedAt: new Date('2025-01-20'),
          },
        ],
        bankAccount: {
          bankName: 'ANZ Bank',
          accountNumber: '555666777',
          accountHolderName: 'Ana Maria Costa',
        },
        currentAge: '66 years 1 month',
        eligibilityMessage:
          'Eligible for non-contributory old-age social pension',
        submittedDate: new Date('2025-01-20'),
        requestStatus: 'approved',
      },
      {
        id: '5',
        citizenNISS: 'TL444555666',
        citizenName: 'Teresa Silva',
        citizenDateOfBirth: '12/04/1962',
        schemeType: 'contributory',
        benefitType: 'old-age-pension',
        retirementOption: 'NORMAL' as any,
        documents: [
          {
            type: 'Social Security Contribution Confirmation',
            fileName: 'contribution_confirmation.pdf',
            fileSize: 1024000,
            fileType: 'application/pdf',
            uploadedAt: new Date('2024-12-01'),
          },
        ],
        bankAccount: {
          bankName: 'BNU Timor',
          accountNumber: '444555666',
          accountHolderName: 'Teresa Silva',
        },
        contributionMonths: 150,
        currentAge: '62 years 9 months',
        eligibilityMessage: 'Eligible for old-age pension',
        submittedDate: new Date('2024-12-01'),
        requestStatus: 'expired',
      },
    ];

    // Initialize contribution history from MOCK_CITIZENS
    this.contributionHistory = Object.values(MOCK_CITIZENS).map(
      (citizen: MockCitizenData) => ({
        niss: citizen.niss,
        name: citizen.name,
        dateOfBirth: citizen.dateOfBirth,
        contributionHistory: citizen.contributionHistory,
        totalYears: citizen.totalYears,
        totalMonths: citizen.totalMonths,
        description: citizen.description,
        employmentSector: citizen.employmentSector,
        referenceRemuneration: citizen.referenceRemuneration,
        monthlySalary: citizen.monthlySalary,
        category: citizen.category,
      })
    );

    // Initialize Professional Situation data
    this.professionalSituations = [
      {
        niss: 'TL123456789',
        records: [
          {
            id: 1,
            employer: 'Government Office',
            position: 'Administrator',
            startDate: new Date('2020-01-15'),
            endDate: undefined,
            status: 'Active',
            contractType: 'Permanent',
            department: 'Finance',
          },
          {
            id: 2,
            employer: 'Private Company Ltd',
            position: 'Accountant',
            startDate: new Date('2018-06-01'),
            endDate: new Date('2019-12-31'),
            status: 'Inactive',
            contractType: 'Contract',
            department: 'Accounting',
          },
        ],
      },
    ];

    // Initialize Contributory Situation data
    this.contributorySituations = [
      {
        niss: 'TL123456789',
        summary: [
          {
            metric: 'Total Contribution Years',
            value: '15 years',
            details: 'Timor-Leste: 12 yrs + Portugal: 3 yrs',
          },
          {
            metric: 'Total Amount Contributed',
            value: '$28,500 USD',
            details: 'Avg. $1,900/yr',
          },
          {
            metric: 'Current Status',
            value: 'Active',
            details: 'Last contribution: May 2025',
            status: 'active',
          },
          {
            metric: 'Minimum Requirement Met?',
            value: 'Yes (15/5 yrs)',
            details: 'Eligible for Full Pension',
          },
          {
            metric: 'Foreign Contributions',
            value: '3 years (Verified)',
            details: 'Agreement: PT-TL 2018',
            status: 'verified',
          },
        ],
      },
    ];

    // Initialize Contributory Career data
    this.contributoryCareers = [
      {
        niss: 'TL123456789',
        records: [
          {
            period: '2024',
            employer: 'Government Office',
            salary: 1000,
            contributionRate: 11,
            contributionAmount: 110,
            monthsContributed: 10,
            status: 'Active',
          },
          {
            period: '2023',
            employer: 'Government Office',
            salary: 950,
            contributionRate: 11,
            contributionAmount: 104.5,
            monthsContributed: 12,
            status: 'Complete',
          },
          {
            period: '2022',
            employer: 'Private Company',
            salary: 900,
            contributionRate: 11,
            contributionAmount: 99,
            monthsContributed: 12,
            status: 'Complete',
          },
          {
            period: '2021',
            employer: 'Private Company',
            salary: 850,
            contributionRate: 11,
            contributionAmount: 93.5,
            monthsContributed: 11,
            status: 'Incomplete',
          },
        ],
      },
    ];

    // Initialize Granted Benefits data
    this.grantedBenefits = [
      {
        niss: 'TL123456789',
        benefits: [
          {
            id: 1,
            benefitType: 'Retirement Pension',
            startDate: new Date('2023-01-01'),
            endDate: undefined,
            monthlyAmount: 450,
            status: 'Active',
            grantDate: new Date('2022-12-15'),
            referenceNumber: 'BEN-2022-001',
            totalPaid: 9900,
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
            totalPaid: 5750,
          },
        ],
      },
    ];
  }
}
