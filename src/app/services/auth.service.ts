import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = environment.tokenKey;
  private tokenExpiryKey = environment.tokenExpiry;
  private tokenDuration = environment.tokenValidityDuration;

  // test credentials
  private validUsers = [
    { email: 'jagrati@gmail.com', password: '123456789' }
  ];

  private _isAuthenticated = signal<boolean>(this.hasToken());
  private _currentUser = signal<string | null>(this.getStoredUser());

  isAuthenticated = this._isAuthenticated.asReadonly();
  currentUser = this._currentUser.asReadonly();

  constructor(private router: Router) {
    this.checkExpiry();
  }

  login(creds: LoginRequest): Observable<LoginResponse> {
    return new Observable<LoginResponse>((observer) => {
      setTimeout(() => {
        // check if user exists
        let user = this.validUsers.find(u => u.email === creds.email && u.password === creds.password);

        if (user) {
          let token = this.createToken();
          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem(this.tokenExpiryKey, (Date.now() + this.tokenDuration).toString());
          localStorage.setItem('user_email', creds.email);

          this._isAuthenticated.set(true);
          this._currentUser.set(creds.email);

          observer.next({ token });
          observer.complete();
        } else {
          observer.error(new Error('Wrong email or password. Try again.'));
        }
      }, 500);
    });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
    localStorage.removeItem('user_email');

    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.hasToken() && !this.isExpired();
  }

  isExpired(): boolean {
    let expiry = localStorage.getItem(this.tokenExpiryKey);
    if (!expiry) return true;

    if (Date.now() > parseInt(expiry)) {
      this.logout();
      return true;
    }
    return false;
  }

  getTokenRemainingTime(): number {
    let expiry = localStorage.getItem(this.tokenExpiryKey);
    if (!expiry) return 0;

    let remaining = parseInt(expiry) - Date.now();
    return Math.max(0, Math.floor(remaining / 60000));
  }

  private createToken(): string {
    // simple random token
    return 'token_' + Math.random().toString(36).substr(2) + Date.now();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  private getStoredUser(): string | null {
    return localStorage.getItem('user_email');
  }

  private checkExpiry() {
    if (this.hasToken() && this.isExpired()) {
      this._isAuthenticated.set(false);
      this._currentUser.set(null);
    }
  }
}
