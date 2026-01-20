import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Inject services using inject()
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  // Get signals from services
  users = this.userService.users;
  loading = this.userService.loading;
  error = this.userService.error;
  currentPage = this.userService.currentPage;
  totalPages = this.userService.totalPages;
  currentUser = this.authService.currentUser;

  // Local state
  tokenRemainingTime = signal<number>(0);

  ngOnInit(): void {
    this.loadUsers();
    this.updateTokenTime();
    // Update token time every minute
    setInterval(() => this.updateTokenTime(), 60000);
  }

  loadUsers(page: number = 1): void {
    this.userService.getUsers(page).subscribe({
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.loadUsers(page);
    }
  }

  retry(): void {
    this.userService.clearError();
    this.loadUsers(this.currentPage());
  }

  logout(): void {
    this.authService.logout();
  }

  private updateTokenTime(): void {
    this.tokenRemainingTime.set(this.authService.getTokenRemainingTime());
  }

  // Generate array for pagination
  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }
}
