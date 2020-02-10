import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject, Observable, throwError, BehaviorSubject, ReplaySubject } from 'rxjs';

import { environment } from '../../environments/environment';

import * as _ from 'underscore';

import { map, catchError } from 'rxjs/operators';
import { Router, NavigationStart } from '@angular/router';

@Injectable()
export class DataService {

  public isLoading: Subject<boolean> = new Subject<boolean>();
  public serverProblem: Subject<boolean> = new Subject<boolean>();
  public menuOpen: Subject<boolean> = new Subject<boolean>();

  public previousUrl: string;
  public currentUrl: string;

  public userId: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public isAdmin: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  public currentProjectId: string;

  private baseUrl: string;

  constructor(private http: HttpClient, private _router: Router) {

  	this.baseUrl = (environment.production ? 'https://'+window.location.host : 'http://localhost:3000');

    _router.events.subscribe(event => {

      this.currentUrl = this._router.url;
      // Track prior url
      if (event instanceof NavigationStart) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      }

    });
  }

  public getDataForUrl(urlParam: string): Observable<any> {

    this.isLoading.next(true);
    this.serverProblem.next(false);

    let url = this.baseUrl;
    url += urlParam;
    url += `?domain=${environment.main ? 'main' : 'city'}`;

    return this.http.get(url)
    .pipe(
      map((res:any)=> {

      this.isLoading.next(false);

      return res;
      }),
      catchError(err => throwError(err)));

  }

  public sendDataToUrl(urlParam: string, formData: any): Observable<any> {

    this.isLoading.next(true);
    this.serverProblem.next(false);

    let url = this.baseUrl;
    url += urlParam;

    return this.http.post(url, formData)
    .pipe(
      map((res:any)=> {
        this.isLoading.next(false);
        return res;
      }),
      catchError(err => throwError(err))
    );

  }

}
