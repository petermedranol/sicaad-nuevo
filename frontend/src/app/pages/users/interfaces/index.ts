import { User } from '../../../auth/interfaces/user.interface';

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}
