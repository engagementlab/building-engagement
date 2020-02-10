import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { TimelineLite, Expo } from 'gsap';

import { environment } from '../../environments/environment';

import { DataService } from '../utils/data.service';
import { AuthService } from '../utils/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements AfterViewInit {

  public isAuthenticated: boolean;
  public showCaseStudies: boolean;

  private currentUrl: string;

  private tl: TimelineLite;
  
  constructor(private _router: Router, private authService: AuthService, private _dataSvc: DataService) { 

    // Toggle visibility of studies link
    this.showCaseStudies = environment.main;
  
    // Get nav route when nav ends
    _router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      this.currentUrl = _router.url;
    });

    // Watch for changes to the isAuthenticated state
    this.authService.isAuthenticated.subscribe(value => {
      this.isAuthenticated = value;
    });

    _dataSvc.menuOpen.subscribe(open => {
      if(open)
        this.open();
      else
        this.close();
    });
  }

  ngAfterViewInit() {

    let menu = document.getElementById('menu');
    let nav = document.getElementById('menu-nav');
    let line = document.getElementById('line');

   	this.tl = new TimelineLite({paused:true});
    
    let tl = this.tl;    
    tl.set(menu, {css: {zIndex: 50}});
    tl.fromTo(menu, .2, {autoAlpha:0}, {autoAlpha:1});
    tl.fromTo(nav, .7, {autoAlpha:0, left:'-5%'}, {autoAlpha:1, left:0, ease: Expo.easeOut}, '+.3');
    tl.fromTo(document.getElementById('signout'), .7, {autoAlpha:0, top:'-5%'}, {autoAlpha:1, top:0, ease: Expo.easeOut}, '+.4');
    tl.fromTo(line, .7, {autoAlpha:0, width:0}, {autoAlpha:1, width:'50%', ease: Expo.easeOut}, '+.35');

  }

  // Is passed route active?
  itemActive(route: string) {

    return '/'+route == this.currentUrl;

  }

  signOut() {

      this.authService.signOut();

  }

  open() {

    this.tl.play();

  }
  
  close() {

    this.tl.reverse();

  }
}
