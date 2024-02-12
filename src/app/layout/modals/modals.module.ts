import { NgModule } from "@angular/core";
import { UserProfileModalComponent } from "./user-profile-modal/user-profile-modal.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbDropdownModule, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { PipeModule } from "src/app/data/pipe/pipe.module";
import { AddCardComponent } from './add-card/add-card.component';
import { TranslateModule } from "@ngx-translate/core";
import { SidemenuModalComponent } from './sidemenu-modal/sidemenu-modal.component';

@NgModule({
    declarations : [ UserProfileModalComponent, AddCardComponent, SidemenuModalComponent ],
    imports : [ CommonModule , FormsModule , NgbModalModule , ReactiveFormsModule , PipeModule , TranslateModule , NgbDropdownModule] ,
    exports : [ UserProfileModalComponent , AddCardComponent , SidemenuModalComponent ]
})

export class ModalsModule { }