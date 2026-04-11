import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsTypes } from './rooms-types';

describe('RoomsTypes', () => {
  let component: RoomsTypes;
  let fixture: ComponentFixture<RoomsTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomsTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomsTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
