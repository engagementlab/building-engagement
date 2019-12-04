import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router';

import { DataService } from '../../utils/data.service';

import { TweenLite, TweenMax } from 'gsap';

import * as _ from 'underscore';
import * as ismobile from 'ismobilejs';
import * as paper from 'paper';
import * as jsPDF from 'jspdf';
import * as dateformat from 'dateformat';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  public project: any;
  public projectId: string;
  public progress: any[];
  public hasContent: boolean;
  public noProgress: boolean;
  public isPhone: boolean;
  public showPrompt: boolean;

  public errorMsg: string;

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

      this.drawGrid();
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
        this.hasContent = true;

        this.noProgress = this.progress && this.progress.length === 0

        this._dataSvc.currentProjectId = response.project._id;

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

  drawGrid() {

      if (!this.canvasElement) return;
      let _paper = new paper.PaperScope();
      _paper.setup(this.canvasElement.nativeElement);
      let p = _paper;

      let widthExt = this.isPhone ? 300 : 680,
        heightExt = this.isPhone ? 300 : 680;

      let tooltip: paper.PointText;
      let segments: paper.Point[] = [];
      let colors = ['#e9bbb0', '#e85e5d', '#634da0', '#5a5c27'];
      let colorIndex = 4;

      let boxW = ((widthExt) / 2) / 6;
      let gLines: paper.Group = new p.Group();
      let gLabels: paper.Group = new p.Group();

      // Draw grid and grid labels
      _.times(13, (n) => {

        let label;
        let xLine = new paper.Path.Line(new p.Point(Math.ceil(n * boxW), 0), new p.Point([Math.ceil(n * boxW), heightExt]));
        let yLine = new paper.Path.Line(new p.Point(0, Math.ceil(n * boxW)), new p.Point([widthExt, Math.ceil(n * boxW)]));

        xLine.strokeColor = new p.Color('#ccc');
        yLine.strokeColor = new p.Color('#ccc');

        xLine.strokeWidth = n === 6 ? 2 : 1;
        yLine.strokeWidth = n === 6 ? 2 : 1;

        xLine.sendToBack();
        yLine.sendToBack();

        // Draw gridline labels along mid-x-axis
        if (n === 1 || n === 4 || n === 7 || n === 9 || n === 12) {
          let txt = '-7';
          if (n === 4) txt = '-3';
          else if (n === 7) txt = '0';
          else if (n === 9) txt = '3';
          else txt = '7';

          let offset = n === 7 ? -45 : -20;
          label = new p.PointText({
            point: new p.Point(Math.ceil(n * boxW) + offset, (heightExt / 2) + 20),
            content: txt,
            fontSize: 12
          });
        }

        // Grid labels on left/top
        if (n === 0 || n === 6) {
          let offset = n === 0 ? 10 : -20;
          let x = Math.ceil(n * boxW) + offset;
          let y = n === 0 ? (heightExt / 2) - 20 : 0;
          label = new p.PointText({
            point: new p.Point(x, y),
            content: n === 0 ? 'social infrastructure' : 'objective',
            fontSize: 14
          });

          if (n === 6) {
            label.rotate(-90);
            label.translate(new p.Point(-label.bounds.width, label.bounds.height));
          }
        }
        if (label) {
          gLabels.addChild(label);
          label.bringToFront();
        }

        gLines.addChildren([xLine, yLine])

      });

      gLines.addChild(gLabels)

      // Labels on sides
      let longevity = new p.PointText({
        point: [widthExt / 2, (heightExt * .03)],
        content: 'LONGEVITY',
        fontSize: 12
      });
      let novelty = new p.PointText({
        point: [widthExt / 2, heightExt - (heightExt * .02)],
        content: 'NOVELTY',
        fontSize: 12
      });
      let weak = new p.PointText({
        point: [0, heightExt / 2],
        content: 'WEAK',
        fontSize: 12
      });
      let strong = new p.PointText({
        point: [widthExt - 45, heightExt / 2],
        content: 'STRONG',
        fontSize: 12
      });

      longevity.translate(new p.Point(-longevity.bounds.width / 2, 0));
      novelty.translate(new p.Point(-novelty.bounds.width / 2, 0));
      strong.rotate(90);
      weak.rotate(-90);

      // Plot dots on grid
      this.progress.forEach((survey, i) => {

        if (colorIndex === 0) colorIndex = 4;
        colorIndex--;

        let xPos = (widthExt / 2) + ((survey.sumX / 2) * ((widthExt / 2) / 7)),
          yPos = (heightExt / 2) - (survey.sumY / 2) * ((heightExt / 2) / 7);

        segments.push(new p.Point(xPos, yPos));

        let g: paper.Group = new p.Group();
        let dot = new paper.Path.Circle({
          center: [xPos, yPos],
          radius: 16,
          fillColor: colors[colorIndex]
        });

        let txt = new p.PointText({
          point: [xPos - 5, yPos + 5],
          content: this.progress.length - i,
          fillColor: 'white',
          fontSize: 16
        });

        g.addChildren([dot, txt]);

        g.onMouseEnter = (event) => {
          // Layout the tooltip above the dot
          tooltip = new p.PointText({
            point: [event.target.position._x - 75, event.target.position._y - 15],
            content: '( ' + survey.sumX / 2 + ', ' + survey.sumY / 2 + ' )',
            fillColor: '#e85e5d',
            fontSize: 14
          });
          // g.scale(1.5);
        };
        g.onMouseLeave = () => {
          // g.scale(.75);
          tooltip.remove();
        };
        gLines.addChild(g)

      });

      // Draw line(s)
      let path = new p.Path(segments);
      path.strokeColor = new p.Color('black');
      path.strokeCap = 'round';
      path.strokeWidth = 1.5;
      path.dashArray = [1, 4];

      gLines.addChild(path)
      path.sendToBack();

      // Scale to allow room for side labels
      gLines.scale(.9, new p.Point(widthExt / 2, heightExt / 2));
  }
  
  deleteProject() {

    this._dataSvc.getDataForUrl('/api/project/delete/' + this.userId + '/' + this.projectId).subscribe((response: any) => {

      // If success, redirect to projects
      if(response.deleted)
        this._router.navigateByUrl('/projects');

    });

  }

  public exportPdf() {

    let canvasImg = this.canvasElement.nativeElement.toDataURL();
    let doc = new jsPDF();
    let dt = dateformat(new Date(), 'mm-d-yy_h:MM:sstt');
    let circleColors = ['#5a5c27', '#634da0', '#e85e5d', '#e9bbb0'];
    let circleColorIndex = 0;

    // Fonts encoding for PDF
    this._http.get('assets/spectral-base-64', {
      responseType: 'text'
    }).subscribe(data => {
      this.spectralFont = data

      this._http.get('assets/roboto-base-64', {
        responseType: 'text'
      }).subscribe(data => {
        this.robotoFont = data;

        // Add our fonts in base64 encoding
        doc.addFileToVFS('Spectral-Bold.ttf', this.spectralFont);
        doc.addFileToVFS('Roboto-Regular.ttf', this.robotoFont);

        // Add names/styles for fonts
        doc.addFont('Spectral-Bold.ttf', 'Spectral-Bold', 'normal');
        doc.addFont('Roboto-Regular.ttf', 'Roboto-Regular', 'normal');

        let width = doc.internal.pageSize.getWidth();
        let height = doc.internal.pageSize.getHeight();

        // Cleanup description so it doesn't overrun
        let descArr = doc.splitTextToSize(this.project.description.replace(/(\r\n|\n|\r)/gm, ' '), width - 60);
        let descHeight = 0;
        _.each(descArr, (d) => {
          descHeight += doc.getTextDimensions(d).h;
        });

        doc.setFontSize(40)
        doc.setFont('Spectral-Bold');
        doc.text(10, 20, this.project.name);

        doc.setFontSize(20);
        doc.setFont('Roboto-Regular');
        doc.text(10, 40, descArr);

        // Draw all progress entries
        let prevNoteHeight = 0;
        let newPage = false;
        this.progress.forEach((p, i) => {

          // Offset on y is project description plus cumulative previous note heights, unless new pg just added
          let yOffset = newPage ? 20 : (descHeight+prevNoteHeight) + 50;
          if(newPage) newPage = false;

          // Line only for records past first
          if(i > 0)
            doc.line(10, yOffset, width-20, yOffset, 'FD');

          doc.setFontSize(14);
          doc.setDrawColor(0);

          // Circle for response #
          doc.setFillColor(circleColors[circleColorIndex]);

          if(circleColorIndex === 3)
            circleColorIndex = 0;
          else
            circleColorIndex++;

          doc.circle(16, yOffset + 10, 4, 'F');

          // Response #
          doc.setTextColor(255,255, 255);
          doc.text(14.5, yOffset + 12, (this.progress.length-i)+'');

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
            _.each(noteArr, (d) => {
              prevNoteHeight += doc.getTextDimensions(d).h;
            });
          }

          // If approaching height of page, add a page and reset cumulative height
          if((yOffset + prevNoteHeight) > (height-50)) {
            doc.addPage();
            newPage = true;
            descHeight = 0;
            prevNoteHeight = 0;
          }

          // Buffer
          prevNoteHeight += 20;

        });

        doc.addPage();

        // Add img under description
        doc.addImage(canvasImg, 'PNG', 0, 50 + descHeight, width, width);

        doc.save('results_' + this.project.slug + '_' + dt + '.pdf');

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
    
    if(confirm('Are you sure you want to delete this project'))
      this.deleteProject();

  }

}