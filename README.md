# calculadoraproteemvt

Proyecto de calculadora nutricional listo para deploy en Vercel.

codex/initialize-supabase-with-in-memory-tokens
## Supabase

- El cliente de Supabase se inicializa con `persistSession: false` para manejar los tokens solo en memoria y se habilita `autoRefreshToken` para rotarlos de forma segura.
- Como alternativa, se incluye una función serverless (`api/auth.js`) que emite cookies `HttpOnly` para autenticación basada en cookies.
- Revisa la documentación oficial de Supabase para configurar la rotación automática de tokens y proteger las sesiones.

## Configuración de Supabase

Las credenciales de Supabase ya no están incrustadas en el código. Se leen
desde variables de entorno definidas en la plataforma de despliegue:

1. Define los secretos en Vercel:

   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   ```

2. Cuando se despliegue, `api/env.js` expondrá estas variables al cliente y
   `index.html` las utilizará para inicializar `@supabase/supabase-js`.

Esta estrategia evita exponer claves sensibles en el repositorio.

## Dependencias externas

El paquete `@supabase/supabase-js` se sirve desde un CDN con una versión
fijada y atributos de integridad para mayor seguridad.
main
