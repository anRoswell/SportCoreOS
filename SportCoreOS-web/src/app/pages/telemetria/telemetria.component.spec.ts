import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TelemetriaComponent } from './telemetria.component';

describe('TelemetriaComponent', () => {
  let component: TelemetriaComponent;
  let fixture: ComponentFixture<TelemetriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelemetriaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TelemetriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
