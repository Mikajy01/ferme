import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FindUsersQueryDto } from '../dtos/find-users-query.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Role } from 'src/common/enums/roles.enum';
import { UpdateUserStatusDto } from '../dtos/update-user-status.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UsersService } from '../services/users.service';
import { ICurrentUser } from 'src/common/interfaces/curent-user.interface';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UtilisateursController {
  constructor(private readonly usersService: UsersService) {}

  // Récupérer tous les utilisateurs avec pagination et filtres
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Récupérer tous les utilisateurs avec pagination et filtres',
  })
  findAll(
    @Query() query: FindUsersQueryDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.usersService.findAll(query, user);
  }

  @Patch('status/:session')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Changer le statut actif d’un utilisateur par session',
  })
  @ApiParam({ name: 'session', description: 'Session de l’utilisateur' })
  updateStatus(
    @Param('session') session: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatusBySession(session, dto.isActive);
  }

  // Créer un nouvel utilisateur
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // Mettre à jour un utilisateur
  @Patch('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiParam({ name: 'id', description: 'Id de l’utilisateur' })
  @ApiBody({ type: CreateUserDto })
  update(@Param('id') id: string, @Body() dto: CreateUserDto) {
    return this.usersService.update(id, dto);
  }

  // Récupérer les statistiques globales pour le dashboard admin
  @Roles(Role.ADMIN)
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Statistiques globales pour le dashboard admin' })
  async getDashboardStats() {
    return this.usersService.getDashboardStats();
  }
}
