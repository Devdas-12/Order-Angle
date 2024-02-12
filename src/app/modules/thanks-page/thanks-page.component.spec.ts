import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThanksPageComponent } from './thanks-page.component';

describe('ThanksPageComponent', () => {
  let component: ThanksPageComponent;
  let fixture: ComponentFixture<ThanksPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThanksPageComponent]
    });
    fixture = TestBed.createComponent(ThanksPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
