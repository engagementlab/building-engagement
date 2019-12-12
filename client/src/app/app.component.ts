import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { environment } from '../environments/environment';

// Google Analytics function
declare let ga: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
 
  public isQABuild: boolean;
  
  title = 'Meetr';

  constructor(private _router: Router, private _active: ActivatedRoute, private _titleSvc: Title) {

    this.isQABuild = environment.qa;
    this._titleSvc.setTitle((this.isQABuild ? '(QA) ' : '') + this.title);
   
    // Subscribe to router events and send page views to Google Analytics,
    // if in production mode only
    // if(!environment.production) return;
    // if (environment.production && environment.qa) return;

    this._router.events.subscribe(event => {

      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }

    });
  }

  ngOnInit() {

    this._router.events.subscribe((evt) => {

      if (!(evt instanceof NavigationEnd))
        return;
  
      // Always go to top of page
      window.scrollTo(0, 0);
      
    });

  }

}