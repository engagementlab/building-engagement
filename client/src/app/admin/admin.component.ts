import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../utils/auth.service';
import { DataService } from '../utils/data.service';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminComponent implements OnInit {

  public allowAccess: boolean;
  public isLoading: boolean = true;
  public users: any;
  public hasContent: boolean;

  public hasProjects: boolean;
  public currentProjects: any[];

  constructor(private _dataSvc: DataService,
  private router: Router) { }

  ngOnInit() {

    this._dataSvc.isAdmin.subscribe({
      next: (isAdmin) => this.checkAdmin(isAdmin)
    });

  }

  checkAdmin(isAdmin: boolean) {

    this.isLoading = false;

    if (!isAdmin) {
      if (!environment.production)
        this.allowAccess = true;
    } else {
      this.allowAccess = true;

      // Get data
      this._dataSvc.getDataForUrl('/api/admin/get/users').subscribe((response: any) => {

        this.users = response;
        this.hasContent = true;

        console.log("Users: " + this.users);
      });
    }

  }

  viewProjects(projects: any[]) {
    this.hasProjects = typeof projects !== 'undefined' && projects.length > 0;
    this.currentProjects = projects;
    document.getElementById('projects-modal').style.display = 'flex';

  }

  closeProjects() {

    document.getElementById('projects-modal').style.display = 'none';

  }

}
