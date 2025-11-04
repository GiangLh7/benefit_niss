import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions, ChartType, TooltipItem, ChartData } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { DeclaracaoService } from '../../services/declaracao.service';
import { customCurrencyMaskConfig, formataCurrency, openErrorsDialog, populateChartColors } from '../../utils';
import { NacionalidadeResumoDeclaracao, ResumoDeclaracao, RegimesResumoDeclaracao, DeclaracaoListagem } from './../../response-models/declaracao-response';

export interface PopUpResumoDeclaracaoData {
  declaracoes: DeclaracaoListagem[];
}

@Component({
  standalone: false,
  selector: 'app-pop-up-resumo-declaracao',
  templateUrl: './pop-up-resumo-declaracao.component.html',
  styleUrls: ['./pop-up-resumo-declaracao.component.css']
})
export class PopUpResumoDeclaracaoComponent {
  public currencyOptions = customCurrencyMaskConfig;
  public errors: string[] = [];
  public resumo: ResumoDeclaracao = <ResumoDeclaracao>{};
  public response: boolean = false;

  //PieChart
  public pieChartPlugins = [];
  public pieChartType: ChartType = 'pie';
  public pieChartColors: any[] = [
    {
      backgroundColor: [],
      borderWidth: 0,
    }
  ];

  //Nacionalidade
  public nacionalidadeCurrency: boolean = false;
  public displayNacionalidades: NacionalidadeResumoDeclaracao[] = [];
  public displayedColumnsNacionalidade: string[] = ['cor','nacionalidade','renumeracoes','trabalhadores'];
  public numberNacionalidade = 0;
  public pieChartNacionalidadeLabels: string[] = [];
  public pieChartNacionalidadeData: number[] = [];

  public pieChartNacionalidadeOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            var label = '';
            if(context.label && context.parsed !== undefined)
              if(this.nacionalidadeCurrency)
                label = context.label + ': ' + formataCurrency(context.parsed) || '';
              else
                label = context.label + ': ' +  context.parsed?.toString() || '';

            return label;
          }
        }
      }
    }
  };

  //c
  public regimeChartType: number = 1;
  public displayRegimes: RegimesResumoDeclaracao[] = [];
  public displayedColumnsRegime: string[] = ['cor','regime','renumeracoes','taxaTrabalhador','taxaEntidade','quotizacoes','contribuicoes','total'];
  public numberRegime = 0;
  public pieChartRegimeLabels: string[] = [];
  public pieChartRegimeData: number[] = [];

  public pieChartRegimeOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            var label = '';
            if(context.label && context.parsed !== undefined)
              if(this.regimeChartType)
                label = context.label + ': ' + formataCurrency(context.parsed) || '';
              else
                label = context.label + ': ' +  context.parsed?.toString() || '';

            return label;
          }
        }
      }
    }
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: PopUpResumoDeclaracaoData,
              private spinner: NgxSpinnerService,
              public translate: TranslateService,
              public dialogErrorPopUp: MatDialog,
              private declaracaoService: DeclaracaoService)
  {

    this.showLoader();
    let requestResumo  = {
      declaracoes: this.data.declaracoes.map(x=>x.declaracao)
    };

    this.declaracaoService.getResumoDeclaracao(requestResumo)
    .subscribe( res => {
      this.resumo = res;
      this.response = true;
      this.initCharts();
    },
    err => {
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }


  public initCharts()
  {
    //nacionalide
    if(this.resumo.totalNacionalidades.total > 0)
      this.nacionalidadeCurrency = true;

    let newPieChartNacionalidadesData: number[] = [];
    this.resumo.nacionalidades.forEach(n =>
      {
        this.displayNacionalidades.push(n);
        this.pieChartNacionalidadeLabels.push(n.nacionalidade);

        if(this.nacionalidadeCurrency)
          newPieChartNacionalidadesData.push(n.total);
        else
          newPieChartNacionalidadesData.push(n.trabalhadores);
        this.pieChartNacionalidadeData.push(n.total);
        this.numberNacionalidade++;
      });
    this.displayNacionalidades.push(this.resumo.totalNacionalidades);
    this.pieChartNacionalidadeData = newPieChartNacionalidadesData;

    //regime
    let newPieChartRegimeData: number[] = [];
    this.resumo.regimes.forEach(n =>
      {
        this.displayRegimes.push(n);
        this.pieChartRegimeLabels.push(n.regime);
        newPieChartRegimeData.push(n.total);
        this.numberRegime++;
      });
    this.pieChartRegimeData = newPieChartRegimeData;
    this.displayRegimes.push({
      regime: 'TOTAL',
      remuneracoes: this.resumo.total.remuneracoes,
      quotizacoes: this.resumo.total.quotizacoes,
      contribuicoes: this.resumo.total.contribuicoes,
      total: this.resumo.total.total
    });

    let numberColors = Math.max(this.resumo.nacionalidades.length, this.resumo.regimes.length);
    populateChartColors(this.pieChartColors, [this.pieChartNacionalidadeOptions, this.pieChartRegimeOptions], numberColors);
    this.hideLoader();
  }

  public ChangeNacionalidadeChart()
  {
    let newPieChartNacionalidadesData: number[] = [];
    if(this.nacionalidadeCurrency)
    {
      this.resumo.nacionalidades.forEach(n =>
        {
          newPieChartNacionalidadesData.push(n.total);
        });
    }
    else
    {
      this.resumo.nacionalidades.forEach(n =>
        {
          newPieChartNacionalidadesData.push(n.trabalhadores);
        });
    }
    this.pieChartNacionalidadeData = newPieChartNacionalidadesData;
  }

  public ChangeRegimeChart()
  {
    let newPieChartRegimeData: number[] = [];

    switch (this.regimeChartType)
    {
      case 1:
        this.resumo.regimes.forEach(n =>
          {
            newPieChartRegimeData.push(n.remuneracoes);
          });
        break;
      case 2:
        this.resumo.regimes.forEach(n =>
          {
            newPieChartRegimeData.push(n.quotizacoes);
          });
        break;
      case 3:
        this.resumo.regimes.forEach(n =>
          {
            newPieChartRegimeData.push(n.contribuicoes);
          });
        break;
      case 4:
        this.resumo.regimes.forEach(n =>
          {
            newPieChartRegimeData.push(n.total);
          });
        break;
      default:
        this.resumo.regimes.forEach(n =>
          {
            newPieChartRegimeData.push(n.remuneracoes);
          });
        break;
    }
    this.pieChartRegimeData = newPieChartRegimeData;
  }

  public showLoader()
  {
    this.spinner.show();
  }

  public hideLoader()
  {
    this.spinner.hide();
  }

  public showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.dialogErrorPopUp);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }
}
