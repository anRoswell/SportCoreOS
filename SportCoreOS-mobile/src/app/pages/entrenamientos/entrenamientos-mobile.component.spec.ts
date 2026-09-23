import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { EntrenamientosMobileComponent } from './entrenamientos-mobile.component';

describe('EntrenamientosMobileComponent', () => {
  let component: EntrenamientosMobileComponent;
  let fixture: ComponentFixture<EntrenamientosMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntrenamientosMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntrenamientosMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
