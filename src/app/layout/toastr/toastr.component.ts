import { TOAST_STATE } from 'src/app/core/constant/constant';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject } from '@angular/core';
import { ToastService } from 'src/app/data/services/toastr.service';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-toastr',
  templateUrl: './toastr.component.html',
  styleUrls: ['./toastr.component.scss'],
  animations: [
    trigger('toastTrigger', [
      // This refers to the @trigger we created in the template
      state('open', style({ transform: 'translateY(0%)' })), // This is how the 'open' state is styled
      state('close', style({ transform: 'translateY(-200%)' })), // This is how the 'close' state is styled
      transition('open <=> close', [
        // This is how they're expected to transition from one to the other
        animate('300ms ease-in-out'),
      ]),
    ]),
  ],
})
export class ToastrComponent {
  toastClass!: string[];
  toastMessage!: string;
  showsToast!: boolean;
  TOAST_STATE = TOAST_STATE ;

  constructor(public toast: ToastService , readonly snackBar: MatSnackBar,  @Inject(MAT_SNACK_BAR_DATA) public data: any) {}

  ngOnInit(): void {}

  dismiss(): void {
    this.toast.dismissToast();
  }
}
