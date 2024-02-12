import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidemenuModalComponent } from './sidemenu-modal.component';

describe('SidemenuModalComponent', () => {
  let component: SidemenuModalComponent;
  let fixture: ComponentFixture<SidemenuModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidemenuModalComponent]
    });
    fixture = TestBed.createComponent(SidemenuModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
