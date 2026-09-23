import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { JuegoCarreraMobileComponent } from './juego-carrera-mobile.component';

describe('JuegoCarreraMobileComponent', () => {
  let component: JuegoCarreraMobileComponent;
  let fixture: ComponentFixture<JuegoCarreraMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuegoCarreraMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JuegoCarreraMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
