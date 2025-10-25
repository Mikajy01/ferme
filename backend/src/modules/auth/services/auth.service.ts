import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { InternalUserService } from './internal-user.service';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly internalUserService: InternalUserService,
  ) { }

  async login(dto: LoginDto) {
    const user = await this.internalUserService.findUserBySession(dto.session);

    if (!user) {
      throw new UnauthorizedException('Utilisateur inconnu');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Compte désactivé');
    }

      const isValid = await this.internalUserService.validatePassword(user, dto.password);
      if (!isValid) {
        throw new UnauthorizedException('Mot de passe incorrect');
      }

    const payload: JwtPayload = {
      sub: user.idUser,
      username: user.name,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      access_token: token,
      user: userWithoutPassword,
    };
  }

}
