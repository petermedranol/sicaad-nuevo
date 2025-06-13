# SICAAD Frontend

Frontend de la aplicación SICAAD desarrollado con Angular 19 y componentes standalone.

## 🚀 Tecnologías

- **Angular 19** - Framework principal
- **TypeScript 5.7.2** - Lenguaje de programación
- **TailwindCSS 4.1.10** - Framework de CSS
- **DaisyUI 5.0.43** - Componentes UI
- **Lucide Angular** - Librería de iconos
- **Standalone Components** - Arquitectura moderna sin NgModules

## 🎨 Temas disponibles

La aplicación usa DaisyUI con soporte para múltiples temas. Para cambiar el tema, modifica el atributo `data-theme` en `src/index.html`:

```html
<html data-theme="corporate">
```

Temas recomendados:
- `corporate` (por defecto) - Tema corporativo limpio
- `business` - Tema oscuro profesional
- `emerald` - Tema verde moderno
- `cupcake` - Tema claro y amigable

## 🛠 Desarrollo

### Servidor de desarrollo
```bash
npm start
# o
ng serve
```
Navega a `http://localhost:4200/`

### Build
```bash
npm run build
# o
ng build
```

### Testing
```bash
npm test
# o
ng test
```

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── auth/                 # Módulo de autenticación
│   │   ├── guards/          # Guards de protección
│   │   ├── pages/           # Páginas de auth
│   │   └── services/        # Servicios de auth
│   ├── dashboard/           # Módulo dashboard
│   ├── shared/              # Componentes compartidos
│   │   └── layouts/         # Layouts de la app
│   ├── interceptors/        # Interceptors HTTP
│   └── app.routes.ts        # Configuración de rutas
├── styles.css               # Estilos globales + DaisyUI
└── index.html               # HTML principal
```

## 🔐 Autenticación

La aplicación usa autenticación basada en sesiones de Laravel con:
- **CSRF Protection** - Interceptor automático
- **Cookies de sesión** - Manejo automático
- **Guards de ruta** - Protección de rutas privadas
- **Estado de loading** - UX mejorada

## 🎯 Características del Login

- ✅ Diseño moderno con DaisyUI
- ✅ Iconos con Lucide Angular
- ✅ Mostrar/ocultar contraseña
- ✅ Estados de loading
- ✅ Validación en tiempo real
- ✅ Manejo de errores
- ✅ Diseño responsive
- ✅ Gradientes y animaciones

## 📝 Comandos útiles

```bash
# Generar componente standalone
ng generate component nombre --standalone

# Generar servicio
ng generate service services/nombre

# Generar guard funcional
ng generate guard guards/nombre --functional

# Servir con hot reload
ng serve --hmr
```

## 🔗 Integración con Backend

- **Base URL**: `http://localhost` (Laravel Sail)
- **API Endpoints**: `/api/*`
- **CORS**: Configurado para `localhost:4200`
- **Credentials**: `withCredentials: true` en todas las peticiones
