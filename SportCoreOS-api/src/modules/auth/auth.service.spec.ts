import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';

describe('AuthService (Password & Captcha Security Suite)', () => {
  let service: AuthService;
  let mockAuthRepository: Partial<AuthRepository>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    mockAuthRepository = {
      findByEmailWithClub: jest.fn(),
      updateLastAccess: jest.fn().mockResolvedValue(undefined),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('Captcha Anti-Bot Engine', () => {
    it('debe generar un reto Captcha con captchaId, SVG y TTL válido', () => {
      const captcha = service.generateCaptcha();
      expect(captcha).toBeDefined();
      expect(captcha.captchaId).toMatch(/^cap_/);
      expect(captcha.svg).toContain('<svg');
      expect(captcha.svg).toContain('</svg>');
      expect(captcha.expiresInSeconds).toBe(300);
    });

    it('debe validar exitosamente cuando la respuesta coincide (case-insensitive)', () => {
      const captcha = service.generateCaptcha();
      // Obtenemos el código de la tienda interna
      const internalItem = (service as any).captchaStore.get(captcha.captchaId);
      expect(internalItem).toBeDefined();

      const isValid = service.verifyCaptcha(captcha.captchaId, internalItem.code.toLowerCase());
      expect(isValid).toBe(true);
    });

    it('debe rechazar respuesta incorrecta y eliminar token tras un uso válido', () => {
      const captcha = service.generateCaptcha();
      const isInvalid = service.verifyCaptcha(captcha.captchaId, 'WRONG_CODE');
      expect(isInvalid).toBe(false);

      // Sigue existiendo tras fallo
      expect((service as any).captchaStore.has(captcha.captchaId)).toBe(true);

      // Ahora verificamos con código correcto
      const internalItem = (service as any).captchaStore.get(captcha.captchaId);
      const isNowValid = service.verifyCaptcha(captcha.captchaId, internalItem.code);
      expect(isNowValid).toBe(true);

      // Ya no debe existir (un solo uso)
      expect((service as any).captchaStore.has(captcha.captchaId)).toBe(false);
    });
  });

  describe('Login con Verificación de Seguridad', () => {
    it('debe lanzar BadRequestException si el captcha no es válido', async () => {
      const captcha = service.generateCaptcha();

      await expect(
        service.login('test@sportcore.com', 'SportCore@2026', captcha.captchaId, 'INCORRECTO'),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe permitir login cuando las credenciales y el captcha son válidos', async () => {
      const captcha = service.generateCaptcha();
      const internalItem = (service as any).captchaStore.get(captcha.captchaId);

      const mockUser = {
        id: 'usr-1',
        email: 'test@sportcore.com',
        nombre: 'Carlos',
        apellido: 'Valderrama',
        rol: 'DIRECTOR_DEPORTIVO',
        password_hash: '$2b$10$KbmGUBQ8u6EXvYczFm/liehMnYCGUlkzcaCKYZnCF26ZR5hvBAPj.', // SportCore@2026
        activo: true,
        club_id: 'clb-1',
        club_nombre: 'Club Test',
        club_slug: 'club-test',
        club_logo: 'logo.png',
      };

      (mockAuthRepository.findByEmailWithClub as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login(
        'test@sportcore.com',
        'SportCore@2026',
        captcha.captchaId,
        internalItem.code,
      );

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@sportcore.com');
    });
  });
});
