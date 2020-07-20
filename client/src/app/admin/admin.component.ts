import { Component, OnInit, ViewChild, Inject, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { DataService } from '../utils/data.service';

import { environment } from '../../environments/environment';

export interface DialogData {
 projects: undefined
}

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

  public displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  public dataSource;

  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild('projectsDialog', {static: false}) projectsDialog: TemplateRef<any>

  constructor(
    private _dataSvc: DataService,
    private router: Router,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {

    this.displayedColumns = ['user.name', 'user.email', 'user.lastLogin', 'latestSurveyDate'];

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

        this.dataSource = new MatTableDataSource(response);
        this.hasContent = true;
        
        this.dataSource.sortingDataAccessor = (item, property) => {
          
          switch(property) {
            case 'user.name': return item.user.name;
            case 'user.lastLogin': return !item.user.lastLogin ? null : new Date(item.user.lastLogin);
            case 'latestSurveyDate': return !item.latestSurveyDate ? null : new Date(item.latestSurveyDate);
            default: return item.user[property];
          }
          
        };          
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }, 100);

      });
    }

  }

  viewProjects(projects: any[]) {
    
    this.hasProjects = typeof projects !== 'undefined' && projects.length > 0;
    if(!this.hasProjects) {
      this.openSnackBar();
      return;
    }

    this.currentProjects = projects;
    this.dialog.open(this.projectsDialog, {width: '500px', height: '500px', data: projects});

  }

  openSnackBar() {
    
    this._snackBar.open('This user has no projects.', 'Close', {
      duration: 2000,
    });
  
  }

  closeProjects() {

    this.dialog.closeAll();

  }

}