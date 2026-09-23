import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AlertToastComponent } from './alert-toast.component';

describe('AlertToastComponent', () => {
  let component: AlertToastComponent;
  let fixture: ComponentFixture<AlertToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertToastComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
