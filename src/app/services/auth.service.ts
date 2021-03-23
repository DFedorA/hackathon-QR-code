import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {FbAuthResponse, User} from 'src/app/interfaces';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from "../../environments/environment";
import {catchError, tap} from "rxjs/operators";


@Injectable()
export class AuthService {
  public error$: Subject<string> = new Subject<string>()
  constructor(private http: HttpClient) {}
  refQR:boolean = false;
  get token(): string {
    const expDate = new Date(localStorage.getItem('fb-token-exp'))
    if (new Date() > expDate) {
      this.logout()
      return null
    }
    return localStorage.getItem('fb-token')
  }

  login(user: User): Observable<any> {
    user.returnSecureToken = true;
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
      .pipe(
        tap(this.setToken),
        catchError(this.handleError.bind(this))
      )
  }
  loginAnon(): Observable<any> {
    let returnSecureTokenObj = {"returnSecureToken":true};
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.apiKey}`, returnSecureTokenObj)
      .pipe(
        tap(this.setTokenAnon),
        catchError(this.handleError.bind(this))
      )
  }

  logout() {
    this.setToken(null)
  }
  private handleError(error: HttpErrorResponse) {
    const {message} = error.error.error

    switch (message) {
      case 'INVALID_EMAIL':
        this.error$.next('Неверный email')
        break
      case 'INVALID_PASSWORD':
        this.error$.next('Неверный пароль')
        break
      case 'EMAIL_NOT_FOUND':
        this.error$.next('Такого email нет')
        break
    }

    return throwError(error)
  }
  isAuthenticated(): boolean {
    return !!this.token
  }
  isAuthenticatedQR(): boolean {
    return this.refQR
  }

  private setToken(response: FbAuthResponse | null) {
    if (response) {
      const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000)
      localStorage.setItem('fb-token', response.idToken)
      localStorage.setItem('email', response.email)
      localStorage.setItem('fb-token-exp', expDate.toString())
      console.log(response)
    } else {
      localStorage.clear()
    }
  }
  private setTokenAnon(response) {
    if (response) {
      localStorage.setItem('fb-token-anon', response.idToken)
      localStorage.setItem('fb-token-anon-2', response.localId)
      console.log("fb-token-anon",  response)
    } else {
      localStorage.clear()
    }
  }
  private checkAnswer(response) {
    this.refQR = false
    let checkChange = Object.values(response)
    if (checkChange[0] !== "") {
      localStorage.setItem('checkEmptyLine', "1")
      localStorage.setItem('fb-idToken',checkChange[0].toString())
      const expDate = new Date(new Date().getTime() + 3600 * 1000)
      localStorage.setItem('fb-token',checkChange[0].toString())
      localStorage.setItem('fb-token-exp', expDate.toString())

      console.log(response)
    }
  }
  private setQrCodeName(response) {
    this.refQR = false
    if (response) {
      localStorage.setItem('qr-name', response.name)
    } else {
      localStorage.clear()
    }
  }
  private registrationByIdLocal(response) {
    this.refQR = false
    if (response) {
      console.log(response)
      localStorage.setItem('email', response.users[0]["email"])
    } else {
      localStorage.clear()
    }
  }
  create_token(post):Observable<any> {
    this.refQR = true
    return this.http.post(`https://hackathon-app-62ab3-default-rtdb.firebaseio.com/tokens.json`, post)
      .pipe(
        tap(this.setQrCodeName),
        catchError(this.handleError.bind(this))
      );
  }
  getLocalId(id):Observable<any> {
    this.refQR = true
    return this.http.get(`https://hackathon-app-62ab3-default-rtdb.firebaseio.com/tokens/${id}.json`)
      .pipe(
        tap(this.checkAnswer),
        catchError(this.handleError.bind(this))
      );
  }
  registrationById(idToken):Observable<any> {
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${environment.apiKey}`,idToken)
      .pipe(
        tap(this.registrationByIdLocal),
        catchError(this.handleError.bind(this))
      );
  }
}
