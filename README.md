# calculadoraproteemvt

Proyecto de calculadora nutricional listo para deploy en Vercel.

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
