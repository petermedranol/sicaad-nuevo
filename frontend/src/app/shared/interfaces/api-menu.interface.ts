export interface ApiMenuResponse {
  success: boolean;
  data: {
    menus: ApiMenuItem[];
    user_info: {
      id: number;
      name: string;
      email: string;
      user_type: string | null;
      campus: string | null;
    };
  };
  message?: string;
  error?: string;
}

export interface ApiMenuItem {
  id: number;
  name: string;
  icon: string | null;
  link: string | null;
  description: string | null;
  order: number;
  is_free: boolean;
  children: ApiMenuItem[];
}

export interface MenuAccessResponse {
  success: boolean;
  data: {
    menu_id: number;
    menu_name: string;
    has_access: boolean;
    access_level: string | null;
    is_free: boolean;
  };
  message?: string;
  error?: string;
}

