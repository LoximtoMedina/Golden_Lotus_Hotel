import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import authApi from '../../features/auth/api';
import type { components } from '../../types/api';

type ApiStatus = components['schemas']['Status'];

@Component({
  selector: 'app-authenticated-layout',
  imports: [CommonModule, Sidebar],
  templateUrl: './authenticated-layout.html',
  styleUrl: './authenticated-layout.css',
})
export class AuthenticatedLayout implements OnInit {
  isCheckingAuth = signal(true);

  constructor(private router: Router) {}

  ngOnInit(): void {
    void this.validateSession();
  }

  private async validateSession(): Promise<void> {
    try {
      const result = await authApi.fetch();

      if (this.isFetchSuccess(result)) {
        this.isCheckingAuth.set(false);
        return;
      }
    } catch {
      // Swallow error and redirect below.
    }

    this.isCheckingAuth.set(false);
    await this.router.navigate(['/login']);
  }

  private isFetchSuccess(response: unknown): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const result = response as { status?: ApiStatus; success?: boolean };
    return result.status === 'success' || result.success === true;
  }
}
