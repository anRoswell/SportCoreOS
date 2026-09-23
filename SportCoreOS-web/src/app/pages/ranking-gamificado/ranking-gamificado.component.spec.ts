import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RankingGamificadoComponent } from './ranking-gamificado.component';

describe('RankingGamificadoComponent', () => {
  let component: RankingGamificadoComponent;
  let fixture: ComponentFixture<RankingGamificadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RankingGamificadoComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RankingGamificadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
