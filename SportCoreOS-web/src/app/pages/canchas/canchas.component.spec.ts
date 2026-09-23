import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CanchasComponent } from './canchas.component';

describe('CanchasComponent', () => {
  let component: CanchasComponent;
  let fixture: ComponentFixture<CanchasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanchasComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CanchasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
