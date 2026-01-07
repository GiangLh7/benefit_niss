import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BenefitService } from '../services/benefit.service';
import { BenefitRequestDetails } from '../interfaces/benefit-request.interface';

type RequestStatus = 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
type UserLevel = 1 | 2 | 3;

interface PendingRequest {
  id: string;
  niss: string;
  fullName: string;
  dateOfBirth: string;
  schemeType: string;
  benefitType: string;
  submittedDate: string;
  status: RequestStatus;
  comment?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  selected?: boolean;
  expanded?: boolean; // For master-detail row expansion
  details?: BenefitRequestDetails; // Full request details
}

@Component({
  standalone: false,
  selector: 'app-pending-requests',
  templateUrl: './pending-requests.html',
  styleUrls: ['./pending-requests.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class PendingRequestsComponent implements OnInit {
  displayedColumns: string[] = ['expand', 'select', 'niss', 'fullName', 'dateOfBirth', 'schemeType', 'benefitType', 'submittedDate', 'status', 'actions'];
  
  pendingRequests: PendingRequest[] = [];
  filteredRequests: PendingRequest[] = [];
  selectedRequests: Set<string> = new Set();
  isProcessing = false;
  expandedRequest: PendingRequest | null = null;
  
  // User level simulation (in production, get from auth service)
  currentUserLevel: UserLevel = 2; // Change this to test different user levels
  currentUserName: string = 'Admin Level 2'; // Simulation
  
  // Filter
  selectedStatusFilter: RequestStatus | 'all' = 'all';
  statusOptions: Array<{value: RequestStatus | 'all', label: string}> = [
    { value: 'all', label: 'All Requests' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' }
  ];

  constructor(
    private router: Router,
    private benefitService: BenefitService
  ) {}

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  loadPendingRequests(): void {
    this.isProcessing = true;
    this.benefitService.getPendingRequests().subscribe({
      next: (requests) => {
        this.pendingRequests = requests.map((req: any) => ({
          id: req.id,
          niss: req.niss,
          fullName: req.fullName,
          dateOfBirth: req.dateOfBirth,
          schemeType: req.schemeType,
          benefitType: req.benefitType,
          submittedDate: req.submittedDate,
          status: req.status,
          comment: req.comment,
          reviewedBy: req.reviewedBy,
          reviewedDate: req.reviewedDate,
        }));
        this.applyStatusFilter();
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Error loading pending requests:', error);
        this.isProcessing = false;
        alert('Error loading pending requests. Please try again.');
      },
    });
  }
  
  applyStatusFilter(): void {
    if (this.selectedStatusFilter === 'all') {
      this.filteredRequests = [...this.pendingRequests];
    } else {
      this.filteredRequests = this.pendingRequests.filter(r => r.status === this.selectedStatusFilter);
    }
  }
  
  onStatusFilterChange(): void {
    this.applyStatusFilter();
    this.selectedRequests.clear();
  }
  
  getStatusLabel(status: RequestStatus): string {
    const statusMap: Record<RequestStatus, string> = {
      'submitted': 'Submitted',
      'pending_approval': 'Pending Approval',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'expired': 'Expired'
    };
    return statusMap[status];
  }
  
  getStatusClass(status: RequestStatus): string {
    const classMap: Record<RequestStatus, string> = {
      'submitted': 'status-submitted',
      'pending_approval': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'expired': 'status-expired'
    };
    return classMap[status];
  }
  
  // Permission checks
  canReview(request: PendingRequest): boolean {
    // Level 1 cannot review
    if (this.currentUserLevel === 1) return false;
    
    // Level 2 can review submitted requests
    if (this.currentUserLevel === 2) {
      return request.status === 'submitted';
    }
    
    // Level 3 can review pending_approval requests
    if (this.currentUserLevel === 3) {
      return request.status === 'pending_approval';
    }
    
    return false;
  }
  
  canSendForApproval(request: PendingRequest): boolean {
    // Only Level 2 can send for approval
    return this.currentUserLevel === 2 && request.status === 'submitted';
  }
  
  canApprove(request: PendingRequest): boolean {
    // Only Level 3 can approve
    return this.currentUserLevel === 3 && request.status === 'pending_approval';
  }
  
  canReject(request: PendingRequest): boolean {
    // Level 2 can reject submitted
    if (this.currentUserLevel === 2 && request.status === 'submitted') return true;
    
    // Level 3 can reject pending_approval
    if (this.currentUserLevel === 3 && request.status === 'pending_approval') return true;
    
    return false;
  }
  
  hasAnyActionPermission(request: PendingRequest): boolean {
    return this.canSendForApproval(request) || 
           this.canApprove(request) || 
           this.canReject(request);
  }

  isAllSelected(): boolean {
    return this.pendingRequests.length > 0 && 
           this.selectedRequests.size === this.pendingRequests.length;
  }

  isSomeSelected(): boolean {
    return this.selectedRequests.size > 0 && !this.isAllSelected();
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selectedRequests.clear();
    } else {
      this.pendingRequests.forEach(request => {
        this.selectedRequests.add(request.id);
      });
    }
  }

  toggleSelection(requestId: string): void {
    if (this.selectedRequests.has(requestId)) {
      this.selectedRequests.delete(requestId);
    } else {
      this.selectedRequests.add(requestId);
    }
  }

  isSelected(requestId: string): boolean {
    return this.selectedRequests.has(requestId);
  }

  sendForApproval(requestId: string): void {
    if (this.isProcessing || !this.canSendForApproval(this.pendingRequests.find(r => r.id === requestId)!)) {
      return;
    }

    const request = this.pendingRequests.find(r => r.id === requestId);
    if (!request) return;

    const comment = prompt(`Add a comment for sending ${request.fullName}'s request for approval (optional):`);
    
    this.isProcessing = true;
    
    // TODO: Replace with actual API call
    // this.benefitService.sendForApproval(requestId, comment).subscribe(...)

    setTimeout(() => {
      request.status = 'pending_approval';
      request.comment = comment || 'Sent for Level 3 approval';
      request.reviewedBy = this.currentUserName;
      request.reviewedDate = new Date().toISOString().split('T')[0];
      this.selectedRequests.delete(requestId);
      this.isProcessing = false;
      alert('Request sent for approval successfully!');
      this.applyStatusFilter();
    }, 500);
  }

  approveRequest(requestId: string): void {
    if (this.isProcessing || !this.canApprove(this.pendingRequests.find(r => r.id === requestId)!)) {
      return;
    }

    const request = this.pendingRequests.find(r => r.id === requestId);
    if (!request) return;

    const comment = prompt(`Add approval comment for ${request.fullName}:`);
    if (!comment || comment.trim() === '') {
      alert('Approval comment is required.');
      return;
    }

    this.isProcessing = true;
    
    // TODO: Replace with actual API call
    // this.benefitService.approveRequest(requestId, comment).subscribe(...)

    setTimeout(() => {
      request.status = 'approved';
      request.comment = comment;
      request.reviewedBy = this.currentUserName;
      request.reviewedDate = new Date().toISOString().split('T')[0];
      this.selectedRequests.delete(requestId);
      this.isProcessing = false;
      alert('Request approved successfully!');
      this.applyStatusFilter();
    }, 500);
  }

  rejectRequest(requestId: string): void {
    if (this.isProcessing || !this.canReject(this.pendingRequests.find(r => r.id === requestId)!)) {
      return;
    }

    const request = this.pendingRequests.find(r => r.id === requestId);
    if (!request) return;

    const reason = prompt(`Enter rejection reason for ${request.fullName}:`);
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required.');
      return;
    }

    this.isProcessing = true;

    // TODO: Replace with actual API call
    // this.benefitService.rejectRequest(requestId, reason).subscribe(...)

    setTimeout(() => {
      request.status = 'rejected';
      request.comment = reason;
      request.reviewedBy = this.currentUserName;
      request.reviewedDate = new Date().toISOString().split('T')[0];
      this.selectedRequests.delete(requestId);
      this.isProcessing = false;
      alert('Request rejected successfully!');
      this.applyStatusFilter();
    }, 500);
  }

  sendSelectedForApproval(): void {
    if (this.selectedRequests.size === 0 || this.isProcessing) {
      return;
    }

    const comment = prompt(`Add a comment for sending ${this.selectedRequests.size} request(s) for approval (optional):`);

    this.isProcessing = true;

    // TODO: Replace with actual API call
    // this.benefitService.sendMultipleForApproval(Array.from(this.selectedRequests), comment).subscribe(...)

    setTimeout(() => {
      const selectedIds = Array.from(this.selectedRequests);
      selectedIds.forEach(id => {
        const request = this.pendingRequests.find(r => r.id === id);
        if (request && this.canSendForApproval(request)) {
          request.status = 'pending_approval';
          request.comment = comment || 'Sent for Level 3 approval';
          request.reviewedBy = this.currentUserName;
          request.reviewedDate = new Date().toISOString().split('T')[0];
        }
      });
      this.selectedRequests.clear();
      this.isProcessing = false;
      alert(`${selectedIds.length} request(s) sent for approval successfully!`);
      this.applyStatusFilter();
    }, 1000);
  }

  approveSelected(): void {
    if (this.selectedRequests.size === 0 || this.isProcessing) {
      return;
    }

    const comment = prompt(`Add approval comment for ${this.selectedRequests.size} request(s):`);
    if (!comment || comment.trim() === '') {
      alert('Approval comment is required.');
      return;
    }

    const confirmMessage = `Are you sure you want to approve ${this.selectedRequests.size} request(s)?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    this.isProcessing = true;

    // TODO: Replace with actual API call
    // this.benefitService.approveMultipleRequests(Array.from(this.selectedRequests), comment).subscribe(...)

    setTimeout(() => {
      const selectedIds = Array.from(this.selectedRequests);
      selectedIds.forEach(id => {
        const request = this.pendingRequests.find(r => r.id === id);
        if (request && this.canApprove(request)) {
          request.status = 'approved';
          request.comment = comment;
          request.reviewedBy = this.currentUserName;
          request.reviewedDate = new Date().toISOString().split('T')[0];
        }
      });
      this.selectedRequests.clear();
      this.isProcessing = false;
      alert(`${selectedIds.length} request(s) approved successfully!`);
      this.applyStatusFilter();
    }, 1000);
  }

  rejectSelected(): void {
    if (this.selectedRequests.size === 0 || this.isProcessing) {
      return;
    }

    const reason = prompt(`Enter rejection reason for ${this.selectedRequests.size} request(s):`);
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required.');
      return;
    }

    const confirmMessage = `Are you sure you want to reject ${this.selectedRequests.size} request(s)?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    this.isProcessing = true;

    // TODO: Replace with actual API call
    // this.benefitService.rejectMultipleRequests(Array.from(this.selectedRequests), reason).subscribe(...)

    setTimeout(() => {
      const selectedIds = Array.from(this.selectedRequests);
      selectedIds.forEach(id => {
        const request = this.pendingRequests.find(r => r.id === id);
        if (request && this.canReject(request)) {
          request.status = 'rejected';
          request.comment = reason;
          request.reviewedBy = this.currentUserName;
          request.reviewedDate = new Date().toISOString().split('T')[0];
        }
      });
      this.selectedRequests.clear();
      this.isProcessing = false;
      alert(`${selectedIds.length} request(s) rejected successfully!`);
      this.applyStatusFilter();
    }, 1000);
  }
  
  /**
   * Toggle row expansion (master-detail)
   */
  toggleRow(request: PendingRequest): void {
    // If clicking the already expanded row, collapse it
    if (this.expandedRequest === request) {
      this.expandedRequest = null;
      request.expanded = false;
      return;
    }

    // Collapse previously expanded row
    if (this.expandedRequest) {
      this.expandedRequest.expanded = false;
    }

    // Expand clicked row
    request.expanded = true;
    this.expandedRequest = request;

    // Load details if not already loaded
    if (!request.details) {
      this.loadRequestDetails(request);
    }
  }

  /**
   * Load full request details
   */
  loadRequestDetails(request: PendingRequest): void {
    this.benefitService.getRequestDetails(request.id).subscribe({
      next: (details) => {
        request.details = details;
      },
      error: (error) => {
        console.error('Error loading request details:', error);
        alert('Error loading request details.');
      },
    });
  }

  /**
   * View request details (legacy method - now uses row expansion)
   */
  viewRequestDetails(request: PendingRequest): void {
    this.toggleRow(request);
  }

  /**
   * Get label for retirement option
   */
  getRetirementOptionLabel(option: string): string {
    const labels: Record<string, string> = {
      NORMAL: 'Normal Retirement',
      HAZARDOUS_INDUSTRY: 'Early Retirement (Hazardous Industry)',
      LABOR_CAPACITY_REDUCTION: 'Early Retirement (Labor Capacity Reduction)',
    };
    return labels[option] || option;
  }

  /**
   * Get label for disability payment type
   */
  getDisabilityPaymentLabel(type: string): string {
    const labels: Record<string, string> = {
      ONE_TIME: 'One-time Payment',
      MONTHLY: 'Monthly Pension',
    };
    return labels[type] || type;
  }

  /**
   * Get dependent relationship label
   */
  getDependentRelationshipLabel(relationship: string): string {
    const labels: Record<string, string> = {
      SPOUSE: 'Vợ/Chồng',
      CHILD: 'Con cái',
      PARENT: 'Cha/Mẹ',
    };
    return labels[relationship] || relationship;
  }

  /**
   * Download document
   */
  downloadDocument(doc: any): void {
    // TODO: Implement document download
    alert(`Downloading document: ${doc.fileName}`);
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  goBack(): void {
    this.router.navigate(['/benefit/contribution-scheme']);
  }

  /**
   * Predicate function to determine if expanded detail row should be shown
   */
  isExpanded = (index: number, row: PendingRequest): boolean => {
    return row.expanded === true;
  };
}
