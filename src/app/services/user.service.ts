import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map, finalize } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'https://jsonplaceholder.typicode.com';
  private usersPerPage = 5;

  // state
  private _users = signal<User[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _currentPage = signal<number>(1);
  private _totalPages = signal<number>(2);

  users = this._users.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  currentPage = this._currentPage.asReadonly();
  totalPages = this._totalPages.asReadonly();

  constructor(private http: HttpClient) {}

  getUsers(page: number = 1): Observable<User[]> {
    this._loading.set(true);
    this._error.set(null);

    // fetch users from JSONPlaceholder API
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map((allUsers) => {
        // API returns 10 users, we paginate locally
        let start = (page - 1) * this.usersPerPage;
        let end = start + this.usersPerPage;
        let totalPages = Math.ceil(allUsers.length / this.usersPerPage);
        this._totalPages.set(totalPages);
        return allUsers.slice(start, end);
      }),
      tap((users) => {
        this._users.set(users);
        this._currentPage.set(page);
      }),
      catchError((err: HttpErrorResponse) => {
        let msg = this.handleError(err);
        this._error.set(msg);
        return throwError(() => new Error(msg));
      }),
      finalize(() => {
        this._loading.set(false);
      })
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`).pipe(
      catchError((err: HttpErrorResponse) => {
        let msg = this.handleError(err);
        return throwError(() => new Error(msg));
      })
    );
  }

  clearError() {
    this._error.set(null);
  }

  retry() {
    this.getUsers(this._currentPage()).subscribe();
  }

  private handleError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Cannot connect to server. Check your internet.';
    }
    if (err.status === 404) {
      return 'Not found.';
    }
    if (err.status === 401) {
      return 'Session expired. Login again.';
    }
    if (err.status >= 500) {
      return 'Server error. Try again later.';
    }
    return 'Something went wrong.';
  }
}