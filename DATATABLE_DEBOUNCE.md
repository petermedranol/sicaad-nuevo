# DataTable Search Debounce

## Implementación

Se ha agregado un debounce de 300ms al search del DataTable para mejorar la experiencia de usuario y reducir la carga en el servidor.

### Cambios realizados:

1. **Imports actualizados**: Se agregó `debounceTime` de RxJS y el icono `X` de Lucide
2. **Nuevo Subject**: Se creó `searchSubject$` para manejar los términos de búsqueda
3. **Suscripción en ngOnInit**: Se configuró el debounce con un delay de 300ms
4. **Método onSearch simplificado**: Ahora solo emite el valor al subject
5. **Botón de limpiar**: Se agregó un botón X que aparece cuando hay texto en el input
6. **Método clearSearch**: Función para limpiar el campo de búsqueda

### Características UX:

- **Icono dinámico**: Muestra lupa por defecto, X cuando hay texto
- **Botón de limpiar**: Aparece solo cuando hay contenido en el input
- **Hover effects**: El botón X tiene efectos de hover para mejor usabilidad
- **Espaciado ajustado**: El input tiene padding derecho para el botón X

### Beneficios:

- **Mejor UX**: No se realizan múltiples peticiones mientras el usuario escribe
- **Menor carga del servidor**: Se reducen las peticiones HTTP innecesarias
- **Mejor rendimiento**: Se evita el procesamiento excesivo durante la escritura
- **Fácil limpieza**: Un clic para limpiar el campo de búsqueda

### Configuración:

- **Delay**: 300ms (configurable en el pipe debounceTime)
- **Comportamiento**: Solo se ejecuta la búsqueda cuando el usuario deja de escribir por 300ms
- **Limpieza**: Se cancela automáticamente en ngOnDestroy
