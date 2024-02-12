import {CanActivate,Router,ActivatedRouteSnapshot,RouterStateSnapshot,CanActivateChild,UrlTree,} from '@angular/router';
import { Injectable } from '@angular/core';
// import { AuthService } from '../services/auth.service';
import { Helper } from './helper';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild { 
    permissions!: Array<any>;
    is_free_trial_expire: Boolean = false;
    is_payment_fail: Boolean = false;

    constructor(private router:Router , private _helper : Helper) { }

    async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree>  {
        return new Promise((resolve,rejects)=>{
            if(this._helper.jwt_token){
                resolve(true);
            }else{
                resolve(this.router.parseUrl('/'));
            }
        })
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
        return new Promise((resolve,rejects)=>{
            if(this._helper.jwt_token){
                resolve(true);
            }else{
                resolve(this.router.parseUrl('/'));
            }
        })
    }
}