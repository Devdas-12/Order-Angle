import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { apiColletions } from 'src/app/core/constant/api-collection';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';
import { Helper } from 'src/app/shared/helper';
import { ToastService } from './toastr.service';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private _userTokenUpdate = new BehaviorSubject<any>(null);
	_userTokenObservable = this._userTokenUpdate.asObservable();
	private _userDataUpdate = new BehaviorSubject<any>(null);
	_userdataObservable = this._userDataUpdate.asObservable();
	private _settingsUpdate = new BehaviorSubject<any>(null);
	_settingsObservable = this._settingsUpdate.asObservable();
	user: any;
	user_details: any;

	constructor(
		private _api: ApiService,
		private helper: Helper,
		private _http: HttpClient,
		private toastr: ToastService
	) { }

	get_settings(): Promise<boolean> {
		return new Promise((resolve, rejects) => {
			try {
				this._api.get({ url: apiColletions.user_settings }).then((response) => {
					this._settingsUpdate.next({ data: response.data.setting });
					resolve(response.data);
				});
			} catch (err) {
				resolve(false);
			}
		});
	}

	user_login(parameters: any): Promise<boolean> {
		return new Promise((resolve, rejects) => {
			try {
				this._api.post({ url: apiColletions.user_login, parameters })
					.then((response) => {
						this.helper.jwt_token = response.data.token;
						localStorage.setItem('login_token', response.data.token);
						this._userTokenUpdate.next({ token: response.data.token });
						// this._userDataUpdate.next({});
						this.get_user_profile();
						// this._userDataUpdate.next({});
					});
			} catch (err) {
				resolve(false);
			}
		});
	}

	user_register(parameters: any): Promise<boolean> {
		return new Promise((resolve, rejects) => {
			try {
				this._api.post({ url: apiColletions.user_register, parameters })
					.then((response) => {
						resolve(response.data);
					});
			} catch (err) {
				resolve(false);
			}
		});
	}

	get_user_profile(): Promise<boolean> {
		return new Promise((resolve, rejects) => {
			try {
				this._api.get({ url: apiColletions.get_user_profile })
					.then((response) => {
						this.helper.user_details = JSON.stringify(response.data);
						localStorage.setItem('login_data', JSON.stringify(response.data));
						this._userDataUpdate.next(response.data);
						resolve(response.data);
					});
			} catch (err) {
				resolve(false);
			}
		});
	}

	update_user_profile(parameters: any): Promise<boolean> {
		return new Promise((resolve, rejects) => {
			try {
				this._api.put({ url: apiColletions.get_user_profile, parameters })
					.then((response) => {
						// this._userDataUpdate.next({});
						resolve(response.data);
					});
			} catch (err) {
				resolve(false);
			}
		});
	}

	forgot_password_with_email(parameters: any): Promise<boolean> {
		return new Promise((resolve, rejects) => {
			try {
				this._api.post({ url: apiColletions.forgot_password_by_email, parameters })
					.then((response) => {
						resolve(response.data);
					});
			} catch (err) {
				resolve(false);
			}
		});
	}

	reset_password_with_email(parameters: any): Promise<boolean> {
		return new Promise((resolve, rejects) => {
			try {
				this._api.post({ url: apiColletions.reset_password_by_email, parameters })
					.then((response) => {
						resolve(response.data);
					});
			} catch (err) {
				resolve(false);
			}
		});
	}

	async user_varification(parameters: any): Promise<any> {
		try {
			const response = await this._api.post({ url: apiColletions.user_verification, parameters });
			return response;
		} catch (err) {
			return false;
		}
	}

	async otp_verification(parameters: any): Promise<any> {
		try {
			const response = await this._api.post({ url: apiColletions.otp_verification, parameters });

			if (response.data.success) {
				localStorage.setItem('userDetails', JSON.stringify(this.user_details));
				// this.toastr.showToast('success-toast', this.helper._translate.instant('success-code.196'))
			} else {
				// this.toastr.showToast('success-toast', 'OTP is incorrect')
			}
			return response.data;
		} catch (err) {
			return false;
		}
	}
	async check_user(parameters: any): Promise<any> {
		try {
			const response = await this._api.post({ url: apiColletions.check_user, parameters });
			// this.otp_verification({ ...parameters, otp: response.data.otp , is_show_success_toast : false });
			this.user_details = {
				isVerify: true,
				isUserAlreadyExist: response.data.success,
				userData: response?.data.user_data || ''
			}
			return response.data;
		} catch (err) {
			return false;
		}
	}

	async user_update(parameters: any): Promise<any> {
		try {
			const response = await this._api.post({ url: apiColletions.update_user, parameters });
			return response.data;
		} catch (err) {
			return false;
		}
	}
}
