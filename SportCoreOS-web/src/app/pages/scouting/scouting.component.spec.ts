import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ScoutingComponent } from './scouting.component';

describe('ScoutingComponent', () => {
  let component: ScoutingComponent;
  let fixture: ComponentFixture<ScoutingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoutingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
