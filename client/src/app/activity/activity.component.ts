import { Component, OnInit } from '@angular/core';
import { DataService } from '../utils/data.service';

import { TweenLite } from 'gsap';
import { OwlOptions, SlidesOutputData } from 'ngx-owl-carousel-o';
import { ActivatedRoute } from '@angular/router';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {

  public activities: any[];
  public currentActivity: number = 0;

  public projectKey: string;
  public pdfUrl: string;
  
  public showPdf: boolean;
  
  customOptions: OwlOptions = {
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    autoHeight: true,
    dots: true,
    items: 1,
    navSpeed: 700
  }

  constructor(private _dataSvc: DataService, private _route: ActivatedRoute) {

    this.showPdf = environment.main;
  }

  ngOnInit() {   

    this._route.params.subscribe(params => {

      if(params)
        this.projectKey = params['project-slug'];

    });
    
    this._dataSvc.getDataForUrl('/api/data/get/activity').subscribe((response: any) => {

      this.activities = response[1];
      
      if(response[0].guidePdf)
        this.pdfUrl = response[0].guidePdf.url;
  
    }); 
  }
  
  gotoNext() { 
  
    this.goto(0, true);
  
  }

  goto(activityIndex: number, next: boolean) {

    TweenLite.to(document.querySelector('.activity.a_' + this.currentActivity), 1.2, {opacity:0, display: 'none', onComplete:() => {
      TweenLite.fromTo(document.querySelector('.activity.a_' + this.currentActivity), 1.2, {opacity:0}, {opacity:1, display: 'block'});
    }});
    
    if(next)
      this.currentActivity++;
    else
      this.currentActivity = activityIndex;

  }

  sliderInit(activityIndex: Number, ref: any) {

    setTimeout(() => {
      let dots = document.querySelector('.activity.a_' + activityIndex + ' .owl-dots');
      dots.appendChild(document.querySelector('.activity.a_' + activityIndex + ' .arrow'));
    }, 100);

  }

  slideChange(data: SlidesOutputData, activityIndex: Number) {
    
    let slidesNum = document.querySelectorAll('.activity.a_' + activityIndex + ' .owl-item').length;
    let dots = document.querySelector('.activity.a_' + activityIndex + ' .owl-dots');
    let dotsArrow = document.querySelector('.activity.a_' + activityIndex + ' .arrow');
    let end = (slidesNum-1 === data.startPosition);
    
    if (end) {
      if(activityIndex < 3)
        dots.classList.add('end');
      else
        document.getElementById('track').classList.value = 'end';
    }
    else {
      document.getElementById('track').classList.value = '';
      dots.classList.remove('end');
    }

    if (activityIndex < 3)
      TweenLite.to(dotsArrow, .7, {opacity: end?1:0, delay: end?.6:0});

  }

}
