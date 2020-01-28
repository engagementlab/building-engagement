import { ElementRef } from '@angular/core';

import * as paper from 'paper';
import * as _ from 'underscore';
import { TweenLite, TimelineLite, Expo } from 'gsap';

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
      let mouseOverCurrent = {};
      let colors = ['#5a5c27', '#634da0', '#e85e5d', '#e9bbb0'];
      let colorIndex = -1;

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
        if (n === 1 || n === 3 || n === 7 || n === 9 || n === 12) {
          let txt = '-6';
          if (n === 3) txt = '-3';
          else if (n === 7) txt = '0';
          else if (n === 9) txt = '3';
          else txt = '6';

          let offset = (n === 1 || n === 7)? -45 : -20;
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

        if (colorIndex === 3) colorIndex = -1;
        colorIndex++;

        // X = half canvas width, plus half of sumX, by factor of width of grid box
        let xPos = (widthExt / 2) + ((survey.sumX / 2) * boxW),
          yPos = (heightExt / 2) - ((survey.sumY / 2) * boxW);

        segments.push(new p.Point(xPos, yPos));

        let g: paper.Group = new p.Group();
        let dot = new paper.Shape.Circle({
          center: [xPos, yPos],
          radius: 16,
          fillColor: colors[colorIndex]
        });

        let txt = new p.PointText({
          point: [xPos - 5, yPos + 5],
          content: i + 1,
          fillColor: 'white',
          fontSize: 16
        });
        let overlay = new paper.Path.Circle({
          center: [xPos, yPos],
          radius: 16,
          fillColor: 'white',
          opacity: 0
        });

        // Can't reference bounds before txt is created so we center the text here.
        txt.point = new paper.Point(
          xPos - txt.bounds.width / 2,
          txt.point.y,
        );

        // Layout the tooltip above the dot
        let data = new p.PointText({
          point: [xPos, yPos+5],
          justification: 'center',
          content: '(' + survey.sumX / 2 + ', ' + survey.sumY / 2 + ')',
          fillColor: new p.Color(255, 255, 255, 1),
          fontSize: 20,
          fontStyle: 'italic',
          opacity: 0
        });

        g.addChildren([dot, txt, data]);

        g.onMouseEnter = (event) => {
          console.log(i, mouseOverCurrent[i])
          if(mouseOverCurrent[i]) return;
          mouseOverCurrent[i] = true;
        };
        gLines.addChild(g);

        let anim;
        overlay.onMouseEnter = (event) => {
      
          anim = new TimelineLite();
          anim.to(dot, .6, {radius: '48', ease: Expo.easeInOut}, 'go');
          anim.to(txt, .6, {opacity: 0}, 'go');
          anim.to(data, .6, {opacity: 1}, 'go');
        };
        overlay.onMouseLeave = () => {
          anim.reverse();
        };
        gLines.addChild(overlay);

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
