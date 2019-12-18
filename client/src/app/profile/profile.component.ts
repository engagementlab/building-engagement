import { Component, OnInit, OnDestroy } from '@angular/core';

import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { AuthService } from '../utils/auth.service';
import { DataService } from '../utils/data.service';

import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

import { clearAllBodyScrollLocks } from 'body-scroll-lock';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  public profile: any;

  public authInit: boolean;
  public isAuthenticated: boolean;
  public showSignin: boolean;

  private auth0Client: Auth0Client;

  constructor(private authService: AuthService,
              private _dataSvc: DataService,
              private _router: Router)
  {
    _router.events.pipe(filter(e => e instanceof NavigationStart))
                  .subscribe((e: NavigationStart) => { 
                  
                    this.showSignin = !(e.url === '/signin' || e.url === '/signup');
                    clearAllBodyScrollLocks(); 
                  
                  });
  }

  async ngOnInit() {

    // Get an instance of the Auth0 client
    this.auth0Client = await this.authService.getAuth0Client();

    // Watch for changes to the isAuthenticated state
    this.authService.isAuthenticated.subscribe(value => {
      this.isAuthenticated = value;
    });

    // Watch for changes to the profile data
    this.authService.profile.subscribe(profile => {

      if(!profile) return;

      this.profile = profile;
      this.createOrGetUser(profile);

    });

    // Prompt for login as needed
    this.authService.promptLogin.subscribe(prompt => {
      // Send to signin page
      if(prompt) {
        this._router.navigateByUrl('/signin')
      }
    });

    this.authInit = true;

  }

  async ngOnDestroy() {
    clearAllBodyScrollLocks();
  }

  createOrGetUser(profile: any) {

    if(!profile) return;

    let data = {
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
      img: profile.picture
    };

    this._dataSvc.sendDataToUrl('/api/user/exists', data).subscribe((response: any) => {
      this._dataSvc.userId.next(response._id);
    });

    this._dataSvc.getDataForUrl('/api/user/admin/' + profile.sub).subscribe((response: any) => {
      this._dataSvc.isAdmin.next(response);
    });

  }

  /**
   * Logs the user out of the applicaion, as well as on Auth0
   */
  logout() {

    this.auth0Client.logout({
      client_id: this.authService.config.client_id,
      returnTo: window.location.origin
    });

  }
}
