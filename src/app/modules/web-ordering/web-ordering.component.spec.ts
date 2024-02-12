import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebOrderingComponent } from './web-ordering.component';

describe('WebOrderingComponent', () => {
  let component: WebOrderingComponent;
  let fixture: ComponentFixture<WebOrderingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebOrderingComponent]
    });
    fixture = TestBed.createComponent(WebOrderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
