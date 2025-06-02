# Eventos Express

Bienvenido al proyecto **Eventos Express**, una aplicación full-stack para la gestión de eventos. Permite a los usuarios registrarse, crear eventos, confirmar asistencia, recibir notificaciones de cambios y dejar comentarios/calificaciones. A continuación encontrarás toda la información necesaria para instalar, configurar y usar la aplicación, así como detalles sobre las licencias Creative Commons implementadas.

---
## Integrantes y avance
Con el proyecto se logró un 85% de avance: 
- Victor Amilcar Elías Peña                EP171613
- Melissa Vanina López Peña                LP223029
- Oscar Alexander Quintanilla Rodriguez    QR200363
- David Ernesto Ramos Vásquez              RV230544
- Oscar Dave Guerra Pacheco                GP200006

## Link a Trello
https://trello.com/b/lesddTAa

## Mockups en Figma
https://www.figma.com/design/qhTxtiFOS2NYgcAg3cUiOx/Evento-Express---Mock-Ups?node-id=69-2&t=STsNuCWVQLcJkG5D-1

## 📖 Descripción del proyecto

**Eventos Express** está dividido en dos partes principales:

1. **Backend** (Flask + SQLAlchemy + Alembic + MySQL):
   - Autenticación JWT.
   - Ver, crear y editar eventos.
   - Gestión de RSVPs (confirmaciones de asistencia).
   - Manejo de comentarios y calificaciones.
   - Notificaciones de cambios en la fecha de eventos a los que ya confirmaste asistencia.
   - Ver estadísticas de participación (RSVPs, asistentes y rating).

2. **Frontend** (React Native):
   - Pantallas de registro e inicio de sesión.
   - Listado de eventos (próximos y pasados).
   - Detalle de evento (con RSVP y comentarios).
   - Crear/editar eventos.
   - Ver “Mis eventos asistidos” y “Mis eventos creados”.
   - Estadísticas y perfil de usuario.

---

## 🚀 Tecnologías utilizadas

**Backend**  
- Python 3.9+  
- Flask  
- Flask-JWT-Extended  
- Flask-Migrate (Alembic)  
- Flask-Bcrypt  
- Flask-CORS  
- Flask-SQLAlchemy  
- MySQL 

**Frontend**  
- React Native  
- React Navigation (Stack, Drawer y Bottom Tabs)
- Expo  
- AsyncStorage  
- Axios  
- react-native-toast-message  
- @react-native-community/datetimepicker (iOS/Android)  
- Ionicons (expo/vector-icons)

---

## 📋 Requisitos previos

1. **Git** instalado.  
2. **Python 3.9+**  
3. **Node.js + npm**  
4. **MySQL** .  
5. (Opcional) **Expo CLI** para pruebas en emulador/móvil.

---

