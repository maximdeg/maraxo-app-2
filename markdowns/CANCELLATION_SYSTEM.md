# Sistema de Cancelación de Citas

## Descripción

Este sistema permite a los pacientes cancelar sus citas de forma segura mediante enlaces únicos y encriptados. Cada cita tiene un token JWT único que expira en 48 horas.

## Características

- ✅ **Enlaces seguros**: Cada cita tiene un token JWT único
- ✅ **Expiración inteligente**: Los tokens expiran 12 horas antes de la cita
- ✅ **Verificación múltiple**: Se verifica el token, ID de cita y teléfono del paciente
- ✅ **Interfaz intuitiva**: Página de confirmación antes de cancelar
- ✅ **Auditoría**: Las citas se marcan como canceladas en lugar de eliminarse
- ✅ **Lógica de negocio**: No se permite cancelar citas con menos de 12 horas de anticipación

## Configuración

### 1. Base de Datos

Ejecute la migración para agregar la columna `cancellation_token`:

```sql
-- Ejecutar el archivo: database/add_cancellation_token_to_appointments.sql
```

### 2. Variables de Entorno

Agregue la siguiente variable a su archivo `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Importante**: En producción, genere una clave JWT segura y única.

### 3. Dependencias

Las dependencias necesarias ya están incluidas:
- `jsonwebtoken`
- `@types/jsonwebtoken`

## Flujo de Funcionamiento

### 1. Creación de Cita
- Cuando se crea una cita, se genera automáticamente un token JWT
- El token incluye: ID de cita, ID de paciente, teléfono, fecha y hora
- El token expira 12 horas antes de la cita programada
- El token se almacena en la base de datos

### 2. Enlace de Cancelación
- El enlace se muestra en la página de confirmación
- Formato: `/cancelar-cita?token=<JWT_TOKEN>`
- El enlace es único para cada cita
- El enlace expira 12 horas antes de la cita

### 3. Proceso de Cancelación
1. El paciente hace clic en el enlace
2. Se verifica el token JWT y la fecha de la cita
3. Se verifica que la cancelación sea permitida (más de 12 horas antes)
4. Se muestra la información de la cita
5. El paciente confirma la cancelación
6. La cita se marca como cancelada (status = 'cancelled')

## Archivos Principales

### Backend
- `lib/cancellation-token.ts` - Utilidades para JWT
- `lib/actions.ts` - Funciones de cancelación
- `app/api/cancel-appointment/verify/route.ts` - Verificación de tokens
- `app/api/cancel-appointment/route.ts` - Cancelación de citas

### Frontend
- `app/cancelar-cita/page.tsx` - Página de cancelación
- `app/confirmation/page.tsx` - Enlace de cancelación

## Seguridad

### Medidas Implementadas
- **Tokens JWT**: Encriptados y firmados
- **Expiración inteligente**: 12 horas antes de la cita
- **Verificación múltiple**: Token + ID + Teléfono + Fecha de cita
- **Prevención de reutilización**: Tokens únicos por cita
- **Auditoría**: Las citas no se eliminan, se marcan como canceladas
- **Lógica de negocio**: No se permite cancelar citas con menos de 12 horas de anticipación

### Recomendaciones de Producción
1. Use una clave JWT segura y única
2. Configure HTTPS en producción
3. Monitoree los intentos de cancelación
4. Considere agregar rate limiting
5. Implemente logs de auditoría

## Uso

### Para Pacientes
1. Reciba el enlace de cancelación en la confirmación de cita
2. Haga clic en "Cancelar Cita"
3. Revise los detalles de la cita
4. Confirme la cancelación
5. Reciba confirmación de cancelación

### Para Desarrolladores
```typescript
// Generar token de cancelación
const token = generateCancellationToken({
    appointmentId: "123",
    patientId: "456",
    patientPhone: "+1234567890",
    appointmentDate: "2024-01-15",
    appointmentTime: "14:30"
});

// Verificar token
const decoded = verifyCancellationToken(token);
if (decoded) {
    // Token válido
}
```

## Mantenimiento

### Limpieza de Tokens Expirados
Los tokens expirados se pueden limpiar periódicamente:

```sql
-- Eliminar tokens expirados (opcional)
-- Esto limpia tokens de citas que ya pasaron hace más de 12 horas
UPDATE appointments 
SET cancellation_token = NULL 
WHERE cancellation_token IS NOT NULL 
AND appointment_date < CURRENT_DATE - INTERVAL '1 day';
```

### Monitoreo
- Revise los logs de cancelación
- Monitoree intentos de cancelación fallidos
- Verifique la integridad de los tokens

## Troubleshooting

### Problemas Comunes

1. **Token expirado**: El enlace expiró 12 horas antes de la cita
2. **Cancelación no permitida**: La cita está a menos de 12 horas
3. **Cita ya cancelada**: La cita ya fue cancelada previamente
4. **Token inválido**: El enlace fue manipulado o es incorrecto

### Logs de Error
Los errores se registran en la consola del servidor con detalles específicos para facilitar el debugging. 