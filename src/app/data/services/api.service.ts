import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Helper } from "src/app/shared/helper";
import { environment } from "src/environments/environment";
import { LoaderService } from "./loader.service";

export interface ResponseModel {
    success: boolean;
    code: string
    data: any;
}

@Injectable({
    providedIn: 'root'
})

export class ApiService { 
    private API_URL = environment.API_URL;
    
    constructor(private _http: HttpClient, public helper: Helper , private _loader : LoaderService) { }

    post({ url, parameters } : any): Promise<ResponseModel> {
        // if (this.helper.jwt_token) {
            var headers = new HttpHeaders()
                // .set('Authorization', `Bearer ${this.helper.jwt_token}`);
                .set('lang' , '0');
        // }
        return new Promise((resolve, rejects) => {
            try {
                this._loader.isLoading = true;
                var call_url = this.API_URL + url;
                this._http.post(call_url, parameters , {headers : headers}).toPromise().then((responseData : any) => {
                    setTimeout(() => {
                        this._loader.isLoading = false;
                    }, 1000);
                    if(responseData){
                        resolve({ success: true, code: '200' , data: responseData })
                    } else{
                        resolve({success : false , code : '' , data : null})
                    }
                })
            } catch (err) {
                this._loader.isLoading = false;
                resolve({ success: false, code: "2003", data: null });
            }
        });
    }

    get({ url } : any): Promise<ResponseModel> {
        if (this.helper.jwt_token) {
            var headers = new HttpHeaders()
                // .set('Authorization', `Bearer ${this.helper.jwt_token}`);
                .set('Authorization', `Bearer ${localStorage.getItem('login_token')}`);
        }
        return new Promise((resolve, rejects) => {
            try {
                this._loader.isLoading = true;
                var call_url = this.API_URL + url;
                this._http.get(call_url , {headers : headers}).toPromise().then((responseData:any) => {
                    // if (responseData['success']) {
                        setTimeout(() => {
                            this._loader.isLoading = false;
                        }, 1000);
                        if(responseData){
                            setTimeout(() => { 
                            }, 1000);
                            resolve({ success: true, code: '', data: responseData })
                        }else{
                        resolve({ success: false, code: '', data: null })
                    }
                })
            } catch (err) {
                this._loader.isLoading = false;
                resolve({ success: false, code: "2003", data: null });
            }
        });
    }

    getCountry({ url } : any): Promise<ResponseModel> {
        return new Promise((resolve, rejects) => {
            try {
                this._loader.isLoading = true;
                this._http.get(url).toPromise().then((responseData:any) => {
                    // if (responseData['success']) {
                        this._loader.isLoading = false;
                        if(responseData){
                            setTimeout(() => { 
                            }, 1000);
                            resolve({ success: true, code: '', data: responseData })
                        }else{
                        resolve({ success: false, code: '', data: null })
                    }
                })
            } catch (err) {
                this._loader.isLoading = false;
                resolve({ success: false, code: "2003", data: null });
            }
        });
    }

    getwithparams({ url , params} : any): Promise<ResponseModel> {
        if (this.helper.jwt_token) {
            var headers = new HttpHeaders()
                // .set('Authorization', `Bearer ${this.helper.jwt_token}`);
                .set('Authorization', `Bearer ${localStorage.getItem('login_token')}`);
        }
        return new Promise((resolve, rejects) => {
            try {
                this._loader.isLoading = true;
                var call_url = this.API_URL + url;
                this._http.get(call_url , { params: params, headers: headers }).toPromise().then((responseData:any) => {
                    // if (responseData['success']) {
                        setTimeout(() => { 
                            this._loader.isLoading = false;
                        }, 2000);
                        // this.helper.is_loading = false;
                        resolve({ success: true, code: '', data: responseData })
                    // }else{
                    //     resolve({ success: responseData['success'], code: responseData['error_code'], data: null })
                    // }
                })
            } catch (err) {
                this._loader.isLoading = false;
                resolve({ success: false, code: "2003", data: null });
            }
        });
    }

    put({ url, parameters } : any): Promise<ResponseModel> {
        if (this.helper.jwt_token) {
            var headers = new HttpHeaders()
                // .set('Authorization', `Bearer ${this.helper.jwt_token}`);
                .set('Authorization', `Bearer ${localStorage.getItem('login_token')}`);
        }
        return new Promise((resolve, rejects) => {
            try {
                this._loader.isLoading = true;
                var call_url = this.API_URL + url;
                this._http.put(call_url , parameters , {headers : headers}).toPromise().then((responseData:any) => {
                    this._loader.isLoading = false;
                        resolve({ success: true, code: '', data: responseData })
                })
            } catch (err) {
                this._loader.isLoading = false;
                resolve({ success: false, code: "2003", data: null });
            }
        });
    }

    delete({ url } : any): Promise<ResponseModel> {
        if (this.helper.jwt_token) {
            var headers = new HttpHeaders()
                // .set('Authorization', `Bearer ${this.helper.jwt_token}`);
                .set('Authorization', `Bearer ${localStorage.getItem('login_token')}`);
        }
        this._loader.isLoading = true;
        return new Promise((resolve, rejects) => {
            try {
                var call_url = this.API_URL + url;
                this._http.delete(call_url , {headers : headers}).toPromise().then((responseData:any) => {
                        resolve({ success: true, code: '', data: responseData })
                        this._loader.isLoading = false;
                })
            } catch (err) {
                this._loader.isLoading = false;
                resolve({ success: false, code: "2003", data: null });
            }
        });
    }
}