import { NgModule } from '@angular/core';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { WebOrderingComponent } from './web-ordering.component';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantPageComponent } from './restaurant-page/restaurant-page.component';
import { CommonModule } from '@angular/common';
import { OrderCheckoutComponent } from './order-checkout/order-checkout.component';
import { NgbCarouselModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from 'src/app/data/directive/directive.module';

const routes: Routes = [{
    path: '', component: WebOrderingComponent,
    children: [
        { path: '', redirectTo: 'landing-page', pathMatch: 'full' },
        { path: 'landing-page', component: LandingPageComponent },
        { path: 'restaurant-page', component: RestaurantPageComponent },
        { path: 'checkout', component: OrderCheckoutComponent }
    ]
}]

@NgModule({
    declarations: [
        WebOrderingComponent,
        LandingPageComponent,
        RestaurantPageComponent,
        OrderCheckoutComponent
    ],
    imports: [
        CommonModule,
        NgbDropdownModule,
        FormsModule,
        RouterModule.forChild(routes),
        TranslateModule,
        NgbCarouselModule,
        ReactiveFormsModule,
        DirectivesModule
    ],
    exports: [
        RouterModule
    ]
})
export class WebOrderingModule { }