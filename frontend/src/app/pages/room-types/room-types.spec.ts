import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomTypes } from './room-types';

describe('RoomsTypes', () => {
  let component: RoomTypes;
  let fixture: ComponentFixture<RoomTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
