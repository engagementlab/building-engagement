import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, Form } from '@angular/forms';

import { DataService } from '../../utils/data.service';
import { SurveyPrompts } from '../../survey-prompts';

import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'underscore';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit {
  
  public projects: any[];
  public hasProjects: boolean;
  public formError: boolean;

  public noteLimit: number = 200;
  public noteCount: number;

  private responseForm: FormGroup;
  private selectedProjectId: string;

  constructor(private _dataSvc: DataService, private _formBuilder: FormBuilder, private _route: ActivatedRoute, private _router: Router) {}

  ngOnInit() {

    let radioGroups = {};
    SurveyPrompts.prompts.forEach((p, i) => radioGroups[i + ''] = [null, [Validators.required]]);
    this.responseForm = this._formBuilder.group(radioGroups);
   
    this._route.params.subscribe(params => {
      
      // User has projects if params provided
      if (Object.values(params).length > 0)
        this.hasProjects = true;

      // If no current internal project ID, get project data
      if (!this._dataSvc.currentProjectId && params['id']) {
        this._dataSvc.userId.subscribe(id => {

          if (id) {
            let userId = id;
            // Get user's project and cache ID
            this._dataSvc.getDataForUrl('/api/project/get/' + userId + '/' + params['id']).subscribe((response: any) => {
              this._dataSvc.currentProjectId = response.project._id
            });
          }

        });
      }
      
    });

  }

  openSelect() {

    document.querySelector('#select').classList.toggle('active')

  }

  projectSelected(id: string) {

    document.querySelector('#select').classList.remove('active');
    document.querySelector('#select span').textContent = document.getElementById(id).textContent;

    this.selectedProjectId = id;
    this.responseForm.reset();


  }

  submitNew() {
    
    // Check if all responses filled
    let formFinished = _.every(this.responseForm.value, (v) => {return v !== null});
    if(!formFinished) {
      this.formError = true;
      return;
    }
    this.formError = false;

    let data = {
      projectId: this.selectedProjectId || this._dataSvc.currentProjectId,
      responses: Object.values(this.responseForm.value),
      note: (document.querySelector('#note textarea') as HTMLInputElement).value
    };

    this._dataSvc.sendDataToUrl('/api/progress/create', data).subscribe((response: any) => {

      this._router.navigate(['/projects', response.slug]);

    });
  }

  public countNote(evt) {

    this.noteCount = (evt.target as HTMLTextAreaElement).value.length;
  
  }

  }
