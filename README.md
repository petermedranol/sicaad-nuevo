# SICAAD-NUEVO

Proyecto con arquitectura separada:

- **Backend:** Laravel 12 (usando Sail/Docker)
- **Frontend:** Angular 19 (stand alone components)

## Instalación

### Backend (Laravel + Sail)

```sh
cd backend
composer install
cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate
```

### Frontend (Angular)

```sh
cd frontend
npm install
ng serve
```

## Uso

1. Levanta el backend con Sail:  
   ```sh
   cd backend
   ./vendor/bin/sail up -d
   ```
2. Inicia el frontend:  
   ```sh
   cd frontend
   ng serve
   ```
3. Accede a la aplicación desde tu navegador.

## Estructura

- `/backend`: Código fuente del backend (Laravel)
- `/frontend`: Código fuente del frontend (Angular)

---

> Recuerda configurar las variables de entorno y los permisos necesarios para el almacenamiento y la base de datos.