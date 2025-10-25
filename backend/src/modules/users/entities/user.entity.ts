export class UserEntity {
  idUser: string;
  session: string;
  name: string;
  firstName: string;
  password?: string;
  isActive: boolean;
  role: string; // "USER", "ADMIN"
  createdAt: Date;
  updatedAt: Date;
}