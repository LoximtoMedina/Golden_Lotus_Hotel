import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import authApi from '../../features/auth/api';
import type { components } from '../../types/api';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

type ApiStatus = components['schemas']['Status'];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './login.html',
})
export class Login {
  credentials = {
    email: '',
    password: '',
  };

  faEyeIcon = faEyeSlash;
  showPassword = false;
  public toggleShowPassword(){
    this.showPassword = !this.showPassword;
    this.faEyeIcon = this.showPassword ? faEye : faEyeSlash;
  }


  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private router: Router) {}

  async onLogin() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    try {
      const result = await authApi.login({
        email: this.credentials.email,
        accessKey: this.credentials.password,
      });

      if (this.isLoginSuccess(result)) {
        await this.router.navigate(['/clients']);
        return;
      }

      this.errorMessage.set(this.extractErrorMessage(result));
    } catch (error) {
      this.errorMessage.set(this.extractErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  private isLoginSuccess(response: unknown): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const result = response as { status?: ApiStatus; success?: boolean };
    return result.status === 'success' || result.success === true;
  }

  private extractErrorMessage(payload: unknown): string {
    if (!payload || typeof payload !== 'object') {
      return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
    }

    const error = payload as { message?: string; status?: ApiStatus; error?: string };

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }

    if (error.status) {
      return this.getStatusMessage(error.status);
    }

    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }

    return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
  }

  private getStatusMessage(status: ApiStatus): string {
    switch (status) {
      case 'forbidden':
        return 'Credenciales inválidas.';
      case 'invalid-request':
        return 'Revisa el correo y la contraseña.';
      case 'internal-error':
        return 'Error interno del servidor.';
      default:
        return 'No se pudo iniciar sesión.';
    }
  }
}
