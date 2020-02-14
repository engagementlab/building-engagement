import { Component, OnInit } from '@angular/core';
import { DataService } from '../utils/data.service';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  public content: any;
  public hasContent: boolean;

  public showPdf: boolean;

  constructor(private _dataSvc: DataService) {

    this.showPdf = environment.main;

  }

  ngOnInit() {
    
    this._dataSvc.getDataForUrl('/api/data/get/about').subscribe((response: any) => {

      this.content = response[0];
      this.hasContent = true;
      
    }); 
 
  }

}
