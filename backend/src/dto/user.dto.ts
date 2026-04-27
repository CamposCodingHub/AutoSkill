// DTOs (Data Transfer Objects) para separar entidades de banco de dados das APIs

export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  bio?: string | null;
  avatar?: string | null;
  phone?: string | null;
  createdAt: Date;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfileDTO {
  name?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface LoginResponseDTO {
  user: UserResponseDTO;
  token: string;
}

export interface RegisterResponseDTO {
  user: UserResponseDTO;
  token: string;
}

export interface PublicProfileDTO {
  user: {
    id: string;
    name: string;
    bio?: string | null;
    avatar?: string | null;
    role: string;
    createdAt: Date;
  };
  gamification: any | null;
  progress: any | null;
}
