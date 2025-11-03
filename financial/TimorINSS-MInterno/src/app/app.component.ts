import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from './services/token-storage.service';
import '@angular/common/locales/global/pt';
import { MenuItem } from './models/utils';
import { CreateMenuPermissions } from './utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public ssIcon = environment.ssIcon;
  public isLoggedIn = true;
  public isLoginRoute = false;
  public selectLang: string = "";
  public TransLang: string[] = [];
  public username?: string;
  public profiles?: string;
  public menuItems: MenuItem[] = [];

  constructor(
    public translate: TranslateService,
    private tokenStorageService: TokenStorageService,
    public errorDialog: MatDialog,
    private router: Router
  ) {
    translate.setDefaultLang('PT');
    translate.use('PT');
    translate.addLangs(['EN', 'PT', 'TET']);
    translate.onLangChange.subscribe(() => {
      document.title = this.translate.instant('general.inssCore');
    });
  }

  public setTransLanguage() {
    this.translate.use(this.selectLang);
    localStorage.setItem('selectedLanguage', this.selectLang);
  }
  public getTransLanguage() {
    this.TransLang = [...this.translate.getLangs()];
  }

  public ngOnInit(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    this.isLoginRoute = window.location.pathname == '/login';

    this.getTransLanguage();
    
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && this.translate.getLangs().includes(savedLanguage)) {
      // Sử dụng ngôn ngữ đã lưu
      this.selectLang = savedLanguage;
      this.translate.use(savedLanguage);
    } else {
      // Nếu không có hoặc không hợp lệ, sử dụng ngôn ngữ mặc định
      this.selectLang = this.translate.getDefaultLang();
    }
    
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.menuItems = CreateMenuPermissions(user);

      if (user != null) {
        this.username = user.username;
        this.profiles = user.perfil;
      }
    }
  }

  public logout(): void {
  // Lưu ngôn ngữ hiện tại trước khi đăng xuất
  const currentLanguage = this.selectLang;
  
  // Đăng xuất và xóa token
  this.tokenStorageService.signOut();
  
  // Đặt lại ngôn ngữ đã lưu (để đảm bảo nó không bị xóa trong quá trình signOut)
  localStorage.setItem('selectedLanguage', currentLanguage);
  
  // Làm mới trang
  window.location.reload();
}
}
