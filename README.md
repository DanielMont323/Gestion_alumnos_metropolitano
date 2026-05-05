# Gestión de Alumnos - Clínicas de Enfermería

Sistema web para la gestión de alumnos en clínicas de enfermería, desarrollado con React (frontend) y Node.js/Express (backend) con MongoDB como base de datos.

## Características

- **Autenticación de usuarios** con roles (admin/instructor)
- **Gestión de clínicas** con información de grupos y horarios
- **Gestión de alumnos** con búsqueda, filtros y paginación
- **Control de asistencia** con registro diario y calendario visual
- **Evaluación de alumnos** con métricas de desempeño
- **Reportes generales** y estadísticas por clínica
- **Interfaz moderna** y responsive con Tailwind CSS

## Tecnologías

### Frontend
- React 18 con TypeScript
- React Router para navegación
- Tailwind CSS para estilos
- Lucide React para iconos
- Axios para comunicación con la API

### Backend
- Node.js con Express
- MongoDB con Mongoose
- JWT para autenticación
- bcryptjs para encriptación de contraseñas
- Express-validator para validación

## Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB (local o en la nube)
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd "App gestion de alumnos"
```

### 2. Instalar dependencias del backend
```bash
cd server
npm install
```

### 3. Configurar variables de entorno del backend
Crear un archivo `.env` en la carpeta `server`:
```env
MONGODB_URI=mongodb://localhost:27017/gestion_alumnos
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

### 4. Instalar dependencias del frontend
```bash
cd ../client
npm install
```

### 5. Configurar variables de entorno del frontend (opcional)
Crear un archivo `.env` en la carpeta `client`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Poblar la base de datos con datos de ejemplo
```bash
cd ../server
node seed.js
```

Esto creará:
- Usuarios de prueba (admin/instructor)
- 3 clínicas de ejemplo
- 12 alumnos de ejemplo
- Registros de asistencia y evaluaciones

## Uso

### Iniciar el servidor backend
```bash
cd server
npm run dev
```
El servidor se iniciará en `http://localhost:5000`

### Iniciar el servidor frontend
En otra terminal:
```bash
cd client
npm start
```
La aplicación se abrirá en `http://localhost:3000`

### Credenciales de prueba
- **Admin**: username=`admin`, password=`admin123`
- **Instructor**: username=`instructor`, password=`instructor123`

## Estructura del Proyecto

```
App gestion de alumnos/
|-- client/                 # Frontend React
|   |-- src/
|   |   |-- components/     # Componentes React
|   |   |-- contexts/       # Contextos (Auth)
|   |   |-- services/       # Servicios API
|   |   |-- App.tsx         # Componente principal
|   |   |-- App.css         # Estilos globales
|   |-- public/
|   |-- package.json
|   |-- tailwind.config.js
|   |-- postcss.config.js
|
|-- server/                 # Backend Node.js
|   |-- models/            # Modelos Mongoose
|   |-- routes/            # Rutas Express
|   |-- index.js           # Servidor principal
|   |-- .env               # Variables de entorno
|   |-- seed.js            # Datos de prueba
|   |-- package.json
|
|-- package.json           # Scripts del proyecto
|-- README.md
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Clínicas
- `GET /api/clinics` - Obtener todas las clínicas
- `GET /api/clinics/:id` - Obtener clínica por ID
- `POST /api/clinics` - Crear clínica
- `PUT /api/clinics/:id` - Actualizar clínica
- `DELETE /api/clinics/:id` - Eliminar clínica

### Alumnos
- `GET /api/students` - Obtener alumnos (con filtros)
- `GET /api/students/:id` - Obtener alumno por ID
- `GET /api/students/clinic/:clinicId` - Obtener alumnos por clínica
- `POST /api/students` - Crear alumno
- `PUT /api/students/:id` - Actualizar alumno
- `DELETE /api/students/:id` - Eliminar alumno

### Asistencia
- `GET /api/attendance` - Obtener registros de asistencia
- `GET /api/attendance/student/:studentId/month/:month/:year` - Asistencia mensual
- `POST /api/attendance` - Crear/actualizar registro
- `POST /api/attendance/bulk` - Crear múltiples registros

### Evaluaciones
- `GET /api/evaluations` - Obtener evaluaciones
- `GET /api/evaluations/student/:studentId/latest` - Última evaluación
- `POST /api/evaluations` - Crear evaluación
- `PUT /api/evaluations/:id` - Actualizar evaluación
- `DELETE /api/evaluations/:id` - Eliminar evaluación

### Reportes
- `GET /api/reports/general-summary` - Resumen general
- `GET /api/reports/clinic/:clinicId` - Reporte por clínica
- `GET /api/reports/student/:studentId` - Reporte por alumno

## Funcionalidades Principales

### 1. Gestión de Clínicas
- Crear y editar clínicas con información de contacto
- Configurar grupos con horarios y actividades
- Ver estadísticas generales por clínica

### 2. Gestión de Alumnos
- Agregar nuevos alumnos con asignación a grupos
- Buscar y filtrar alumnos por nombre o grupo
- Ver listados con paginación
- Editar información de alumnos

### 3. Control de Asistencia
- Registrar asistencia diaria por clínica
- Visualizar calendario mensual de asistencia
- Ver historial completo por alumno
- Calcular porcentajes automáticamente

### 4. Evaluaciones
- Evaluar desempeño y presentación
- Registrar actividades del cuadernillo
- Controlar horas de capacitación
- Ver progreso general con métricas

### 5. Reportes
- Resumen general del sistema
- Estadísticas por clínica
- Reportes individuales de alumnos
- Exportación de datos

## Desarrollo

### Scripts disponibles
```bash
# Desarrollo (ambos servidores)
npm run dev

