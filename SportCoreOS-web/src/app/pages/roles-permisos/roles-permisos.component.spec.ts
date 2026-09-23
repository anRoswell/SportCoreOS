import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RolesPermisosComponent } from './roles-permisos.component';

describe('RolesPermisosComponent', () => {
  let component: RolesPermisosComponent;
  let fixture: ComponentFixture<RolesPermisosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesPermisosComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesPermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
