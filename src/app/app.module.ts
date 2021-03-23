import {NgModule, Provider} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {RouterModule} from "@angular/router";
import { LoginPageComponent } from './login-page/login-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import {ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "./services/auth.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthGuard} from "./services/auth.guard";
import { NgxQRCodeModule } from 'ngx-qrcode2';


import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import {AuthInterceptor} from "./services/auth.interceptor";

export const config  = {
  apiKey: "AIzaSyAZ5tXasg6Dt2nwokvKtI1hjxnOuWyYjVA",
  authDomain: "hackathon-app-62ab3.firebaseapp.com",
  databaseURL: "https://hackathon-app-62ab3-default-rtdb.firebaseio.com",
  projectId: "hackathon-app-62ab3",
  storageBucket: "hackathon-app-62ab3.appspot.com",
  messagingSenderId: "388868620518",
  appId: "1:388868620518:web:ee6fabc0974ba10fc83b27"
};

const INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  multi: true,
  useClass: AuthInterceptor
}

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    HomePageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(config),
    AngularFirestoreModule, // firestore
    AngularFireAuthModule, // auth
    AngularFireStorageModule, // storage
    NgxQRCodeModule,
    RouterModule.forChild([
      {
        path: '', component: AppComponent, children: [
          {path: '', redirectTo: '/login', pathMatch: "full"},
          {path: 'login', component: LoginPageComponent},
          {path: 'home', component: HomePageComponent,canActivate:[AuthGuard]}
        ]
      }
    ]),
    ReactiveFormsModule
  ],
  exports:[
    RouterModule,
    HttpClientModule
  ],
  providers: [AuthService, AuthGuard,INTERCEPTOR_PROVIDER],
  bootstrap: [AppComponent]
})
export class AppModule { }
