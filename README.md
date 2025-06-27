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

1. Instala las dependencias:
   ```sh
   cd frontend
   npm install
   ```

2. Configura reCAPTCHA de Google:
   - Ve a [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
   - Crea una nueva clave para tu sitio
   - Anota la **Site Key** y **Secret Key**

3. Configura los archivos de entorno:
   ```sh
   # Copia los archivos de ejemplo
   cp src/environments/environment.example.ts src/environments/environment.ts
   cp src/environments/environment.prod.example.ts src/environments/environment.prod.ts
   
   # Edita los archivos y agrega tu Site Key de reCAPTCHA
   ```

4. Inicia el servidor de desarrollo:
   ```sh
   ng serve
   ```

## Configuración Adicional

### reCAPTCHA
- **Backend:** Agrega las claves de reCAPTCHA en el archivo `.env` del backend
- **Frontend:** Configura la Site Key en los archivos de entorno (`environment.ts` y `environment.prod.ts`)

### Variables de Entorno
- **Backend:** Copia `.env.example` a `.env` y configura la base de datos
- **Frontend:** Copia los archivos `environment.example.ts` a `environment.ts` y `environment.prod.ts`

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

## Descargo de responsabilidad

Este software se proporciona "tal cual", sin garantías de ningún tipo, expresas o implícitas. El uso del software es bajo su propio riesgo. Los autores y colaboradores no serán responsables de ningún daño o perjuicio derivado del uso de este software.