## 🔧 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/melissa-lp/DPS.git
```
### 2. Configurar el backend
**Crear y activar un entorno virtual** 
```bash
cd ../eventos_backend
python -m venv venv
source venv/bin/activate      # Linux / Mac
venv\Scripts\activate         # Windows PowerShell
```
**Instalar dependencias**
```bash
pip install -r requirements.txt
```
**Crear un archivo .env en eventos_backend/ con estas variables**
```bash
DATABASE_URI=mysql+pymysql://<usuario>:<password>@<host>:<puerto>/<nombre_base>
JWT_SECRET_KEY=una_clave_super_secreta
```
**Preparar la base de datos MySQL**
```bash
CREATE DATABASE IF NOT EXISTS eventos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
**Inicializar Alembic (si no existe en la carpeta migrations/**
```bash
flask db init
```
**Generar la migración inicial**
```bash
flask db migrate -m "Tablas iniciales"
flask db upgrade
```
**Generar la migración de la vista de estadísticas**
```bash
flask db migrate -m "Crear vista event_stats"
flask db upgrade
```
**Asegurarse de que el método upgrade() en la migración incluya:**
```bash
op.execute("""
CREATE VIEW event_stats AS
SELECT
  e.id           AS event_id,
  e.title        AS event_title,
  COUNT(r.id)    AS total_rsvps,
  SUM(r.status = 'accepted') AS accepted_count,
  AVG(c.rating)  AS average_rating
FROM events e
LEFT JOIN rsvps r   ON r.event_id = e.id
LEFT JOIN comments c ON c.event_id = e.id
GROUP BY e.id, e.title;
""")
```
**Insertar los tipos de licencia (seed) en la tabla license_types**
```bash
INSERT INTO license_types (code, description) VALUES
  ('CC-BY',      'Creative Commons Attribution'),
  ('CC-BY-SA',   'Creative Commons Attribution-ShareAlike'),
  ('CC-BY-ND',   'Creative Commons Attribution-NoDerivs'),
  ('CC-BY-NC',   'Creative Commons Attribution-NonCommercial'),
  ('CC-BY-NC-SA','Creative Commons Attribution-NonCommercial-ShareAlike'),
  ('CC-BY-NC-ND','Creative Commons Attribution-NonCommercial-NoDerivs');
```
**Levantar el servidor Flask**
```bash
python run.py
```

### 3. Configurar el frontend
**Ir a carpeta eventos_frontend**
```bash
cd ../eventos_frontend
```
**Instalar dependencias**
```bash
npm install
```
**Asegurarse que la base URL en src/api/client.js coincide con el backend**
```bash
import axios from "axios";

export default axios.create({
  baseURL: "http://127.0.0.1:5000", // Ajustar si backend corre en otra dirección
  headers: { "Content-Type": "application/json" },
});
```
**Iniciar la app con Expo**
```bash
npx expo start --web
```

# Guía de usuario

## 1. Registro e inicio de sesión
Al abrir la app, verás la pantalla de Iniciar Sesión.

Si no tienes cuenta, pulsa **Registrarse**.

En **Registrarse** ingresa:
- Usuario (único).
- Contraseña (mínimo 6 caracteres).
- Nombre y apellido.
- Edad (1–120).

Tras registrarte, se te redirige a Iniciar Sesión. Ingresa tus credenciales; si son correctas, se guarda el token JWT en AsyncStorage y entras al menú principal.

## 2. Navegación Principal
- Inicio (Eventos): Lista de próximos y pasados.
- Mis Eventos Creados: Eventos que tú creaste.
- Bandeja de entrada: Notificaciones de cambios en fechas de eventos a los que confirmaste asistencia.
- Crear Evento: Formulario para crear un nuevo evento.
- Cerrar Sesión.

## 3. Listado de Eventos
En **Eventos** verás dos pestañas:
- Próximos: Eventos que aún no han ocurrido.
- Pasados: Eventos que ya se realizaron.

Cada tarjeta muestra:
- Título del evento.
- Fecha (día, mes y año).
- Ubicación.
- Botón **Ver evento**.

Si es pasado, aparece el texto "📌 Pasado".

## 4. Detalle de Evento
Al pulsar **Ver evento**, entras a la pantalla de detalle, que muestra:
- Título, fecha y ubicación.
- Descripción.

Si el evento es futuro:
- Botones **Asistir** o **Cancelar** para gestionar tu RSVP.

Si el evento es pasado y asististe:
- Sección de comentarios:
  - Lista de comentarios existentes.
  - Formulario para dejar tu propio comentario (1–5 estrellas).

## 5. Crear / Editar Evento
En **Crear Evento** ingresa:
- Título (requerido).
- Fecha y hora (no puede ser pasada).
- Descripción (opcional).
- Ubicación (opcional).
- Licencia Creative Commons (selecciona de la lista).

Al enviarlo, se crea el evento y vuelves al listado.

Para editar uno de tus propios eventos (antes de que ocurra), ve a **Mis Eventos Creados**, pulsa **Editar** en la tarjeta y modifica los campos. No puedes editar eventos que ya pasaron.

## 6. Bandeja de Entrada (Notificaciones)
Muestra todos los eventos a los que confirmaste asistencia y cuya fecha fue modificada por el creador.

Cada tarjeta incluye:
- Ícono de notificación + Título.
- Modificado: fecha y hora nueva.
- Original: fecha y hora vieja.

Al pulsar la tarjeta, navegas al detalle del evento asociado (si existe).

## 7. Mis Eventos Asistidos
En la pestaña **Eventos asistidos** verás una lista de todos los eventos pasados a los que confirmaste asistencia.

Al pulsar **Ver detalles**, vuelves a la pantalla de detalle del evento (allí podrás dejar un comentario si no lo hiciste antes).

## 8. Estadísticas
En la pestaña **Estadísticas** hay dos sub-secciones:

**Historial**:
- Lista de eventos pasados con asistentes, incluyendo cada lista de asistentes y la fecha del evento.

**Estadísticas**:
Para cada evento pasado, muestra:
- Total de RSVPs (usuarios que confirmaron).
- Cuántos asistieron realmente.
- Calificación promedio (rating) sobre 5.

Estos datos provienen de la vista SQL `event_stats` definida en la base de datos.

## 9. Perfil
En la pestaña **Perfil** verás:
- Avatar (o iniciales generadas automáticamente).
- Nombre y apellido.
- Username.
- Edad.
- Botón **Cerrar Sesión** que borra el token y regresa a la pantalla de login.













