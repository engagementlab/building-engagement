import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { DataService } from '../utils/data.service';
import { AuthService } from '../utils/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import * as dateFormat from 'dateformat';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  public userName: string;
  public errorMsg: string;
  public reminderFirstDate: string;

  public nameLimit: number = 64;
  public nameCount: number;
  public descLimit: number = 150;
  public descCount: number;

  public profile: any;
  public projects: any[]
  public reminderIntervals: any = ['Every two weeks', 'Once a month', 'Every other month'];

  public hasContent: boolean;
  public noProjects: boolean;
  public projectSubmitted: boolean;

  public newForm: FormGroup;

  selectedInterval: number;

  constructor(private _dataSvc: DataService, private _authSvc: AuthService, private _formBuilder: FormBuilder, private _router: Router) {}

  async ngOnInit() {

    // Watch for changes to the profile data
    this._authSvc.profile.subscribe(profile => {
      if(!profile || this.profile !== undefined) return;

      this.profile = profile;
      this.userName = profile.given_name || profile.name.split(/\s+/)[0];

    });

    let userId = this._dataSvc.userId.getValue();
    if(userId)
      this.getProjects(userId)
    else
    {
      this._dataSvc.userId.subscribe(id => {
        if(id) this.getProjects(id);
      });
    }

    this.newForm = this._formBuilder.group({
      'name': ['', [Validators.required, Validators.maxLength(this.nameLimit)]],
      'description': ['', [Validators.required, Validators.maxLength(this.descLimit)]],
      'reminderEmail': ['', [Validators.email]],
      'reminderInterval': [''],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.newForm.controls;
  }

  getProjects(userId) {

    this._dataSvc.getDataForUrl('/api/project/get/' + userId).subscribe((response: any) => {

      this.projects = response;
      this.hasContent = true;
      this.noProjects = !this.projects || this.projects.length === 0;

    });

  }

  create() {

    document.getElementById('new-modal').style.display = 'flex';
    document.body.classList.value = '';

  }

  submitNew() {

    this.projectSubmitted = true;

    if(!this.newForm.valid) return;

    let data = {
      name: this.f['name'].value,
      description: this.f['description'].value,
      userId: this._dataSvc.userId.getValue(),
      reminderEmail: this.f['reminderEmail'].value,
      reminderPeriod: this.selectedInterval
    };

    this._dataSvc.sendDataToUrl('/api/project/create', data).subscribe((response: any) => {

      // Hide modal
      document.getElementById('new-modal').style.display = 'none';
      document.body.classList.value = 'white';
      this.projects.push(response);

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

  closeModal() {

    document.getElementById('new-modal').style.display = 'none';
    document.body.classList.value = 'white';

  }

  public countName(evt) {
    this.nameCount = (evt.target as HTMLTextAreaElement).value.length
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

    this.reminderFirstDate = dateFormat(new Date().setDate(delta), 'mmmm dS, yyyy');

  }

}
