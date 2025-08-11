/**
 * Interfaces y tipos para el módulo de usuarios
 */

export interface User {
  id: number;
  name: string;
  email: string;
  photo_path?: string;
  photo_hash?: string;
  created_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdateUserData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

export interface UserFormData extends CreateUserData {}

/**
 * Constantes del módulo de usuarios
 */
export const USER_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  ANIMATION_DURATION: 300,
  PHOTO_CONFIG: {
    MAX_WIDTH: 400,
    MAX_HEIGHT: 400,
    QUALITY: 0.8
  }
} as const;
