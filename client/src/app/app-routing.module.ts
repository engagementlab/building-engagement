import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectComponent } from './projects/project/project.component';
import { TrackComponent } from './projects/track/track.component';
import { ActivityComponent } from './activity/activity.component';
import { StudiesComponent } from './studies/studies.component';

import { AdminComponent } from './admin/admin.component';

import { NotFoundComponent } from './not-found/not-found.component';

import { AuthGuard } from './utils/auth.guard';
import { CallbackComponent } from './utils/callback/callback.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: 'callback/oauth',
    component: CallbackComponent
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'projects/:id',
    component: ProjectComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'projects/:id/track',
    component: TrackComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'track',
    component: TrackComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'studies',
    component: StudiesComponent
  },
  {
    path: 'talk',
    component: ActivityComponent
  },
  {
    path: 'talk/:project-slug',
    component: ActivityComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
