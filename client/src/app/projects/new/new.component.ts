import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { DataService } from 'src/app/utils/data.service';

import * as dateFormat from 'dateformat';
import datepicker from 'js-datepicker';

@Component({
  selector: 'app-new-project',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class ProjectNewComponent implements OnInit {

  public nameLimit: number = 64;
  public nameCount: number;
  public descLimit: number = 150;
  public descCount: number;

  public errorMsg: string;
  public reminderFirstDate: string;
  public reminderEndDate: string;
  public reminderIntervals: string[] = ['Every two weeks', 'Once a month', 'Every other month'];

  public projectSubmitted: boolean;

  public newForm: FormGroup;

  selectedInterval: number;
  datePicker: any;

  constructor(private _dataSvc: DataService, private _formBuilder: FormBuilder, private _router: Router) { }

  ngOnInit() {

    this.newForm = this._formBuilder.group({
      'name': ['', [Validators.required, Validators.maxLength(this.nameLimit)]],
      'description': ['', [Validators.required, Validators.maxLength(this.descLimit)]],
      'reminderEmail': ['', [Validators.email]],
      'reminderInterval': [''],
      'reminderEndDate': ['']
    });

  }

  // convenience getter for easy access to form fields
  get f() {
    return this.newForm.controls;
  }


  submitNew() {

    this.projectSubmitted = true;

    if(!this.newForm.valid) return;

    let data = {
      name: this.f['name'].value,
      description: this.f['description'].value,
      userId: this._dataSvc.userId.getValue(),
      reminderEmail: this.f['reminderEmail'].value,
      reminderPeriod: this.selectedInterval,
    };
    
    if(data.reminderPeriod)
      data['reminderEndDate'] = (document.querySelector('.enddate') as HTMLInputElement).value

    this._dataSvc.sendDataToUrl('/api/project/create', data).subscribe((response: any) => {

      // Go to new project
      this._router.navigate(['projects', response.slug]);

    },
    (err: HttpErrorResponse) => {
      if(err.status === 409)
        this.errorMsg = 'You already have a project with that name.';

      if (err.status === 413) {
        this.errorMsg = 'Your project name is longer than 64 characters.'
      }
    });

  }

  public countName(evt) {
    
    this.nameCount = (evt.target as HTMLTextAreaElement).value.length;

  }

  public countDes(evt) {

    this.descCount = (evt.target as HTMLTextAreaElement).value.length;

  }

  // Cache reminder interval index
  public changeInterval(evt) {

    /* 0 = 'Every two weeks',
      1 = 'Once a month',
      2 = 'Every other month'
    */
    let today = new Date();
    let delta = 0;

    this.selectedInterval = parseInt((evt.target as HTMLOptionElement).value);

    switch(this.selectedInterval) {
      case 0:
        delta = today.getDate() + 14;
        break;
      case 1:
        delta = today.getDate() + 31;
        break;
      case 2:
        delta = today.getDate() + 62;
        break;
    }

    let min = new Date(new Date().setDate(delta));
    this.reminderFirstDate = dateFormat(new Date().setDate(delta), 'mmmm d, yyyy');
        
    setTimeout(() => {
      
      if(!this.datePicker) {
        // Set min date as first reminder date
        this.datePicker = datepicker('.enddate', {minDate: min, startDate: min});
        this.datePicker.onSelect = (instance) => {
          // Show end date in UI
          this.reminderEndDate = instance.dateSelected;
        }
      }
      else
        this.datePicker.setMin(min);
      
    }, 100);
      
  }

}
