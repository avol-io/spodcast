import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { debounceTime, delay, mergeMap, Observable, of, retryWhen, tap, throwError } from 'rxjs';
import { SpodcastError } from '../models/error.model';
import { AuthorizationService } from '../services/authorization.service';
@Injectable({
  providedIn: 'root',
})
export class SpotifyApiInterceptor implements HttpInterceptor {
  private delayTimeToPreventError = 0;
  private retryCount = 3;
  constructor(private auth: AuthorizationService) {
    //
  }

  includePath = ['api.spotify.com'];

  private isRequestToIntercept(requestUrl: string): boolean {
    let good = false;
    for (const address of this.includePath) {
      if (requestUrl.indexOf(address) >= 0) {
        good = true;
      }
    }
    return good;
  }
  /**
   * Intercepts http requests from the application to add a JWT auth token to the Authorization header if the user is logged in
   * @param request
   * @param next
   */

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // this.log.debug('intercept', request.url);
    // const newHeaders = request.headers;

    if (!this.isRequestToIntercept(request.url)) {
      return next.handle(request);
    }

    // create new request with these new header
    if (this.auth.getAuthInfo()) {
      request = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + this.auth.getAuthInfo()?.accessToken),
      });
    }
    return next.handle(request).pipe(
      debounceTime(this.delayTimeToPreventError),
      retryWhen((errors) =>
        errors.pipe(
          mergeMap((error: HttpErrorResponse) => {
            if (error.status == 429) {
              const time = error.headers.get('Retry-After');
              this.delayTimeToPreventError = time ? +time : 1000;
              return of(error).pipe(delay(this.delayTimeToPreventError));
            }
            return throwError(() => this.manageError(error));
          })
          //restart in 6 seconds
        )
      ),
      tap(() => {
        this.delayTimeToPreventError = 0;
      })
    );
  }

  manageError(httpError: HttpErrorResponse) {
    const error: SpodcastError = {};
    switch (httpError.status) {
      case 0:
        error.status = 0;
        error.title = 'ERROR.NO_INTERNET_BODY';
        error.title = 'ERROR.NO_INTERNET_TITLE';
        break;

      case 401:
      case 403:
        this.auth.logout(true);
        break;
      default:
        error.status = httpError.status;
        error.title = httpError.statusText;
        error.message = httpError.message;
    }
    return error;
  }
}
