import { Component, OnInit } from '@angular/core';

import { DataService } from '../utils/data.service';
import { AuthService } from '../utils/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  public userName: string;
  public explanationTxt: string;

  public profile: any;
  public projects: any[]

  public hasContent: boolean;
  public noProjects: boolean;

  constructor(private _dataSvc: DataService, private _authSvc: AuthService, private _router: Router) {}

  async ngOnInit() {

    // Watch for changes to the profile data
    this._authSvc.profile.subscribe(profile => {
      if(!profile || this.profile !== undefined) return;

      this.profile = profile;
      this.userName = profile.given_name || profile.name.split(/\s+/)[0];

    });

    let userId = this._dataSvc.userId.getValue();
    if(userId)
      this.getProjects(userId)
    else
    {
      this._dataSvc.userId.subscribe(id => {
        if(id) this.getProjects(id);
      });
    }
  }

  getProjects(userId) {

    this._dataSvc.getDataForUrl('/api/project/get/' + userId).subscribe((response: any) => {

      this.projects = response.projects;
      this.explanationTxt = response.text.newProject;
      this.hasContent = true;
      this.noProjects = !this.projects || this.projects.length === 0;

    });

  }

}
