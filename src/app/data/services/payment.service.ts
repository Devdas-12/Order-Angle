import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { apiColletions } from 'src/app/core/constant/api-collection';
import { HttpParams } from '@angular/common/http';
import { Helper } from 'src/app/shared/helper';

export class LocationModel {
    latitude: number = 0;
    longitude: number = 0;
    address: string = '';
    city_name: string = '';
    country_name: string = '';
    country_code: string = '';
    state_code: string = '';
    state_name: string = '';
    constructor() { }
}

export interface CurrentLocation {
    city1: string,
    city2: string,
    city3: string,
    country: string,
    country_code: string,
    country_code_2: string,
    city_code: string,
    latitude: any,
    longitude: any,
    address: string
}


@Injectable({ providedIn: 'root' })
export class PaymentService {
    private cardUpdate = new BehaviorSubject<any>(null);
    _cardObservable = this.cardUpdate.asObservable();
    user_details : any ;
    storeData : any ;

    constructor(private _api: ApiService, private _helper: Helper) { 
        if(localStorage.getItem('userDetails')){
            this.user_details = JSON.parse(localStorage.getItem('userDetails') || '')
        }
        if(localStorage.getItem('store_data')){
            this.storeData = JSON.parse(localStorage.getItem('store_data') || '')
        }
    }

    get_card_key(): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            try {
                this._api.get({ url: apiColletions.get_card_key }).then((response) => {
                    resolve(response.data);
                });
            } catch (err) {
                resolve(false);
            }
        });
    }

    add_card({ payment_method, user_id, server_token, payment_id, expiry_month, expiry_year }: any): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            try {
                var parameters = {
                    type: 7, user_id, server_token, payment_id, payment_method,
                    card_expiry_date: expiry_month + "/" + expiry_year,
                }
                this._api.post({ url: apiColletions.add_card, parameters }).then((response) => {
                    if (response.success) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
            } catch (err) {
                resolve(false);
            }
        })
    }

    get_card_list({ user_id, server_token, payment_gateway_id }: any): Promise<Array<any>> {
        return new Promise((resolve, rejects) => {
            try {
                var parameters = { user_id: user_id, server_token: server_token, payment_gateway_id: payment_gateway_id , is_show_success_toast : false}
                this._api.post({ url: apiColletions.get_card_list, parameters }).then((response) => {
                    if (response.success) {
                        resolve(response.data.cards);
                    } else {
                        resolve([]);
                    }
                })
            } catch (err) {
                resolve([]);
            }
        })
    }

    select_card({ card_id , user_id , server_token }: any): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            try {
                var parameters = {
                    user_id: user_id, server_token: server_token , card_id , is_show_success_toast : false
                }
                this._api.post({ url: apiColletions.select_card, parameters }).then((response) => {
                    if (response.success) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
            } catch (err) {
                resolve(false);
            }
        })
    }

    delete_card(_id: any): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            try {
                this._api
                    .delete({ url: `${apiColletions.delete_card}/${_id}` })
                    .then((response) => {
                        resolve(response.data);
                        this.cardUpdate.next({});
                    });
            } catch (err) {
                resolve(false);
            }
        });
    }

    get_payment_key(parameters: any): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            try {

                let params = new HttpParams();
                params = params.set('subscriptionPlanId', parameters.subscriptionPlanId)
                params = params.set('currency', parameters.currency)

                this._api
                    .getwithparams({ url: apiColletions.get_payment_key, params: params })
                    .then((response) => {
                        resolve(response.data);
                        this.cardUpdate.next({});
                    });
            } catch (err) {
                resolve(false);
            }
        });
    }

    get_payment_gateway(location: any, user_id: any, server_token: any, cart_unique_token: any): Promise<{ is_cash_payment_mode: boolean, wallet: number, wallet_currency_code: string, payment_gateway: Array<any> }> {
        return new Promise((resolve, rejects) => {
            try {
                let type = 7
                let city_id = '';
                if (this._helper.is_qr_code_scanned) {
                    type = 2
                    city_id = this._helper.city_id
                }
                var parameters = {
                    cart_unique_token,
                    address: location.address,
                    city1: location.city_name,
                    city2: location.state_name,
                    city3: location.city_name,
                    city_code: location.state_code,
                    country: location.country_name,
                    country_code: location.country_code,
                    country_code_2: location.country_code,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    server_token: this.user_details?.userData?.server_token,
                    user_id: this.user_details?.userData?._id,
                    city_id: this.storeData.city_id,
                    type,
                    store: this._helper.store_id,
                    is_show_success_toast : false
                }
                this._api.post({ url: apiColletions.get_payment_gateway, parameters }).then((response) => {
                    if (response.success) {
                        resolve({ ...response.data });
                    } else {
                        resolve({
                            is_cash_payment_mode: false,
                            payment_gateway: [],
                            wallet: 0,
                            wallet_currency_code: ''
                        });
                    }
                })
            } catch (err) {
                resolve({
                    is_cash_payment_mode: false,
                    payment_gateway: [],
                    wallet: 0,
                    wallet_currency_code: ''
                });
            }
        })
    }

    get_stripe_add_card_intent({ payment_id }: any): Promise<string> {
        return new Promise((resolve, rejects) => {
            try {
                var parameters = { payment_id , is_show_success_toast : false }
                this._api.post({ url: apiColletions.get_stripe_add_card_intent, parameters }).then((response) => {
                    if (response.success) {
                        resolve(response.data.client_secret);
                    } else {
                        resolve('');
                    }
                })
            } catch (err) {
                resolve('');
            }
        })
    }

    get_stripe_payment_intent({ payment_id }: any): Promise<string> {
        return new Promise((resolve, rejects) => {
            try {
                var parameters = {
                    payment_id: '586f7db95847c8704f537bd5',
                    amount: 1000,
                    is_apple_google_pay: true,
                    transfer_group: '6597c1dfdd754be52660d74f',
                    user_id: '6596767bf562ddfb30f3f27c'
                }
                this._api.post({ url: apiColletions.get_stripe_payment_intent, parameters }).then((response) => {
                    if (response.success) {
                        resolve(response.data.client_secret);
                    } else {
                        resolve('');
                    }
                })
            } catch (err) {
                resolve('');
            }
        })
    }


}
