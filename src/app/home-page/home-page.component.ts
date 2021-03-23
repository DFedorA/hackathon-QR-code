import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.less']
})
export class HomePageComponent implements OnInit {
      email:string
  constructor(private router: Router,
              public auth:AuthService
              ) {
 }

  ngOnInit(): void {
    this.email = localStorage.getItem('email')
  }
  logout(event: Event) {
    event.preventDefault();
    this.auth.logout();
    this.router.navigate(['/', 'login']);
  }
}
