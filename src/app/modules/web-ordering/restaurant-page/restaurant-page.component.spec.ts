import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantPageComponent } from './restaurant-page.component';

describe('RestaurantPageComponent', () => {
  let component: RestaurantPageComponent;
  let fixture: ComponentFixture<RestaurantPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RestaurantPageComponent]
    });
    fixture = TestBed.createComponent(RestaurantPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
