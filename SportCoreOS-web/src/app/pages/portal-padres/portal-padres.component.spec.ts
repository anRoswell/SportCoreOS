import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PortalPadresComponent } from './portal-padres.component';

describe('PortalPadresComponent', () => {
  let component: PortalPadresComponent;
  let fixture: ComponentFixture<PortalPadresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortalPadresComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortalPadresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
