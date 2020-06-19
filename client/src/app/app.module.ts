import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { AboutComponent } from './about/about.component';
import { ActivityComponent } from './activity/activity.component';
import { ActivityIntroComponent } from './activity/intro/intro.component';
import { AdminComponent } from './admin/admin.component';
import { AdminProjectComponent } from './admin/project/project.component';
import { CallbackComponent } from './utils/callback/callback.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';
import { NavComponent } from './nav/nav.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ProfileComponent } from './profile/profile.component';

import { ProjectComponent } from './projects/project/project.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectNewComponent } from './projects/new/new.component';

import { StudiesComponent } from './studies/studies.component';
import { TrackComponent } from './projects/track/track.component';

import { SignupSigninComponent } from './signup/signup.component';

import { HttpClient, HttpClientModule } from '@angular/common/http';

// Cloudinary
import { Cloudinary as CloudinaryCore } from 'cloudinary-core';
import { CloudinaryConfiguration, CloudinaryModule } from '@cloudinary/angular-5.x';
import cloudinaryConfiguration from './cdn.config';

import { CdnImageComponent } from './utils/cdn-image/cdn-image.component';
import { DataService } from './utils/data.service';
import { SanitizeHtmlPipe } from './utils/sanitize-html.pipe';

import { CarouselModule } from 'ngx-owl-carousel-o';

export const cloudinary = {
  Cloudinary: CloudinaryCore
};
export const config: CloudinaryConfiguration = cloudinaryConfiguration;

@NgModule({
  declarations: [
    CdnImageComponent,
    AppComponent,
    NavComponent,
    CallbackComponent,
    ProfileComponent,
    MenuComponent,
    ProjectsComponent,
    HomeComponent,
    TrackComponent,
    ProjectComponent,
    FooterComponent,
    AboutComponent,
    ActivityComponent,
    SanitizeHtmlPipe,
    StudiesComponent,
    NotFoundComponent,
    AdminComponent,
    AdminProjectComponent,
    ActivityIntroComponent,
    ProjectNewComponent,
    SignupSigninComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CloudinaryModule.forRoot(cloudinary, config),
    CarouselModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatTableModule,
  ],
  providers: [DataService, HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
