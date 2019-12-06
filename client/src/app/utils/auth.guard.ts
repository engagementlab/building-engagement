import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate
{
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {

    let pending = true;
    let isAuthenticated = this.authService.isAuthenticated.getValue();

    this.authService.authCheckPending.subscribe(val => {

      pending = val;
      isAuthenticated = this.authService.isAuthenticated.getValue();

      if(!isAuthenticated && !pending)
        this.authService.showLoginPrompt();

    });

    if (isAuthenticated || pending)
      return true;

    this.authService.showLoginPrompt();

    return false;

  }
}
