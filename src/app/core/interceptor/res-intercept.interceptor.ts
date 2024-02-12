import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
// import { AuthService } from '../services/auth.service';
import { catchError, tap } from 'rxjs/operators';
// import { TranslateService } from '@ngx-translate/core';
import { Helper } from 'src/app/shared/helper';
import { ToastService } from 'src/app/data/services/toastr.service';
import { TOAST_STATE } from '../constant/constant';

@Injectable()
export class ResInterceptInterceptor implements HttpInterceptor {
  constructor(private _helper: Helper, private toastr: ToastService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((evt) => {
        if (evt instanceof HttpResponse && evt.body) {
          if (evt.body.success) {
            if (req.body && req.body.is_show_success_toast !== false) {
              var successMessage = this._helper._translate.instant('success-code.' + evt.body.message);

              var errorMessage = evt.body.status_phrase;
              if (!evt.body.status_phrase) {
                if (successMessage) {
                  this.toastr.showToast('success-toast', successMessage);
                } else {
                  this.toastr.showToast(
                    'success-toast',
                    evt.body.status_phrase
                  );
                }
              }
            }
          } else {
            if (evt.body.error_code === 999) {
              // this._auth.user_logout();
              this._helper._route.navigate(['/']);
              window.location.reload();
              localStorage.removeItem('userDetails')
            }
            if (
              evt.body.success != undefined &&
              !evt.body.success &&
              req.body &&
              req.body.is_show_error_toast !== false
            ) {
              var errorMessage = this._helper._translate.instant('error-code.' + evt.body.error_code);
              // var errorMessage = evt.body.error_code;
              if (errorMessage && !errorMessage.includes(evt.body.error_code)) {
                this.toastr.showToast('danger-toast', errorMessage);
              }
              if (evt.body.error_message) {
                this.toastr.showToast('danger-toast', evt.body.error_message);
              }
            }
          }
        }
      }),
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.error.message) {
            this.toastr.showToast(TOAST_STATE.danger, err.error.message);
          } else if (err.error.error) {
            this.toastr.showToast(TOAST_STATE.danger, 'error');
          } else if (err.status == 401) {
            if (err.error.message) {
              this.toastr.showToast(TOAST_STATE.danger, err.error.message);
            } else {
              this.toastr.showToast(TOAST_STATE.danger, err.error);
              localStorage.removeItem('adminType');
              localStorage.removeItem('adminPermissions');
              localStorage.removeItem('token');
              this._helper.jwt_token = '';
              this._helper._route.navigate(['/auth/login']);
            }
          } else if (err.status == 404) {
            this.toastr.showToast(TOAST_STATE.danger, err.error.message);
          } else {
            this.toastr.showToast(
              TOAST_STATE.danger, 'Internal server error');
          }
        }
        return of(err);
      })
    );
  }
}
