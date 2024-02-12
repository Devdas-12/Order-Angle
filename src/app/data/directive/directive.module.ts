import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from './clickOutSide.directive';
import { SwiperDirective } from './swiper.directive';
import { ScrollCenterDirective } from './scrollCenter.directive';
import { ScrollSpyDirective } from './scrollspy.directive';


@NgModule({
    declarations: [ClickOutsideDirective , SwiperDirective , ScrollCenterDirective , ScrollSpyDirective],
    imports: [
        CommonModule
    ],
    exports: [ ClickOutsideDirective , SwiperDirective , ScrollCenterDirective , ScrollSpyDirective ]
})
export class DirectivesModule { }
