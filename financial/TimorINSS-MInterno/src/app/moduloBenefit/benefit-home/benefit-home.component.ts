import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BenefitService } from '../services/benefit.service';

@Component({
  standalone: false,
  selector: 'app-benefit-home',
  templateUrl: './benefit-home.component.html',
  styleUrls: ['./benefit-home.component.css']
})
export class BenefitHomeComponent implements OnInit, OnDestroy {
  readonly loadedTabs = [true, false, false, false, false];
  
  searchControl = new FormControl('');
  selectedCitizen: any = null;
  isSearching = false;
  searchPlaceholder = 'Search by NISS or Name...';
  
  // Navigation state
  selectedMenu: string = 'citizen-record';
  benefitManagementExpanded: boolean = false;
  
  // Pending requests count
  pendingRequestsCount: number = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private benefitService: BenefitService
  ) { }

  ngOnInit(): void {
    console.log('Benefit Home Component initialized');
    
    // Load pending requests count
    this.loadPendingRequestsCount();
    
    // Listen to route changes to update selected menu
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      this.updateSelectedMenuFromUrl(event.url);
      // Reload pending count when navigating back
      if (event.url.includes('contribution-scheme')) {
        this.loadPendingRequestsCount();
      }
    });
    
    // Set initial menu based on current URL
    this.updateSelectedMenuFromUrl(this.router.url);
    
    // Listen to query parameter changes (reactive search)
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const searchQuery = params['search'];
      if (searchQuery && this.isOnCitizenRecordPage()) {
        // Update search control without triggering another search
        this.searchControl.setValue(searchQuery, { emitEvent: false });
        // Perform search based on query parameter
        this.performSearch(searchQuery);
      } else if (!searchQuery && this.isOnCitizenRecordPage()) {
        // Clear search if no query parameter on citizen record page
        this.clearSearchData();
      }
    });
  }

  loadPendingRequestsCount(): void {
    // Get all requests and count only 'submitted' status (Level 2 needs to review)
    this.benefitService.getPendingRequests().subscribe({
      next: (requests) => {
        this.pendingRequestsCount = requests.filter(r => r.status === 'submitted').length;
      },
      error: (error) => {
        console.error('Error loading pending requests count:', error);
        this.pendingRequestsCount = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateSelectedMenuFromUrl(url: string): void {
    if (url.includes('citizen-record')) {
      this.selectedMenu = 'citizen-record';
      this.benefitManagementExpanded = false;
    } else if (url.includes('non-contribution')) {
      this.selectedMenu = 'non-contribution';
      this.benefitManagementExpanded = true;
    } else if (url.includes('contribution-scheme')) {
      this.selectedMenu = 'contribution-scheme';
      this.benefitManagementExpanded = true;
    }
  }

  onTabChange(index: number): void {
    // Mark tab as loaded when user switches to it
    this.loadedTabs[index] = true;
  }

  performSearch(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return;
    }

    this.isSearching = true;
    
    this.benefitService.searchCitizen(searchTerm.trim()).subscribe({
      next: (citizen) => {
        if (citizen && citizen.found) {
          this.selectedCitizen = citizen;
          
          // Mark all tabs as loaded once a citizen is found
          for (let i = 0; i < this.loadedTabs.length; i++) {
            (this.loadedTabs as boolean[])[i] = true;
          }
        } else {
          this.selectedCitizen = null;
          alert('Citizen not found!');
        }
        
        this.isSearching = false;
        console.log('Search completed for:', searchTerm);
      },
      error: (error) => {
        console.error('Error searching citizen:', error);
        this.selectedCitizen = null;
        this.isSearching = false;
        alert('Error searching citizen. Please try again.');
      }
    });
  }

  onSearchSubmit(): void {
    const searchTerm = this.searchControl.value;
    if (!searchTerm || searchTerm.trim().length === 0) {
      return;
    }

    // Navigate with query parameter to trigger reactive search
    this.router.navigate(['/benefit/citizen-record'], {
      queryParams: { search: searchTerm.trim() }
    });
  }

  clearSearchData(): void {
    this.selectedCitizen = null;
    this.searchControl.setValue('', { emitEvent: false });
    
    // Reset loaded tabs
    for (let i = 0; i < this.loadedTabs.length; i++) {
      (this.loadedTabs as boolean[])[i] = false;
    }
    (this.loadedTabs as boolean[])[0] = true;
  }

  clearSearch(): void {
    this.clearSearchData();
    
    // Remove query parameter from URL
    this.router.navigate(['/benefit/citizen-record'], {
      queryParams: {}
    });
  }

  hasCitizenSelected(): boolean {
    return this.selectedCitizen !== null;
  }

  isMenuActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  isOnCitizenRecordPage(): boolean {
    return this.router.url.includes('citizen-record');
  }

  toggleBenefitManagement(): void {
    this.benefitManagementExpanded = !this.benefitManagementExpanded;
  }

  navigateToPendingRequests(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate(['/benefit/pending-requests']);
  }
}
