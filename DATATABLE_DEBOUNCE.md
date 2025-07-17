# DataTable Search Debounce

## Implementación

Se ha agregado un debounce de 300ms al search del DataTable para mejorar la experiencia de usuario y reducir la carga en el servidor.

### Cambios realizados:

1. **Imports actualizados**: Se agregó `debounceTime` de RxJS
2. **Nuevo Subject**: Se creó `searchSubject$` para manejar los términos de búsqueda
3. **Suscripción en ngOnInit**: Se configuró el debounce con un delay de 300ms
4. **Método onSearch simplificado**: Ahora solo emite el valor al subject

### Beneficios:

- **Mejor UX**: No se realizan múltiples peticiones mientras el usuario escribe
- **Menor carga del servidor**: Se reducen las peticiones HTTP innecesarias
- **Mejor rendimiento**: Se evita el procesamiento excesivo durante la escritura

### Configuración:

- **Delay**: 300ms (configurable en el pipe debounceTime)
- **Comportamiento**: Solo se ejecuta la búsqueda cuando el usuario deja de escribir por 300ms
- **Limpieza**: Se cancela automáticamente en ngOnDestroy
