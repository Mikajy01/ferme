import { Role } from "../enums/roles.enum";

export interface ICurrentUser {
  userId: string;
  email: string;
  role: Role;
  agenceCode: string;
}