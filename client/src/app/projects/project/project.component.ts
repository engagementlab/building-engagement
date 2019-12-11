import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { DataService } from '../../utils/data.service';
import { ProjectGrid } from '../../project-grid';
import { SurveyPrompts } from '../../survey-prompts';

import { TweenLite, TweenMax } from 'gsap';

import * as _ from 'underscore';
import * as ismobile from 'ismobilejs';
import * as jsPDF from 'jspdf';
import * as dateformat from 'dateformat';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  public project: any;
  public projectId: string;
  public projectDbId: string;
  public errorMsg: string;
  
  public progress: any[];

  public hasContent: boolean;
  public noProgress: boolean;
  public isPhone: boolean;
  public showPrompt: boolean;

  public reminderNextDate: any;

  canvasElement: ElementRef;
  
  userId: string;

  // Font data for PDF
  spectralFont: string;
  robotoFont: string;

  @ViewChild('canvasElement', {
    static: false
  }) set content(content: ElementRef) {
    this.canvasElement = content;
    if(content) {

      this.canvasElement.nativeElement.width = this.isPhone ? 300 : 680;
      this.canvasElement.nativeElement.height = this.isPhone ? 300 : 680;

      // Draw grid
      let projectGrid = new ProjectGrid(this.progress,  this.canvasElement, this.isPhone);
      projectGrid.drawGrid();

    }
  };

  constructor(private _dataSvc: DataService, private _route: ActivatedRoute, private _router: Router, private _http: HttpClient) {

    this.isPhone = ismobile.phone;

  }

  ngOnInit() {

    this._dataSvc.userId.subscribe(id => {
      if (id) {
        this.userId = id;
        this.getData();
      } 
    });

  }

  getData() {

    this._route.params.subscribe(params => {

      this.projectId = params['id'];

      this._dataSvc.getDataForUrl('/api/project/get/' + this.userId + '/' + this.projectId).subscribe((response: any) => {

        this.project = response.project;
        this.progress = response.progress;
        this.projectDbId = response.projectId;

        this.hasContent = true;

        this.noProgress = this.progress && this.progress.length === 0;

        this._dataSvc.currentProjectId = response.project._id;

        // Set reminder date for display, if any
        if(this.project.reminderPeriod !== undefined) {
          // Get last reminder date
          let lastDate = new Date(this.project.lastReminderDate), nextDate = null;
          switch(this.project.reminderPeriod) {
            case 0: 
            nextDate = lastDate.setDate(lastDate.getDate() + 14);
            break;
            // case 1: 
            // delta = today.getDate() + 31;
            // break;
            // case 2: 
            // delta = today.getDate() + 62;
            // break;
          }
          this.reminderNextDate = nextDate;
        }

        if (!this.progress || (this.progress && this.progress.length < 1)) return;

        // Prompt user to track if >30 days since last tracking
        const oneDay = 24 * 60 * 60 * 1000;
        const dtToday = new Date(Date.now());
        const dtLastTrack = new Date(this.progress[0].date);
        const diffDays = Math.round(Math.abs((dtToday.getTime() - dtLastTrack.getTime()) / (oneDay)));

        this.showPrompt = diffDays > 30;

      },
      (err: HttpErrorResponse) => {
        if(err.status === 404)
          this.errorMsg = 'Project not found.';
      });

    });
  }
  
  deleteProject() {

    this._dataSvc.getDataForUrl('/api/project/delete/' + this.userId + '/' + this.projectId).subscribe((response: any) => {

      // If success, redirect to projects
      if(response.deleted)
        this._router.navigateByUrl('/projects');

    });

  }

  cancelReminders() {



  }

  public exportPdf() {

    // Get pdf pre-filled txt and all of this projects progress from API
    this._dataSvc.getDataForUrl('/api/project/pdf/'+ this.projectDbId).subscribe((response: any) => {

      let intro = response.text.intro,
          explanation = response.text.explanation,
          allResponses = response.responses;

      // Fonts encoding for PDF
      this._http.get('assets/spectral-base-64', {
        responseType: 'text'
      }).subscribe(data => {
        this.spectralFont = data

        this._http.get('assets/roboto-base-64', {
          responseType: 'text'
        }).subscribe(data => {
          this.robotoFont = data;

          this._http.get('assets/logo-base-64', {
            responseType: 'text'
          }).subscribe(logoData => {

          let canvasImg = this.canvasElement.nativeElement.toDataURL();
          let doc = new jsPDF();
          let dt = dateformat(new Date(), 'mm-d-yy_h:MM:sstt');

          let circleColors = ['#5a5c27', '#634da0', '#e85e5d', '#e9bbb0'];
          let circleColorIndex = 0;

          // Add our fonts in base64 encoding
          doc.addFileToVFS('Spectral-Bold.ttf', this.spectralFont);
          doc.addFileToVFS('Roboto-Regular.ttf', this.robotoFont);

          // Add names/styles for fonts
          doc.addFont('Spectral-Bold.ttf', 'Spectral-Bold', 'normal');
          doc.addFont('Roboto-Regular.ttf', 'Roboto-Regular', 'normal');

          let width = doc.internal.pageSize.getWidth();
          let height = doc.internal.pageSize.getHeight();

          // Add Meetr logo
          doc.addImage(logoData, 'PNG', 10, 20, 50, 10);

          // Meetr intro/explanation text
          let introArr = doc.splitTextToSize(intro, width - 60);
          let explanationArr = doc.splitTextToSize(explanation, width - 60);
          doc.setFontSize(20);
          doc.setFont('Roboto-Regular');
          doc.text(10, 50, introArr);
          
          // Offset begins at height of intro and offsext
          let globalYOffset = 60;
          _.each(introArr, (d) => {
            globalYOffset += doc.getTextDimensions(d).h;
          });
          
          // Explanation
          doc.text(10, globalYOffset, explanationArr);
          _.each(explanationArr, (d) => {
            globalYOffset += doc.getTextDimensions(d).h;
          });
          
          doc.setLineWidth(1.3);
          doc.line(10, globalYOffset+10, width-20, globalYOffset+10, 'FD');
          
          // Cleanup description so it doesn't overrun
          let descArr = doc.splitTextToSize(this.project.description.replace(/(\r\n|\n|\r)/gm, ' '), width - 60);
          
          doc.setFontSize(40)
          doc.setFont('Spectral-Bold');
          doc.text(10, globalYOffset + 30, this.project.name);

          doc.setFontSize(20);
          doc.setFont('Roboto-Regular');
          doc.text(10, globalYOffset + 50, descArr);

          // Add page and reset global offset
          doc.addPage();
          globalYOffset = 0;

          // Draw all progress entries
          let prevNoteHeight = 0;
          let newPage = false;
          _.each(this.progress, (p: any, i: number) => {

            // Offset on y is project description plus cumulative previous note heights, unless new pg just added
            let yOffset = newPage ? 20 : (globalYOffset+prevNoteHeight) + 20;
            if(newPage) newPage = false;

            // Line only for records past first
            if(i > 0)
              doc.line(10, yOffset, width-20, yOffset, 'FD');

            doc.setFontSize(14);
            doc.setDrawColor(0);

            // Circle for response #
            doc.setFillColor(circleColors[circleColorIndex]);

            if(circleColorIndex === 3) circleColorIndex = -1;
            circleColorIndex++;

            doc.circle(16, yOffset + 10, 4, 'F');

            // Response #
            doc.setTextColor(255,255, 255);
            doc.text(14.5, yOffset + 12, (i+1)+'');

            // Date
            doc.setTextColor(0, 0, 0);
            doc.text(40, yOffset + 12, dateformat(p.date, 'mm/dd/yyyy'));
            doc.text(90, yOffset + 12, p.sumX/2 + ', ' + p.sumY/2);

            // Add note if defined
            if(p.note) {

              // Note cannot exceed specified width
              let noteArr = doc.splitTextToSize(p.note, 75);

              doc.setTextColor(151, 151, 151);
              doc.text(120, yOffset + 12, noteArr);

              // Measure note height
              _.each(noteArr, (d: any) => {
                prevNoteHeight += doc.getTextDimensions(d).h;
              });

            }

            // If approaching height of page, add a page and reset cumulative height
            if((yOffset + prevNoteHeight) > (height+20)) {
              doc.addPage();

              newPage = true;
              globalYOffset = 0;
              prevNoteHeight = 0;
            }

            // Buffer
            prevNoteHeight += 20;

          });

          doc.addPage();

          // Add img under description
          doc.addImage(canvasImg, 'PNG', 0, 50 + globalYOffset, width, width);

          // Page for prompts
          doc.addPage();

          // Reset global offset
          globalYOffset = 20;
          
          // Survey prompt header
          doc.setFontSize(20);
          doc.text(10, globalYOffset, 'Survey Prompts and Responses:');
          
          globalYOffset += 10;
          doc.setFontSize(10);
          
          // Draw all survey prompts and answers for each per tracking
          _.each(SurveyPrompts.prompts, (prompt, i) => {
            
            doc.setTextColor(0, 0, 0);
            let promptArr = doc.splitTextToSize((i+1) + '. ' + prompt.replace(/(\r\n|\n|\r)/gm, ' '), width - 40);
            doc.text(10, globalYOffset, promptArr);

            // Measure prompt height
            _.each(promptArr, (d: any) => {
              globalYOffset += doc.getTextDimensions(d).h;
            });

            // Print all answers in project for this prompt
            circleColorIndex = -1;
            globalYOffset += 4;

            _.each(allResponses, (submission, ind) => {

              if(circleColorIndex === 3) circleColorIndex = -1;
              circleColorIndex++;

              // Circle for response #
              doc.setFillColor(circleColors[circleColorIndex]);

              let dotXPos = 24*(ind+1);
              doc.circle(dotXPos, globalYOffset, 4, 'F');

              // Response #
              let txtXPos = (24*(ind+1))-.9;
              doc.setTextColor(255, 255, 255);
              doc.text(txtXPos, globalYOffset + 1, (ind+1)+'');

              // Response entry
              doc.setTextColor(0, 0, 0);
              doc.text(txtXPos + 7, globalYOffset + 1, submission.responses[i]);

            });
            
            if(i < SurveyPrompts.prompts.length-1) {
              doc.setDrawColor(212, 212, 212);
              doc.setLineWidth(.3);
              doc.line(10, globalYOffset+8, 100, globalYOffset+8, 'FD');
            }

            globalYOffset += 14;

          });

          doc.save('results_' + this.project.slug + '_' + dt + '.pdf');

        });

        });

      });

    });

  }

  public viewAll() {

    let allResults = document.querySelectorAll('#all .columns');
    TweenLite.fromTo(document.getElementById('all-hr1'), .4, {
      opacity: 0,
      width: 0
    }, {
      opacity: 1,
      width: '100%',
      display: 'block'
    });
    TweenMax.staggerFromTo(allResults, .4, {
      y: '-50%',
      opacity: 0
    }, {
      y: '10%',
      opacity: 1,
      display: 'flex',
      delay: .5
    }, .3);
    TweenLite.fromTo(document.getElementById('all-hr2'), .4, {
      opacity: 0,
      width: 0
    }, {
      opacity: 1,
      width: '100%',
      display: 'block',
      delay: allResults.length * .3
    });

  }

  public dismissPrompt() {

    TweenLite.fromTo(document.getElementById('prompt'), .4, {
      opacity: 1
    }, {
      opacity: 0,
      height: 0,
      padding: 0
    });

  }

  public promptDelete() {
    
    if(confirm('Are you sure you want to delete this project?'))
      this.deleteProject();

  }

  public promptCancelReminder() {

    if(confirm('Are you sure you want to cancel reminders for this project?'))
      this.cancelReminders();

  }

}