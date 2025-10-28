// auth.service.spec.ts
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/enums/roles.enum';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { InternalUserService } from 'src/modules/auth/services/internal-user.service';
import { LdapAuthService } from 'src/modules/auth/services/ldap-auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let ldapAuthService: jest.Mocked<LdapAuthService>;
  let internalUserService: jest.Mocked<InternalUserService>;

  beforeEach(() => {
    jwtService = {
      signAsync: jest.fn(),
    } as any;

    ldapAuthService = {
      authenticateWithLdap: jest.fn(),
    } as any;

    internalUserService = {
      findUserBySession: jest.fn(),
      validatePassword: jest.fn(),
    } as any;

    service = new AuthService(jwtService, ldapAuthService, internalUserService);
  });

  describe('login', () => {
    const dto = { session: 'sess123', password: 'pass' };

    it('doit lever une exception si utilisateur inconnu', async () => {
      internalUserService.findUserBySession.mockResolvedValue(null);

      await expect(service.login(dto))
        .rejects
        .toThrow(new UnauthorizedException('Utilisateur inconnu'));
    });

    it('doit lever une exception si le compte est désactivé', async () => {
      internalUserService.findUserBySession.mockResolvedValue({
        idUtilisateur: 'u0',
        session: 'sess123',
        nomComplet: 'Utilisateur Désactivé',
        role: Role.ADMIN,
        poste: 'poste',
        email: 'email@example.com',
        agenceCode: 'AG001',
        password: null,
        authType: 'local',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.login(dto))
        .rejects
        .toThrow(new UnauthorizedException('Compte désactivé'));
    });

    it('doit lever une exception si mot de passe invalide pour authType local', async () => {
      internalUserService.findUserBySession.mockResolvedValue({
        isActive: true,
        authType: 'local',
      } as any);
      internalUserService.validatePassword.mockResolvedValue(false);

      await expect(service.login(dto))
        .rejects
        .toThrow(new UnauthorizedException('Mot de passe incorrect'));
    });

    it('doit lever une exception si authentification LDAP échoue', async () => {
      internalUserService.findUserBySession.mockResolvedValue({
        isActive: true,
        authType: 'ldap',
        session: 'sess123',
      } as any);
      ldapAuthService.authenticateWithLdap.mockResolvedValue({
        isSuccess: false,
        message: 'Erreur LDAP',
      });

      await expect(service.login(dto))
        .rejects
        .toThrow(new UnauthorizedException('Erreur LDAP'));
    });

    it('doit lever une exception si type authType inconnu', async () => {
      internalUserService.findUserBySession.mockResolvedValue({
        isActive: true,
        authType: 'autre',
      } as any);

      await expect(service.login(dto))
        .rejects
        .toThrow(new UnauthorizedException('Type d\'authentification inconnu'));
    });

    it('doit retourner un token et un utilisateur (local)', async () => {
      const mockUser = {
        idUtilisateur: 'u1',
        nomComplet: 'Jean Dupont',
        role: 'admin',
        isActive: true,
        authType: 'local',
        password: 'hash',
        agenceCode: 'AG001',
      } as any;

      internalUserService.findUserBySession.mockResolvedValue(mockUser);
      internalUserService.validatePassword.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt_token');

      const result = await service.login(dto);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.idUtilisateur,
        username: mockUser.nomComplet,
        role: mockUser.role,
        agenceCode: mockUser.agenceCode,
      });
      expect(result).toEqual({
        access_token: 'jwt_token',
        user: expect.objectContaining({
          idUtilisateur: 'u1',
          nomComplet: 'Jean Dupont',
          role: 'admin',
          isActive: true,
          authType: 'local',
          agenceCode: 'AG001',
        }),
      });
      expect('password' in result.user).toBe(false);
    });

    it('doit retourner un token et un utilisateur (ldap)', async () => {
      const mockUser = {
        idUtilisateur: 'u2',
        nomComplet: 'Alice Martin',
        role: 'user',
        isActive: true,
        authType: 'ldap',
        password: 'hash',
        session: 'sess123',
        agenceCode: 'AG002',
      } as any;

      internalUserService.findUserBySession.mockResolvedValue(mockUser);
      ldapAuthService.authenticateWithLdap.mockResolvedValue({
        isSuccess: true,
        message: 'OK',
      });
      jwtService.signAsync.mockResolvedValue('jwt_token_ldap');

      const result = await service.login(dto);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.idUtilisateur,
        username: mockUser.nomComplet,
        role: mockUser.role,
        agenceCode: mockUser.agenceCode,
      });
      expect(result.access_token).toBe('jwt_token_ldap');
    });
  });
});
