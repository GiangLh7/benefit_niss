import { ErrorStateMatcher } from "@angular/material/core";
import moment from "moment";

//error states
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(a: any, b: any): boolean {
    let res = false;
    
    if (a.errors)
      res = true;

    //foi clicado
    if (!a.pristine) {
      res = true;
      if (!a.errors)
        res = false;
    }

    if(res && !a.errors)
    {
      a.status = "INVALID";
      a.setErrors({'incorrect': true});
    }

    return res;
  }
}

export class MyErrorConfirmPasswordStateMatcher implements ErrorStateMatcher {
  constructor(private password: string) { }
  isErrorState(a: any, b: any): boolean {
    let res = false;

    if (a.errors){
      //foi submtido
      res = true;
    }

    //foi clicado
    if (!a.pristine) {
      res = true;
      if (a.value && a.value == this.password && !a.errors)
        res = false;
    }

    if(res && !a.errors)
    {
      a.status = "INVALID";
      a.setErrors({'incorrect': true});
    }

    return res;
  }
}

export class MyErrorDataSuperiorStateMatcher implements ErrorStateMatcher {
  constructor(private data: Date | undefined) { }
  isErrorState(a: any, b: any): boolean {
    let res = false;

    if (a.errors)
      res = true;
    else if(a.value && this.data)
      if(moment(a.value) <=  moment(this.data))
        res = true;

    //foi clicado
    if (!a.pristine) {
      res = true;
      if (!a.errors && (!this.data || !a.value || moment(a.value) >= moment(this.data)))
        res = false;
    }

    if(res && !a.errors)
    {
      a.status = "INVALID";
      a.setErrors({'incorrect': true});
    }

    return res;
  }
}

export class MyErrorDateSuperiorDataAtualStateMatcher implements ErrorStateMatcher {
  isErrorState(a: any, b: any): boolean {
    let res = false;

    var value = a.value;
    if(!moment.isMoment(value))
      value = moment(value);

    if (a.errors)
      res = true;
    else if(value)
      if(value > new Date())
          res = true;

    //foi clicado
    else if (!a.pristine) {
      res = true;
      if (!a.errors && value <= new Date())
        res = false;
    }

    if(res && !a.errors)
    {
      a.status = "INVALID";
      a.setErrors({'incorrect': true});
    }

    return res;
  }
}

export class MyErrorStateDependentMatcher implements ErrorStateMatcher {
  constructor(private dependent: boolean) { }

  isErrorState(a: any, b: any): boolean {
    let res = false;

    if (this.dependent) {
      if (a.errors)
        res = true;

      //foi clicado
      if (!a.pristine) {
        res = true;
        if (!a.errors)
          res = false;
      }
    }

    if(res && !a.errors)
    {
      a.status = "INVALID";
      a.setErrors({'incorrect': true});
    }

    return res;
  }
}

export class NotRequiredErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(a: any, b: any): boolean {
    let res = false;

    if (a.errors)
      res = true;

    if(res && !a.errors)
    {
      a.status = "INVALID";
      a.setErrors({'incorrect': true});
    }

    return res;
  }
}

export class MyErrorDateStateMatcher implements ErrorStateMatcher {
  isErrorState(a: any, b: any): boolean {
    let res = false;

    if (a.errors)
      res = true;
    else if(a.value)
      if(a.value < new Date())
          res = true;

    //foi clicado
    else if (!a.pristine) {
      res = true;
      if (!a.errors && a.value >= new Date())
        res = false;
    }

    if(res && !a.errors)
    {
      a.status = "INVALID";
      a.setErrors({'incorrect': true});
    }

    return res;
  }
}

export class MyMaxNumberStateMatcher implements ErrorStateMatcher {
  constructor(private max: number, private required: boolean) { }
  isErrorState(a: any, b: any): boolean {
    let res = false;

    if (a.errors){
      //foi submtido,
      res = true;
    }

    //foi clicado
    if (!a.pristine) {
      res = true;
      let value = a.value;
      if(value && value.toString().includes(','))
        value = value.replace(',','.');
      if (value <= this.max && !a.errors && (a.value || !this.required))
        res = false;
    }

    if(res && !a.errors)
    {
      a.status = "INVALID";
      a.setErrors({'incorrect': true});
    }

    return res;
  }
}

export class MyNumberDifferentStateMatcher implements ErrorStateMatcher {
  constructor(private diff: number, private validate: boolean = false) { }
  isErrorState(a: any, b: any): boolean {
    let res = false;

    if (a.errors){
      //foi submtido,
      res = true;
    }
    
    //foi clicado
    if (this.validate) {
      res = true;
      let value = a.value;
      if(value && value.toString().includes(','))
        value = value.replace(',','.');
      if (value != this.diff && !a.errors)
        res = false;
    }

    if(res && !a.errors)
    {
      a.status = "INVALID";
      a.setErrors({'incorrect': true});
    }

    return res;
  }
}
