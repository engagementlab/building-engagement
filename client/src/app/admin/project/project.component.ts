import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  ActivatedRoute
} from '@angular/router';

import {
  DataService
} from 'src/app/utils/data.service';
import {
  ProjectGrid
} from 'src/app/project-grid';

import {
  SurveyPrompts
} from '../../survey-prompts';

// PDF Generation imports
import {
  HttpClient
} from '@angular/common/http';
import * as _ from 'underscore';
import * as jsPDF from 'jspdf';
import * as dateformat from 'dateformat';

// CSV export
import {
  ExportToCsv
} from 'export-to-csv';

@Component({
  selector: 'admin-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class AdminProjectComponent implements OnInit {

  public allowAccess: boolean;
  public hasContent: boolean;
  public isPhone: boolean;

  public project: any;
  public projectId: string;
  public projectDbId: string;
  public progress: any[];

  canvasElement: ElementRef;

  // Font data for PDF
  spectralFont: string;
  robotoFont: string;

  @ViewChild('canvasElement', {
    static: false
  }) set content(content: ElementRef) {
    this.canvasElement = content;
    if (content) {

      this.canvasElement.nativeElement.width = this.isPhone ? 300 : 680;
      this.canvasElement.nativeElement.height = this.isPhone ? 300 : 680;

      // Draw grid
      let projectGrid = new ProjectGrid(this.progress, this.canvasElement, this.isPhone);
      projectGrid.drawGrid();

    }
  };

  constructor(private _dataSvc: DataService, private _route: ActivatedRoute, private _http: HttpClient, ) {}

  ngOnInit() {

    this._dataSvc.isAdmin.subscribe({
      next: (isAdmin) => this.checkAdmin(isAdmin)
    });

  }

  checkAdmin(isAdmin: boolean) {

    if (isAdmin) {
      this.allowAccess = true;

      this._route.params.subscribe(params => {

        this.projectId = params['id'];

        // Get data
        this._dataSvc.getDataForUrl('/api/admin/get/project/' + params['projectId']).subscribe((response: any) => {

          this.project = response.project;
          this.projectDbId = response.project._id;
          this.progress = response.progress;
          this.hasContent = true;

        });
      });

    }

  }

  // Generate a PDF w/ project data
  public exportPdf() {

    // Get pdf pre-filled txt and all of this projects progress from API
    this._dataSvc.getDataForUrl('/api/project/pdf/' + this.projectDbId).subscribe((response: any) => {

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
            let introArr = doc.splitTextToSize(intro, width - 90);
            let explanationArr = doc.splitTextToSize(explanation, width - 60);
            doc.setFontSize(25);
            doc.setFont('Roboto-Regular');
            doc.text(10, 50, introArr);

            // Offset begins at height of intro and offsext
            let globalYOffset = 60;
            _.each(introArr, (d) => {
              globalYOffset += doc.getTextDimensions(d).h;
            });

            // Explanation
            doc.setFontSize(20);
            doc.text(10, globalYOffset, explanationArr);
            _.each(explanationArr, (d) => {
              globalYOffset += doc.getTextDimensions(d).h;
            });

            /*
             Project starts
            */

            // Add page and reset global offset
            doc.addPage();
            globalYOffset = 10;

            doc.setLineWidth(1.3);
            doc.line(10, globalYOffset, width - 20, globalYOffset, 'FD');

            // Cleanup description so it doesn't overrun
            let descArr = doc.splitTextToSize(this.project.description.replace(/(\r\n|\n|\r)/gm, ' '), width - 60);

            // Project name
            globalYOffset += 30;
            doc.setFontSize(40)
            doc.setFont('Spectral-Bold');
            doc.text(10, globalYOffset, this.project.name);

            // Project description
            globalYOffset += 20;
            doc.setFontSize(20);
            doc.setFont('Roboto-Regular');
            doc.text(10, globalYOffset, descArr);

            _.each(descArr, (d) => {
              globalYOffset += doc.getTextDimensions(d).h;
            });

            // Draw all progress entries
            doc.setLineWidth(.5);

            let prevNoteHeight = 0;
            let newPage = false;
            _.each(this.progress, (p: any, i: number) => {

              // Offset on y is project description plus cumulative previous note heights, unless new pg just added
              let yOffset = newPage ? 20 : (globalYOffset + prevNoteHeight) + 20;
              if (newPage) newPage = false;

              // Line only for records past first
              if (i > 0)
                doc.line(10, yOffset, width - 20, yOffset, 'FD');

              doc.setFontSize(14);
              doc.setDrawColor(0);

              // Circle for response #
              doc.setFillColor(circleColors[circleColorIndex]);

              if (circleColorIndex === 3) circleColorIndex = -1;
              circleColorIndex++;

              doc.circle(16, yOffset + 10, 4, 'F');

              // Response #
              doc.setTextColor(255, 255, 255);
              doc.text(14.5, yOffset + 12, (i + 1) + '');

              // Date
              doc.setTextColor(0, 0, 0);
              doc.text(40, yOffset + 12, dateformat(p.date, 'mm/dd/yyyy'));
              doc.text(90, yOffset + 12, p.sumX / 2 + ', ' + p.sumY / 2);

              // Add note if defined
              if (p.note) {

                // Note cannot exceed specified width
                let noteArr = doc.splitTextToSize(p.note, 75);

                doc.setTextColor(151, 151, 151);
                doc.text(120, yOffset + 12, noteArr);

                // Measure note height
                _.each(noteArr, (d: any) => {
                  prevNoteHeight += doc.getTextDimensions(d).h;
                });

              }

              // If approaching height of page and not last record, add a page and reset cumulative height
              let cutoff = (yOffset + prevNoteHeight) > (height + 20);
              let notLast = i < this.progress.length - 1;
              if (cutoff && notLast) {
                doc.addPage();

                newPage = true;
                globalYOffset = 0;
                prevNoteHeight = 0;
              }

              // Buffer
              prevNoteHeight += 20;

            });

            // Add page just for grid image
            doc.addPage();

            // Add img under description
            doc.addImage(canvasImg, 'PNG', 0, 50, width, width);

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
              let promptArr = doc.splitTextToSize((i + 1) + '. ' + prompt.replace(/(\r\n|\n|\r)/gm, ' '), width - 40);
              doc.text(10, globalYOffset, promptArr);

              // Measure prompt height
              _.each(promptArr, (d: any) => {
                globalYOffset += doc.getTextDimensions(d).h;
              });

              // Print all answers in project for this prompt
              circleColorIndex = -1;
              globalYOffset += 4;

              _.each(allResponses, (submission, ind) => {

                if (circleColorIndex === 3) circleColorIndex = -1;
                circleColorIndex++;

                // Circle for response #
                doc.setFillColor(circleColors[circleColorIndex]);

                let dotXPos = 24 * (ind + 1);
                doc.circle(dotXPos, globalYOffset, 4, 'F');

                // Response #
                let txtXPos = (24 * (ind + 1)) - .9;
                doc.setTextColor(255, 255, 255);
                doc.text(txtXPos, globalYOffset + 1, (ind + 1) + '');

                // Response entry
                doc.setTextColor(0, 0, 0);
                doc.text(txtXPos + 7, globalYOffset + 1, submission.responses[i]);

              });

              if (i < SurveyPrompts.prompts.length - 1) {
                doc.setDrawColor(212, 212, 212);
                doc.setLineWidth(.3);
                doc.line(10, globalYOffset + 8, 100, globalYOffset + 8, 'FD');
              }

              globalYOffset += 14;

            });

            doc.save('results-ADMIN_' + this.project.name + '_' + dt + '.pdf');

          });

        });

      });

    });

  }

  exportCsv() {

    this._dataSvc.getDataForUrl('/api/project/pdf/' + this.projectDbId).subscribe((response: any) => {

      const allResponses = response.responses;
      let progress: any = [];

      // Create row per progress
      _.each(this.progress, (p: any, i: number) => {

        let columns = {
          Date: dateformat(p.date, 'mm/dd/yyyy'),
          Note: p.note,
        }
        allResponses[i].responses.forEach((r: any, ir: number) => {
          columns[`Response ${ir+1}`] = r;
        });

        columns['Sum X'] = p.sumX / 2;
        columns['Sum Y'] = p.sumY / 2;
        progress.push(columns);

      });

      const title = `${this.project.name} by ${this.project.user.name}`;
      const dt = dateformat(new Date(), 'mm-d-yy_h:MM:sstt');
      const options = {
        fieldSeparator: ',',
        filename: `results-ADMIN_${this.project.name}_${dt}`,
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
      };

      const csvExporter = new ExportToCsv(options);
      csvExporter.generateCsv(progress);

    });

  }

  export () {

    let img = this.canvasElement.nativeElement.toDataURL("image/png");
    let tab = < any > window;
    let newTab = tab.open();

    newTab.document.write('<img src="' + img + '"/>');

  }

}
