import { ElementRef } from '@angular/core';

import * as paper from 'paper';
import * as _ from 'underscore';

export class ProjectGrid {

    progress: any[];
  
    canvasElement: ElementRef;
    isPhone: boolean;

    constructor(progress: any[], canvas: ElementRef, phone: boolean) {
        
      this.progress = progress;
      this.canvasElement = canvas;
      this.isPhone = phone;
        
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

}