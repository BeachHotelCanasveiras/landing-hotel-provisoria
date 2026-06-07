# Beach Hotel Canasvieiras - Guía de Deployment

## Descripción del Proyecto

Landing page profesional y elegante para Beach Hotel Canasvieiras en Florianópolis, desarrollada con React 19, Tailwind CSS 4, Framer Motion y Next.js. El sitio incluye todas las secciones necesarias para presentar el hotel de forma moderna y atractiva.

## Características Principales

- **Header Responsivo:** Navegación elegante con menú móvil
- **Hero Section:** Imagen de fondo con contenido animado
- **Sección de Habitaciones:** Grid de 4 tipos de habitaciones con detalles
- **Galería Interactiva:** Lightbox con fotos del hotel
- **Atracciones de Florianópolis:** Información sobre playas y lugares cercanos
- **Testimonios:** Reseñas verificadas de huéspedes
- **Botón WhatsApp Flotante:** Contacto directo para reservas
- **Footer Profesional:** Información de contacto y redes sociales
- **Animaciones Framer Motion:** Transiciones suaves y elegantes

## Tecnología

- **Frontend:** React 19 + TypeScript
- **Estilos:** Tailwind CSS 4 + CSS personalizado
- **Animaciones:** Framer Motion
- **Componentes:** shadcn/ui
- **Iconos:** Lucide React
- **Enrutamiento:** Wouter
- **Build Tool:** Vite

## Instalación Local

### Requisitos Previos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Pasos de Instalación

1. **Descomprimir el archivo ZIP:**
   ```bash
   unzip beach-hotel-canasvieiras.zip
   cd beach-hotel-canasvieiras
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   # o
   npm install
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   pnpm dev
   # o
   npm run dev
   ```
   El sitio estará disponible en `http://localhost:3000`

4. **Compilar para producción:**
   ```bash
   pnpm build
   # o
   npm run build
   ```

5. **Ejecutar en producción:**
   ```bash
   pnpm start
   # o
   npm start
   ```

## Estructura del Proyecto

```
beach-hotel-canasvieiras/
├── client/
│   ├── public/              # Archivos estáticos
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Rooms.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── Attractions.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── WhatsAppButton.tsx
│   │   ├── pages/
│   │   │   └── Home.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   └── index.ts             # Servidor Express
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Personalización

### Cambiar Números de Teléfono
Busca `5548999999999` en los archivos y reemplázalo con el número real del hotel:
- `client/src/components/Header.tsx`
- `client/src/components/Hero.tsx`
- `client/src/components/Footer.tsx`
- `client/src/components/WhatsAppButton.tsx`

### Actualizar Información del Hotel
- **Header:** Edita el logo y nombre en `Header.tsx`
- **Hero:** Modifica el título y descripción en `Hero.tsx`
- **Habitaciones:** Actualiza los datos en el array `rooms` en `Rooms.tsx`
- **Atracciones:** Modifica el array `attractions` en `Attractions.tsx`
- **Testimonios:** Actualiza el array `testimonials` en `Testimonials.tsx`
- **Footer:** Cambia la información de contacto en `Footer.tsx`

### Cambiar Colores
Los colores están definidos en `client/src/index.css`:
- `--primary: #0F3B66` (Azul Profundo)
- `--secondary: #4A9B8E` (Verde Agua)
- `--accent: #D4A574` (Arena Cálida)

### Reemplazar Imágenes
Las imágenes usan URLs de Unsplash. Para usar imágenes locales:
1. Coloca las imágenes en `client/public/images/`
2. Reemplaza las URLs con rutas locales: `/images/nombre-imagen.jpg`

## Deployment en Diferentes Plataformas

### Vercel (Recomendado para Next.js)
1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente que es un proyecto Next.js
3. Configura las variables de entorno si es necesario
4. Deploy automático en cada push

### Netlify
1. Conecta tu repositorio a Netlify
2. Configura el comando de build: `pnpm build`
3. Directorio de publicación: `dist/public`
4. Deploy automático

### Railway
1. Conecta tu repositorio a Railway
2. Configura el comando de inicio: `pnpm start`
3. Railway detectará Node.js automáticamente
4. Deploy con un clic

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Variables de Entorno

El proyecto usa variables de entorno automáticas de Manus. Si necesitas agregar más:

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega tus variables
3. Accede a ellas en el código con `process.env.VARIABLE_NAME`

## Optimización para SEO

Para mejorar el SEO, actualiza:
- `client/index.html`: Título y meta descripciones
- Agrega Open Graph tags para redes sociales
- Implementa Schema.org structured data

## Rendimiento

El proyecto está optimizado para:
- Lazy loading de imágenes
- Code splitting automático
- Compresión gzip
- Caché de navegador

## Soporte y Mantenimiento

- **Actualizaciones de dependencias:** `pnpm update`
- **Linting:** `pnpm format`
- **Type checking:** `pnpm check`

## Licencia

Este proyecto es propiedad de Beach Hotel Canasvieiras.

---

**Nota:** Este es un proyecto estático con servidor Express. Para funcionalidades dinámicas avanzadas, considera agregar una base de datos y APIs backend.
