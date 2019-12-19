import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';

import * as auth0 from 'auth0-js';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  authCheckPending = new BehaviorSubject(false);
  isAuthenticated = new BehaviorSubject(false);
  promptLogin = new BehaviorSubject(false);
  prompSignup = new BehaviorSubject(false);
  profile = new BehaviorSubject < any > (null);

  private auth0Client: Auth0Client;
  private auth0JSWebAuth: auth0.WebAuth;

  // Auth0 application configuration
  config = {
    domain: "elabmeetr.auth0.com",
    client_id: "efOEnNblz6mqHaH8plFSUZ6Tm3Oe5d9p",
    redirect_uri: `${window.location.origin}/callback`
  };

  getAuth0JS(): any {

    if (!this.auth0JSWebAuth) {

      this.auth0JSWebAuth = new auth0.WebAuth({
        domain: this.config.domain,
        clientID: this.config.client_id
      });

    }

    return this.auth0JSWebAuth;

  }

  /**
   * Gets the Auth0Client instance.
   */
  async getAuth0Client(): Promise < Auth0Client > {

    if (!this.auth0Client) {
      this.authCheckPending.next(true);
      this.auth0Client = await createAuth0Client(this.config);

      let checkAuth = await this.auth0Client.isAuthenticated()

      // Provide the current value of isAuthenticated
      this.isAuthenticated.next(checkAuth);

      // debugger
      
      // Whenever isAuthenticated changes, provide the current value of `getUser`, if profile not set
      this.isAuthenticated.subscribe(async isAuthenticated => {
        this.authCheckPending.next(false);
        
        if (isAuthenticated) {
          // Refresh token
          await this.auth0Client.getTokenSilently();
          
          this.profile.next(await this.auth0Client.getUser());
          return;
        }
      });
    }

    return this.auth0Client;

  }

  showLoginPrompt() {

    if (!this.isAuthenticated.value)
      this.promptLogin.next(true);


  }

  signOut() {

    this.auth0Client.logout();

  }

  // Handle login via user/pass (using auth0 webauth, not auth0-spa)
  public loginUserPass(user: string, password: string): Observable < any > {

    this.auth0JSWebAuth = new auth0.WebAuth({
      domain: this.config.domain,
      clientID: this.config.client_id
    });

    return Observable.create(observer => {

      this.auth0JSWebAuth.login({

        email: user,
        password: password,
        responseType: 'token',
        redirectUri: this.config.redirect_uri + '/oauth'

      }, (err, authResult) => {

        if (err)
          observer.next(err);

        if (authResult && authResult.id_token && authResult.access_token) {
          observer.complete(authResult);
        }
      });

    });

  }

  public parseLoginResult(): Observable < any > {

    this.auth0JSWebAuth = new auth0.WebAuth({
      domain: this.config.domain,
      clientID: this.config.client_id
    });

    return Observable.create(observer => {

      this.auth0JSWebAuth.parseHash({
        hash: window.location.hash
      }, (err, authResult) => {

        if (err)
          throw throwError(err);

        if (!authResult)
          return;

        this.auth0JSWebAuth.client.userInfo(authResult.accessToken, (err, user) => {

          if (err)
            throw throwError(err);

          observer.next(user);

        });

      });

    });
  }


}