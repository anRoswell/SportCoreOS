import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, timeout, retry } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RequestOptions {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  skipLoading?: boolean;
  skipErrorToast?: boolean;
  timeoutMs?: number;
  retries?: number;
}

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const { headers, params } = this.buildHeadersAndParams(options);
    const timeoutMs = options?.timeoutMs || 15000;
    const retries = options?.retries !== undefined ? options.retries : 1;

    return this.http
      .get<T>(url, { headers, params })
      .pipe(timeout(timeoutMs), retry(retries));
  }

  post<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const { headers, params } = this.buildHeadersAndParams(options);
    const timeoutMs = options?.timeoutMs || 20000;

    return this.http
      .post<T>(url, body, { headers, params })
      .pipe(timeout(timeoutMs));
  }

  patch<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const { headers, params } = this.buildHeadersAndParams(options);
    const timeoutMs = options?.timeoutMs || 20000;

    return this.http
      .patch<T>(url, body, { headers, params })
      .pipe(timeout(timeoutMs));
  }

  put<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const { headers, params } = this.buildHeadersAndParams(options);
    const timeoutMs = options?.timeoutMs || 20000;

    return this.http
      .put<T>(url, body, { headers, params })
      .pipe(timeout(timeoutMs));
  }

  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const { headers, params } = this.buildHeadersAndParams(options);
    const timeoutMs = options?.timeoutMs || 15000;

    return this.http
      .delete<T>(url, { headers, params })
      .pipe(timeout(timeoutMs));
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  private buildHeadersAndParams(options?: RequestOptions): {
    headers: HttpHeaders;
    params: HttpParams;
  } {
    let headers = new HttpHeaders(options?.headers || {});

    if (options?.skipLoading) {
      headers = headers.set('X-Skip-Loading', 'true');
    }
    if (options?.skipErrorToast) {
      headers = headers.set('X-Skip-Error-Toast', 'true');
    }

    let params = new HttpParams();
    if (options?.params) {
      Object.keys(options.params).forEach((key) => {
        const val = options.params![key];
        if (val !== undefined && val !== null && val !== '') {
          params = params.set(key, String(val));
        }
      });
    }

    return { headers, params };
  }
}
