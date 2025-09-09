# calculadoraproteemvt

Proyecto de calculadora nutricional listo para deploy en Vercel.

## Supabase

- El cliente de Supabase se inicializa con `persistSession: false` para manejar los tokens solo en memoria y se habilita `autoRefreshToken` para rotarlos de forma segura.
- Como alternativa, se incluye una función serverless (`api/auth.js`) que emite cookies `HttpOnly` para autenticación basada en cookies.
- Revisa la documentación oficial de Supabase para configurar la rotación automática de tokens y proteger las sesiones.
