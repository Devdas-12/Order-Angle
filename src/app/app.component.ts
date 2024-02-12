import { Component, ViewChild } from '@angular/core';
import { LoaderService } from './data/services/loader.service';
import { LangService } from './shared/lang.service';
import { SidemenuModalComponent } from './layout/modals/sidemenu-modal/sidemenu-modal.component';
import { Helper } from './shared/helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'order-angel';

  @ViewChild('menuModel', { static: false }) menuModel!: SidemenuModalComponent;

  constructor(public loader: LoaderService, private langService: LangService , private _helper : Helper) { }

  ngOnInit() {
    this.loader._isMainLoading = true;
    this.langService.init();

    setTimeout(() => {
      this._helper.loadScript('/assets/js/custom.js');
      window.scroll(0, 0);
    }, 2000);
  }

}
