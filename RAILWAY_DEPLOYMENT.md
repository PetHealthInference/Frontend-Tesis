# Despliegue beta en Railway - Frontend OE3

## Servicio

El frontend React/Vite se despliega como sitio estatico servido por Nginx.

```text
React/Vite build -> Nginx -> Railway public domain
```

## URLs beta

```text
Frontend beta: https://frontend-production-f6f8.up.railway.app
Backend API:   https://api-production-f723.up.railway.app
Swagger API:   https://api-production-f723.up.railway.app/docs
```

## Variable de API

Para esta beta se usa:

```env
VITE_API_BASE_URL=https://api-production-f723.up.railway.app
```

Este valor esta en `.env.production` porque Vite lo incorpora durante el build.

## Pasos de verificacion

1. Desplegar `Frontend-Tesis` como servicio Railway.
2. Generar dominio publico para el servicio frontend.
3. Agregar ese dominio a `CORS_ORIGINS` en el backend.
4. Verificar login, catalogos, propietarios, pacientes, evaluaciones e inferencia desde Network.

## Evidencia OE3 sugerida

- Captura del frontend publicado por HTTPS.
- Captura Network mostrando llamadas al backend Railway.
- Captura de Swagger backend disponible en `/docs`.
- Captura del flujo completo con JWT.
