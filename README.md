# Frontend OE3 - Aplicacion Web Veterinaria

Frontend desarrollado con React, Vite y TypeScript para el OE3 de la tesis: aplicacion web con autenticacion, catalogos clinicos, gestion de propietarios/pacientes, evaluaciones con facts, procesamiento de inferencia y trazabilidad historica por paciente.

La aplicacion consume exclusivamente la API REST del backend y no utiliza mocks en el flujo clinico principal.

## Stack Tecnologico

- React 18
- Vite 6
- TypeScript
- React Router 7
- Tailwind CSS
- Lucide React
- Componentes Radix/shadcn base

## Estructura Principal

```text
Frontend-Tesis/
  src/
    app/
      components/          # Pantallas y componentes UI
      routes.tsx           # Rutas privadas/publicas
      App.tsx
    hooks/                 # Hooks de datos REST
    services/              # apiClient y servicios por recurso
    types/                 # Tipos TypeScript por dominio
    styles/                # Estilos globales y tema
```

## Variables de Entorno

Crear o ajustar `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Si el backend se expone por proxy o puerto alternativo, actualizar esta variable. El `apiClient` usa `http://localhost:8000` como fallback.

## Instalacion

```bash
npm install
```

## Ejecucion en Desarrollo

```bash
npm run dev
```

Vite inicia normalmente en:

```text
http://localhost:5173
```

## Build de Produccion

```bash
npm run build
```

## Autenticacion

El frontend implementa:

- login real contra backend
- almacenamiento de `access_token`
- envio automatico de JWT en `apiClient`
- rutas privadas
- logout
- manejo de errores `401`, `403`, `404`, `422` y `500`

Archivo clave:

```text
src/services/apiClient.ts
```

## Servicios REST

Servicios principales:

```text
src/services/authService.ts
src/services/catalogService.ts
src/services/ownerService.ts
src/services/patientService.ts
src/services/evaluationService.ts
```

Cada servicio usa `apiClient` y mantiene separada la logica de consumo HTTP.

## Funcionalidades Implementadas

### Frontend 1 - Login y JWT

- Login real
- JWT persistido
- Rutas privadas
- Logout

### Frontend 2 - Catalogos Clinicos

Consume API real:

- `GET /api/v1/species`
- `GET /api/v1/breeds?species_id={species_id}`
- `GET /api/v1/symptoms`
- `GET /api/v1/clinical-variables`
- `GET /api/v1/diseases`
- `GET /api/v1/risk-levels`

### Frontend 3 - Owners / Duenos

- Creacion de propietario
- Listado/seleccion de propietario
- Asociacion real mediante `owner_id`

### Frontend 4 - Patients / Pacientes

- Listado real de pacientes
- Creacion de paciente
- Detalle de paciente
- Asociacion con owner, species y breed reales

### Frontend 5 - Evaluaciones con Facts

- Creacion de evaluacion clinica
- Seleccion de paciente real
- Registro de sintomas y variables clinicas como facts
- Payload compatible con backend:

```json
{
  "patient_id": 1,
  "reason": "Motivo de consulta",
  "observations": "Observaciones clinicas",
  "facts": [
    { "fact_key": "poliuria", "value": true, "source_type": "symptom" },
    { "fact_key": "glucosa", "value": 280, "source_type": "clinical_variable" }
  ]
}
```

### Frontend 6 - Resultados e Inferencia

- Procesamiento con `POST /api/v1/evaluaciones/{evaluation_id}/procesar`
- Visualizacion de enfermedad sugerida
- Probabilidad bayesiana
- Nivel de riesgo
- Explicacion clinica
- Reglas activadas

### Frontend 7/8 - Historial Clinico Completo

- Historial por paciente
- Evaluaciones expandibles
- Resultados historicos
- Reglas activadas por resultado
- Filtros por evento, texto, enfermedad y riesgo
- Acceso a nueva evaluacion desde el historial

## Rutas Principales

```text
/login
/
/patients
/patients/new
/patients/:id
/evaluation
/evaluation?patient_id={id}
/inference/:evaluationId
```

## Flujo Clinico End-to-End

1. Login.
2. Consulta de catalogos clinicos.
3. Creacion/seleccion de propietario.
4. Creacion de paciente.
5. Creacion de evaluacion con facts.
6. Procesamiento de inferencia.
7. Visualizacion de resultados.
8. Revision de reglas activadas.
9. Consulta del historial clinico completo por paciente.

## Evidencia Recomendada Para Tesis

Capturas sugeridas:

- Login exitoso.
- Catalogos cargados desde Network.
- Creacion de propietario.
- Creacion de paciente con `owner_id`, `species_id`, `breed_id`.
- Evaluacion con facts.
- Network `POST /api/v1/evaluations`.
- Network `POST /api/v1/evaluaciones/{id}/procesar`.
- Resultados de inferencia.
- Reglas activadas.
- Historial clinico completo por paciente.

## Validacion Manual

1. Iniciar backend.
2. Verificar `VITE_API_BASE_URL`.
3. Ejecutar `npm run dev`.
4. Hacer login.
5. Crear propietario y paciente.
6. Crear evaluacion con facts.
7. Procesar evaluacion.
8. Revisar detalle del paciente e historial.
9. Ejecutar build:

```bash
npm run build
```

## Estado Academico

El frontend cubre el flujo clinico completo del OE3: autenticacion, datos maestros, propietarios, pacientes, evaluaciones, inferencia hibrida, resultados, reglas activadas e historial clinico trazable por paciente.
