# Sistema de Tipografía Centralizada Global

## 🎯 **Filosofía: "Set it and forget it"**

**TODO se aplica automáticamente. NO necesitas especificar font-family, color o tamaños en los componentes.**

## ⚡ **Aplicación Automática**

### Todos los elementos reciben automáticamente:
- **Font Family**: `var(--font-family-sans)` (sistema)
- **Color**: `var(--color-text-muted)` (#6b7280 - gris profesional)
- **Tamaños estándar**:
  - Texto general: **16px** (legible)
  - Labels: **14px** (compacto)
  - Ayuda: **12px** (discreto)

### Jerarquía de Títulos Automática:
```html
<h1>30px - Bold</h1>      <!-- Títulos principales -->
<h2>24px - Semibold</h2>  <!-- Secciones -->
<h3>20px - Semibold</h3>  <!-- Subsecciones -->
<h4>18px - Medium</h4>    <!-- Grupos -->
<h5>16px - Medium</h5>    <!-- Elementos -->
<h6>14px - Medium</h6>    <!-- Detalles -->
```

## 🛠 **Variables CSS Disponibles**

### Solo si necesitas customizar algo específico:
```css
--color-text-muted: #6b7280;   /* Color estándar */
--font-family-sans: [sistema];  /* Fuente estándar */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
```

## ✅ **Uso Recomendado**

### **Simplemente usa HTML semántico:**
```html
<!-- TODO automático - no agregues clases de tipografía -->
<h3>Título de Sección</h3>
<p>Texto normal que se ve perfecto</p>
<label>Etiqueta de formulario</label>
<input type="text" placeholder="Campo de texto">
<small>Texto de ayuda</small>
```

### **Solo si necesitas override específico:**
```html
<span class="text-large-override">Texto más grande</span>
<span class="text-small-override">Texto más pequeño</span>
```

## ❌ **Ya NO Hagas Esto**

```html
<!-- EVITAR: Ya no es necesario -->
<span class="text-standard">Texto</span>
<span style="font-family: var(--font-family-sans);">Texto</span>
<span style="color: var(--color-text-muted);">Texto</span>

<!-- USAR: Simplemente -->
<span>Texto</span>
```

## 🎨 **Acentuación**

Para destacar elementos, usa **peso de fuente**:
```html
<span class="font-medium">Texto medio</span>
<span class="font-semibold">Texto destacado</span>
<span class="font-bold">Texto muy destacado</span>
```

## 🏗 **Arquitectura**

1. **`global-typography.css`** - Reglas automáticas para todos los elementos
2. **Componentes** - Solo layout y funcionalidad, tipografía automática
3. **Variables CSS** - Centralizadas en `style.css`

## 🚀 **Beneficios**

1. **Cero configuración** - Escribes HTML, sale perfecto
2. **Consistencia total** - Imposible tener variaciones
3. **Mantenibilidad** - Un solo archivo controla toda la tipografía
4. **Performance** - Menos CSS repetido
5. **Clean Code** - Componentes enfocados en lógica, no estilos

### Familia de Fuentes
```css
--font-family-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
```

### Altura de Línea
```css
--line-height-tight: 1;      /* Para botones */
--line-height-normal: 1.5;   /* Texto normal */
--line-height-relaxed: 1.75; /* Texto espaciado */
```

### Pesos de Fuente
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

## Clases CSS Disponibles

### Clases de Utilidad
```css
.text-standard  /* 14px - Tamaño estándar para la aplicación */
.text-small     /* 12px - Texto de ayuda, notas */
.text-large     /* 18px - Texto destacado */
```

## Elementos con Tipografía Automática

Los siguientes elementos tienen tipografía consistente aplicada automáticamente:

- `input`, `textarea`, `select`, `button` → 14px
- `.label-text`, `.label` → 14px, peso medium
- `.label-text-alt` → 12px
- `table`, `th`, `td` → 14px
- `.btn` → 14px, peso normal, line-height tight

## Guía de Uso

### ✅ Recomendado
```html
<!-- Usar clases de utilidad con color automático -->
<span class="text-standard">Texto normal</span>
<span class="text-small">Texto de ayuda</span>

<!-- Usar variables CSS en estilos customizados -->
<style>
.custom-text {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-text-muted); /* Color estándar */
}
</style>

<!-- Para acentuación, usar font-weight -->
<span class="text-standard font-semibold">Texto destacado</span>
```

### ❌ Evitar
```html
<!-- No usar colores hardcodeados -->
<span style="color: #6b7280;">Evitar</span>
<span class="text-gray-500">Evitar</span>

<!-- No usar font-family inline -->
<style>
.bad-text {
  color: #1e293b; /* Usar variables */
  font-family: Arial, sans-serif; /* Evitar */
}
</style>
```

## Beneficios

1. **Consistencia**: Todos los elementos usan los mismos tamaños
2. **Mantenibilidad**: Cambios centralizados en las variables
3. **Escalabilidad**: Fácil agregar nuevos tamaños
4. **Performance**: Menor CSS duplicado
5. **Accesibilidad**: Tamaños consistentes y legibles

## Migración

Para migrar componentes existentes:

1. Reemplazar `text-sm` → `text-standard`
2. Reemplazar `text-xs` → `text-small`
3. Usar variables CSS en lugar de valores hardcodeados
4. Aplicar clases de utilidad para consistencia
