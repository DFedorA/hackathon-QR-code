import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {User} from "../interfaces";
import {AuthService} from "../services/auth.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {AngularFireDatabase} from '@angular/fire/database';
import {Observable} from "rxjs";



@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.less']
})

export class LoginPageComponent implements OnInit {
  form: FormGroup;
  prism: string;
  qr_code: boolean = true;
  message: string
  imagePath = '../assets/qr-code-url.png';
  title = 'app';
  elementType = 'url';
  valueToken = ""
  stocks$: Observable<any>;

  constructor(
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private db: AngularFireDatabase

  ) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      if (params['loginAgain']) {
        this.message = 'Пожалуйста, введите данные'
      }
    })
    this.form = new FormGroup({
      email: new FormControl(null, []),
      password: new FormControl(null, [])
    })
    this.auth.loginAnon().subscribe(() => {
      let token = {
        [localStorage.getItem('fb-token-anon-2')]: ""
      }
      this.auth.create_token(token).subscribe(() => {
        console.log(localStorage.getItem('qr-name'))
        console.log(localStorage.getItem('fb-token-anon'))
        this.valueToken = localStorage.getItem('qr-name') + "," + localStorage.getItem('fb-token-anon-2')
        this.getIdWebsocket();
      })

    })

  }
  getIdWebsocket() {
    localStorage.setItem('checkEmptyLine', "0")
    let timerId = setInterval(() => {
      this.auth.getLocalId(localStorage.getItem('qr-name')).subscribe(()=>{
        if (localStorage.getItem('checkEmptyLine') === "1"){
          console.log("Зареган");
          clearInterval(timerId)
          let idTokenPush ={
          idToken:localStorage.getItem('fb-idToken')

          }
          console.log(idTokenPush)
          this.auth.registrationById(idTokenPush).subscribe(()=>{
            console.log("Зареган2");
            this.router.navigate(['/', 'home']);
          })

        }
      })
    }, 2000);

  }

  showSignup() {
    this.prism = "translateZ(-100px) rotateY( -90deg)";
  }

  showLogin() {
    this.prism = "translateZ(-100px)";
  }

  showQR() {
    this.prism = "translateZ(-100px) rotateX( -90deg)";
  }

  showThankYou() {
    this.prism = "translateZ(-100px) rotateX( 90deg)";
  }

  submit() {
    const user: User = {
      email: this.form.value.email,
      password: this.form.value.password
    }

    this.auth.login(user).subscribe(() => {
      this.form.reset();
      this.router.navigate(['/', 'home']);
    })
  }

}
