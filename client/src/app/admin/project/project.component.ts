import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from 'src/app/utils/data.service';
import { ProjectGrid } from 'src/app/project-grid';

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
  public progress: any[];

  canvasElement: ElementRef;

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

  constructor(private _dataSvc: DataService,
    private _route: ActivatedRoute) { }

  ngOnInit() {

    this._dataSvc.isAdmin.subscribe({
      next: (isAdmin) => this.checkAdmin(isAdmin)
    });

  }

  checkAdmin(isAdmin: boolean) {
    
    if (isAdmin) {
      this.allowAccess = true;

      this._route.params.subscribe(params => {
        // Get data
        this._dataSvc.getDataForUrl('/api/admin/get/project/'+params['projectId']).subscribe((response: any) => {

          this.project = response.project;
          this.progress = response.progress;
          this.hasContent = true;

        });
      });

    }
    
  }

  export() {
    
    let img = this.canvasElement.nativeElement.toDataURL("image/png");
    let tab = <any>window;
    let newTab = tab.open();
    
    newTab.document.write('<img src="'+img+'"/>');

  }

}
