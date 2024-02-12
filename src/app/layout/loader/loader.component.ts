import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from 'src/app/data/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {

  isLoading = false;
  loaderSubscription!:Subscription;

  constructor(public _loaderService:LoaderService) {}

  ngOnInit(): void {
    this.loaderSubscription = this._loaderService.loaderObservable.subscribe((loader:boolean)=>{
      this.isLoading = loader;
    })

  }
  
}
