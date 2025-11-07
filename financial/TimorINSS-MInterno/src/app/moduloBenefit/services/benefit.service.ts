import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Benefit, BenefitRequest, BenefitFilter } from '../models/benefit.model';

@Injectable({
  providedIn: 'root'
})
export class BenefitService {
  private apiUrl = `${environment.apiUrl}/benefits`;

  constructor(private http: HttpClient) { }

  /**
   * Get all benefits
   */
  getAllBenefits(): Observable<Benefit[]> {
    return this.http.get<Benefit[]>(this.apiUrl);
  }

  /**
   * Get benefit by ID
   */
  getBenefitById(id: number): Observable<Benefit> {
    return this.http.get<Benefit>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get benefits with filters
   */
  getBenefitsFiltered(filter: BenefitFilter): Observable<Benefit[]> {
    let params = new HttpParams();
    
    if (filter.type) {
      params = params.set('type', filter.type);
    }
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.beneficiaryId) {
      params = params.set('beneficiaryId', filter.beneficiaryId.toString());
    }
    if (filter.searchTerm) {
      params = params.set('search', filter.searchTerm);
    }
    if (filter.startDate) {
      params = params.set('startDate', filter.startDate.toISOString());
    }
    if (filter.endDate) {
      params = params.set('endDate', filter.endDate.toISOString());
    }

    return this.http.get<Benefit[]>(this.apiUrl, { params });
  }

  /**
   * Get benefits by beneficiary ID
   */
  getBenefitsByBeneficiaryId(beneficiaryId: number): Observable<Benefit[]> {
    return this.http.get<Benefit[]>(`${this.apiUrl}/beneficiary/${beneficiaryId}`);
  }

  /**
   * Create new benefit
   */
  createBenefit(benefit: BenefitRequest): Observable<Benefit> {
    return this.http.post<Benefit>(this.apiUrl, benefit);
  }

  /**
   * Update existing benefit
   */
  updateBenefit(id: number, benefit: Partial<BenefitRequest>): Observable<Benefit> {
    return this.http.put<Benefit>(`${this.apiUrl}/${id}`, benefit);
  }

  /**
   * Delete benefit
   */
  deleteBenefit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Approve benefit
   */
  approveBenefit(id: number): Observable<Benefit> {
    return this.http.patch<Benefit>(`${this.apiUrl}/${id}/approve`, {});
  }

  /**
   * Suspend benefit
   */
  suspendBenefit(id: number, reason?: string): Observable<Benefit> {
    return this.http.patch<Benefit>(`${this.apiUrl}/${id}/suspend`, { reason });
  }

  /**
   * Cancel benefit
   */
  cancelBenefit(id: number, reason?: string): Observable<Benefit> {
    return this.http.patch<Benefit>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  /**
   * Reactivate benefit
   */
  reactivateBenefit(id: number): Observable<Benefit> {
    return this.http.patch<Benefit>(`${this.apiUrl}/${id}/reactivate`, {});
  }
}

