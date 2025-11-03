import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from '../services/token-storage.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
  })

export class HomeComponent implements OnInit {

    public iframeUrl?: SafeResourceUrl;
    public isLoggedIn = false;
    public ssIcon = environment.ssIcon;

    constructor(
      private tokenStorage: TokenStorageService,
      private router: Router,
      public translate: TranslateService,
      private spinner: NgxSpinnerService,
      private sanitizer: DomSanitizer
    ) { this.iframeUrl = environment.wordpressUrl.length > 0 ? this.sanitizer.bypassSecurityTrustResourceUrl(environment.wordpressUrl) : undefined; }

    ngOnInit(): void {
      if (this.tokenStorage.getToken()) {
        this.isLoggedIn = true;  
        }
        this.spinner.hide();
      }
}