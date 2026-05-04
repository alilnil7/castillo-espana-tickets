2. Backend
Instalar dependencias del backend
bash
cd server
npm install express sqlite3 stripe qrcode axios dotenv cors bcrypt jsonwebtoken
O si usas package.json:

bash
npm install
Dependencias explicadas:

express - framework web

sqlite3 - base de datos SQLite

stripe - procesamiento de pagos

qrcode - generación de códigos QR

axios - peticiones HTTP

dotenv - variables de entorno

cors - Cross-Origin Resource Sharing

bcrypt - encriptación de contraseñas

jsonwebtoken - JWT para autenticación

Configurar variables de entorno del backend
Crea el archivo .env:

bash
cp .env.example .env
Edita el archivo .env con tus valores:

env
# Servidor
PORT=3000
NODE_ENV=development

# Stripe (obligatorio - obtener de https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica

# Google Maps (opcional - obtener de https://console.cloud.google.com)
GOOGLE_MAPS_API_KEY=AIzaSy_tu_clave_de_maps

# JWT (para autenticación - generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=tu_jwt_secret_generado_aqui

# SQLite (base de datos - se crea automáticamente)
SQLITE_DB_PATH=./castle.db

# Frontend URL
FRONTEND_URL=http://localhost:5173
Generar JWT_SECRET
bash
# Ejecuta este comando para generar un JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copia el resultado y pégalo en JWT_SECRET en el archivo .env
Inicializar la base de datos SQLite
La base de datos se crea automáticamente al iniciar el servidor. Las tablas se crean automáticamente:

tickets - almacena las entradas

booking_sessions - sesiones de reserva

map_points - puntos del mapa

point_images - imágenes de puntos

point_facts - datos históricos

stripe_webhooks - logs de webhooks

Iniciar el servidor backend
bash
# Modo desarrollo (con auto-reinicio)
npm run dev

# O modo producción
npm start
El servidor se ejecutará en http://localhost:3000

3. Frontend
Instalar dependencias del frontend
bash
cd client
npm install vue@3 vue-router@4 axios @stripe/stripe-js qrcode-vue3 leaflet vue3-leaflet
O si usas package.json:

bash
npm install
Dependencias explicadas:

vue@3 - framework Vue.js

vue-router@4 - enrutamiento

axios - peticiones HTTP

@stripe/stripe-js - integración Stripe

qrcode-vue3 - generación de QR codes

leaflet - mapas interactivos

vue3-leaflet - componente Leaflet para Vue 3

Configurar variables de entorno del frontend
Crea el archivo .env:

bash
cp .env.example .env
Edita el archivo .env:

env
# Stripe (obligatorio - misma clave pública que en backend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica

# API URL (url del backend)
VITE_API_URL=http://localhost:3000/api

# Google Maps (opcional)
VITE_GOOGLE_MAPS_API_KEY=AIzaSy_tu_clave_de_maps

# Configuración de la app
VITE_APP_ENV=development
VITE_APP_TITLE=Castillo de España
Iniciar la aplicación frontend
bash
npm run dev
La aplicación se ejecutará en http://localhost:5173