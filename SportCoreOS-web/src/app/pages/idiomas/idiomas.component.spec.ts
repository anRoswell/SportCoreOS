import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { IdiomasComponent } from './idiomas.component';

describe('IdiomasComponent', () => {
  let component: IdiomasComponent;
  let fixture: ComponentFixture<IdiomasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdiomasComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IdiomasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
