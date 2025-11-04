import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { DialogComponent } from "../../componentes/dialog/dialog.component";
import { LoginService } from "../../services/login.service";
import { TokenStorageService } from "../../services/token-storage.service";
import { blobZipSaveAs } from "../../utils";

@Component({
  standalone: false,
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.css']
})

export class LogsComponent implements OnInit {
    public isLoggedIn = false;
    public errors: string[] = [];

    constructor(
        private loginService: LoginService,
        private tokenStorage: TokenStorageService,
        public translate: TranslateService,
        private router: Router,
        public errorDialog: MatDialog,
    ) { }

    ngOnInit(): void {
        if (this.tokenStorage.getToken()) {
            this.isLoggedIn = true;
        }
        else
            this.router.navigate([''],);
    }

    showError(error: string[]) {
        error.map(x => this.errors.push(x));
        this.errorDialog.closeAll();
        const dialogRef = this.errorDialog.open(DialogComponent, {
            id: 'dialog',
            minHeight: '300px',
            width: '50%',
            height: '50%',
            data: { errors: this.errors }
        });


        dialogRef.afterClosed().subscribe((result) => {
            if (result)
                this.errors = [];
        });
    }

    public logDownload(): void {
        this.loginService.downloadLogs().subscribe((response: any) => {
            blobZipSaveAs(response.logString, 'logs');
        },
            err => {
                console.log(err);
                this.showError(['-1']);
            })
    }
}
