import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from 'src/app/utils/data.service';

@Component({
  selector: 'app-activity-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class ActivityIntroComponent implements OnInit {

  public content: any;

  public hasContent: boolean;
  public projectKey: string;

  constructor(private _dataSvc: DataService, private _route: ActivatedRoute) { }

  ngOnInit() {   

    this._route.params.subscribe(params => {

      if(params)
        this.projectKey = params['project-slug'];

    });
    
    this._dataSvc.getDataForUrl('/api/data/get/activity-intro').subscribe((response: any) => {

      this.content = response[0].instructions.html;
      this.hasContent = true;

    }); 
  }

}
