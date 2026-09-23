import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BiometriaComponent } from './biometria.component';

describe('BiometriaComponent', () => {
  let component: BiometriaComponent;
  let fixture: ComponentFixture<BiometriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiometriaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BiometriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
