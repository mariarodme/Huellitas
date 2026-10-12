# Activar notificaciones push de Huellitas

El código para notificaciones con la aplicación cerrada está preparado, pero **no está desplegado ni activo** hasta completar estos pasos. GitHub Pages por sí solo no puede ejecutar tareas programadas.

1. Configura Firebase CLI en el proyecto `huellitas-aadf9` y habilita facturación Blaze (necesaria para Cloud Functions programadas). Desde el directorio del repositorio ejecuta `cd functions && npm install && cd ..`.
2. Genera un par de claves VAPID para Web Push (por ejemplo con `npx web-push generate-vapid-keys`). **Nunca publiques la clave privada en GitHub.**
3. En Firebase CLI establece los secretos `HUELLITAS_VAPID_PRIVATE_KEY` y `HUELLITAS_VAPID_PUBLIC_KEY` mediante `firebase functions:secrets:set NOMBRE`. Despliega con `firebase deploy --only functions --project huellitas-aadf9`.
4. Coloca **solo la clave pública** VAPID en `push-config.js`, en `window.HUELLITAS_VAPID_PUBLIC_KEY`. Publica ese cambio.
5. Abre Huellitas, inicia sesión y entra en Configuración. Pulsa **Activar avisos** en el dispositivo donde quieres recibir notificaciones.
6. Registra un recordatorio con fecha y hora. El programador revisa cada cinco minutos con zona horaria `America/Costa_Rica`. Los avisos pueden llegar con retraso; no son adecuados para emergencias ni para garantizar una dosis médica.

El backend `functions/index.js` incluye `registerPush`, `unregisterPush` y `sendReminders`. Comprueba la sesión y el permiso de la familia, y elimina suscripciones revocadas. Los documentos se almacenan en `users/{owner}/pushSubscriptions`; no requieren reglas públicas porque se escriben mediante funciones autenticadas.

**Limitaciones:** No se ha desplegado ni probado contra el Firebase real desde esta sesión. iOS requiere versión compatible y normalmente instalar la web en la pantalla de inicio. Si la clave pública está vacía, la interfaz de push permanece oculta y los recordatorios siguen funcionando solo con la app abierta.
