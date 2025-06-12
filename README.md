# SICAAD-NUEVO

Proyecto con arquitectura separada:

- **Backend:** Laravel 12
- **Frontend:** Angular 19 (stand alone components)

## Instalación

### Backend (Laravel)

```sh
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

### Frontend (Angular)

```sh
cd frontend
npm install
ng serve
```

## Uso

1. Inicia el backend (`php artisan serve`).
2. Inicia el frontend (`ng serve`).
3. Accede a la aplicación desde tu navegador.

## Estructura

- `/backend`: Código fuente del backend (Laravel)
- `/frontend`: Código fuente del frontend (Angular)

---

> Recuerda configurar las variables de entorno y los permisos necesarios para el almacenamiento y la base de datos.