import { Component, OnInit, ViewChild, Input, AfterContentInit } from "@angular/core";
import { MatMenu } from "@angular/material/menu";
import { TranslateService } from "@ngx-translate/core";
import { MenuItem } from "../models/utils";

@Component({
  selector: "app-menu-panel",
  templateUrl: "./menu-panel.component.html",
  styleUrls: ["./menu-panel.component.css"]
})
export class MenuPanelComponent {
  @ViewChild("menu", {static: true}) menu: MatMenu = <MatMenu>{} ;
  @Input() items?: MenuItem[] = [];

  constructor(
    public translate: TranslateService,
  ) {}
}
