# 🏰 Castillo de España - Sistema de Reserva de Entradas

 Instalación completa

## 1. Clonar el repositorio


git clone https://github.com/alilnil7/castillo-espana-tickets.git
cd castillo-espana-tickets
## 2. Backend
bash
cd server
npm install express sqlite3 stripe qrcode axios dotenv cors bcrypt jsonwebtoken
 
## Crear archivo .env dentro de la carpeta server:

## env
PORT=3000
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
GOOGLE_MAPS_API_KEY=AIzaSy_tu_clave
JWT_SECRET=tu_jwt_secret
SQLITE_DB_PATH=./castle.db
FRONTEND_URL=http://localhost:5173

## Generar JWT_SECRET:

bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
## Iniciar backend:

bash
npm run dev

## 3. Frontend
Abrir nueva terminal:

bash
cd client
npm install vue@3 vue-router@4 axios @stripe/stripe-js qrcode-vue3 leaflet vue3-leaflet

## Crear archivo .env dentro de la carpeta client:

## env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica

VITE_API_URL=http://localhost:3000/api

VITE_GOOGLE_MAPS_API_KEY=AIzaSy_tu_clave

VITE_APP_ENV=development

VITE_APP_TITLE=Castillo de España

## Iniciar frontend:

bash
npm run dev

## 4. Abrir el proyecto
Backend: http://localhost:3000

Frontend: http://localhost:5173
