import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class LoaderService {

    private _isLoading:boolean = false;
    public _isMainLoading = false ;
    private loaderSubject = new BehaviorSubject<boolean>(false);
    loaderObservable:Observable<boolean> = this.loaderSubject.asObservable();

    get isLoading(){
        return this._isLoading = false ;
    }

    set isLoading(isLoading:boolean){
        this._isLoading = isLoading;
        this.loaderSubject.next(this._isLoading);        
    }


}