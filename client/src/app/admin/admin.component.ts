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

  public content: any;
  public hasContent: boolean;

  constructor(private _dataSvc: DataService,
    private router: Router) { }

  ngOnInit() {

    this._dataSvc.isAdmin.subscribe({
      next: (isAdmin) => this.checkAdmin(isAdmin)
    })

    this._dataSvc.getDataForUrl('/api/data/get/admin').subscribe((response: any) => {

      this.content = response[1];
      this.hasContent = true;

      console.log(this.content);
    });

  }

  checkAdmin(isAdmin: boolean) {
    // TODO: Implement loading spinner over content since isAdmin.subscribe()
    //       takes a few seconds to return a value.

    if (!isAdmin) {
      if (environment.production) {
        this.router.navigate(['/'])
      } else {
        console.log('Skipped redirect to / in development.')
      }
    } else {
      console.log('You are an admin.')
    }
  }

}
