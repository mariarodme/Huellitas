# Preparación multiusuario (sin publicar al público)

Estado: planificación y pruebas privadas. No se han desplegado nuevas reglas de Firebase.

## Modelo actual
- Firebase Authentication identifica cada cuenta mediante su UID.
- El expediente principal está en users/{ownerUid}/data/huellitas.
- Los permisos familiares se guardan en users/{ownerUid}/sharing/access.
- Las solicitudes de ingreso están en users/{ownerUid}/familyRequests/{requesterUid}.
- Los adjuntos locales no se sincronizan automáticamente.

## Comprobaciones obligatorias antes de invitar a usuarios externos
1. Inspeccionar las reglas **realmente publicadas** en Firebase Console > Firestore Database > Reglas.
2. Confirmar que un usuario sin permiso no puede leer ni escribir el expediente de otro propietario.
3. Confirmar que un invitado no puede otorgarse permisos, alterar la lista de miembros ni aprobar su propia solicitud.
4. Confirmar que un usuario solo puede crear una solicitud con su propio UID y que los datos de esa solicitud no conceden acceso.
5. Probar revocación de permisos y sesiones en dos navegadores distintos.
6. Probar cambio de cuentas en un mismo navegador; descargar copia antes de limpiar datos locales.
7. Revisar límites Spark y alertas de uso. No habilitar Blaze sin consentimiento explícito.
8. Preparar política de privacidad, procedimiento de eliminación de datos y un canal de contacto.
9. Hacer piloto cerrado con datos ficticios; no publicar información veterinaria real en GitHub.

## Limitaciones
La protección del almacenamiento local por UID es una barrera contra mezclas accidentales, no una regla de autorización remota. La privacidad entre cuentas depende de las reglas de Firestore publicadas. No asumir que están correctas sin revisarlas.
