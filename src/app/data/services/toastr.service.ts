import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, interval, map, take } from 'rxjs';
import { TOAST_STATE } from 'src/app/core/constant/constant';
import { ToastrComponent } from 'src/app/layout/toastr/toastr.component';



@Injectable({
  providedIn: 'root',
})
export class ToastService {
  source = interval(20);
  counter$: any;
  // The boolean that drives the toast's 'open' vs. 'close' behavior
  public showsToast$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  // The message string that'll bind and display on the toast
  public toastMessage$: BehaviorSubject<string> = new BehaviorSubject<string>(
    'Default Toast Message'
  );

  // The state that will add a style class to the component
  public toastState$: BehaviorSubject<string> = new BehaviorSubject<string>(
    TOAST_STATE.success
  );
  public isHovered$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private autoDismissTimer: any;

  constructor(public snackBar: MatSnackBar) { }

  showToast(toastState: string, toastMsg: string): void {
    // Observables use '.next()' to indicate what they want done with observable
    // This will update the toastState to the toastState passed into the function
    // if (toastMsg != undefined) {
    //   this.counter$ = this.source.pipe(
    //     take(97),
    //     map((value) => value + 1)
    //   );

    //   this.toastState$.next(toastState);

    // //   // This updates the toastMessage to the toastMsg passed into the function
    //   this.toastMessage$.next(toastMsg);

    // //   // This will update the showsToast trigger to 'true'
    //   this.showsToast$.next(true);

    //   this.autoDismissTimer = setTimeout(() => {
    //     this.dismissToast();
    //   }, 2000);
    // }

    if (toastMsg != undefined) {
      this.snackBar.openFromComponent(ToastrComponent, {
        data: toastMsg,
        panelClass: toastState,
        duration: 2000
      });
    }
  }

  dismissToast(): void {
    this.showsToast$.next(false);
  }

  togglePauseOnHover(isHovered: boolean): void {
    clearTimeout(this.autoDismissTimer);

  }
}
