# Huellitas — etapa multiusuario

La web publicada actualmente sigue siendo una versión local de prueba. NO usarla para expedientes reales sensibles ni asumir que sincroniza.

## Configurar Supabase
1. Crear un proyecto en https://supabase.com/dashboard (no compartir contraseña).
2. Abrir SQL Editor y ejecutar `supabase/schema.sql` en un proyecto nuevo.
3. En Authentication > URL Configuration, configurar Site URL: https://mariarodme.github.io/Huellitas/
4. Agregar https://mariarodme.github.io/Huellitas/ a Redirect URLs.
5. Habilitar confirmación de correo y configurar SMTP para producción.
6. Compartir únicamente la URL del proyecto y la clave **publishable/anon**. NUNCA service_role, secret key, contraseña o token de acceso.

## Pendiente antes de lanzar el registro
- Conectar interfaz con Supabase Auth y CRUD por usuario.
- Crear invitaciones con aceptación autenticada, permisos de cuidadores y auditoría.
- Migración voluntaria desde almacenamiento local (no borrar registros locales).
- Almacenamiento privado de archivos y políticas de acceso.
- Pruebas de seguridad con dos cuentas diferentes.
- Recordatorios reales: necesitan infraestructura de ejecución y permisos de notificación.

El código del sitio publicado permanece intacto hasta completar y probar la migración.
