import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected abstract readonly resource: string;

  protected get baseUrl(): string {
    return `${environment.apiUrl}/${this.resource}`;
  }

  protected post<TResponse, TRequest = unknown>(
    endpoint: string,
    body: TRequest,
  ): Observable<TResponse> {
    return this.http.post<TResponse>(`${this.baseUrl}/${endpoint}`, body);
  }
}