# Solo servidor backend
cd server && npm run dev

# Solo servidor frontend
cd client && npm start

# Producción
npm run build
npm start
```

### Variables de entorno
- `MONGODB_URI`: URL de conexión a MongoDB
- `JWT_SECRET`: Clave secreta para tokens JWT
- `PORT`: Puerto del servidor backend
- `REACT_APP_API_URL`: URL de la API para el frontend

## Despliegue en Producción

### Frontend (Vercel)

El frontend está configurado para desplegarse en Vercel:

1. **Preparar el proyecto:**
   - El archivo `vercel.json` ya está configurado
   - El script `vercel-build` está en `package.json`
   - El build de producción funciona correctamente

2. **Desplegar en Vercel:**
   ```bash
   # Instalar Vercel CLI
   npm install -g vercel

   # Desplegar
   vercel
   ```

   O conecta tu repositorio de GitHub a Vercel desde el dashboard.

3. **Configurar variables de entorno en Vercel:**
   - `REACT_APP_API_URL`: URL de tu backend desplegado (ej: https://tu-backend.onrender.com)

### Backend (Render/Railway)

El backend Node.js/Express necesita un servicio de hosting separado:

**Opción 1: Render**
1. Crea una cuenta en [render.com](https://render.com)
2. Conecta tu repositorio de GitHub
3. Crea un nuevo "Web Service"
4. Configura:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
5. Agrega variables de entorno:
   - `MONGODB_URI`: Tu conexión a MongoDB Atlas
   - `JWT_SECRET`: Una clave secreta segura
   - `PORT`: 5000

**Opción 2: Railway**
1. Crea una cuenta en [railway.app](https://railway.app)
2. Importa tu repositorio de GitHub
3. Configura las variables de entorno
4. Railway detectará automáticamente Node.js y configurará el despliegue

### Variables de Entorno Necesarias

**Backend (.env):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gestion_alumnos
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
PORT=5000
```

**Frontend (.env):**
```env
REACT_APP_API_URL=https://tu-backend-url.com
```

### Notas Importantes

- **Base de datos:** MongoDB Atlas es recomendado para producción
- **Seguridad:** Usa contraseñas fuertes y JWT_SECRET seguro
- **CORS:** Configura los oríenes permitidos en producción
- **HTTPS:** Ambos servicios deberían usar HTTPS en producción

## Contribución

1. Fork del proyecto
2. Crear rama de características (`git checkout -b feature/NuevaCaracteristica`)
3. Commit de cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC.
