/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Tu sitemap (ya lo teníamos)
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: 'https://lfaftechapi.onrender.com/api/radio/sitemap.xml',
      },
      {
        source: '/robots.txt',
        destination: '/robots_real.txt',
      }
    ];
  },

  // --- ¡AQUÍ ESTÁ LA SOLUCIÓN! ---
  async redirects() {
    return [
      // 1. Redirección para las radios (de index.html?radio=UUID a /radio/UUID)
      {
        source: '/index.html', // La página vieja
        has: [ { type: 'query', key: 'radio' } ], // SI TIENE el parámetro ?radio=
        destination: '/radio/:radio', // Redirige a la nueva ruta
        permanent: true, // ¡301!
      },
      // 2. Redirección para los géneros (de index.html?filtro=generos a /generos)
      {
        source: '/index.html',
        has: [ { type: 'query', key: 'filtro', value: 'generos' } ],
        destination: '/generos',
        permanent: true,
      },
      // 3. Redirección para las páginas estáticas
      {
        source: '/sobre-nosotros.html',
        destination: '/sobre-nosotros',
        permanent: true,
      },
      {
        source: '/contacto.html',
        destination: '/contacto',
        permanent: true,
      },
       {
        source: '/terminos.html',
        destination: '/terminos',
        permanent: true,
      },
      {
        source: '/politica-privacidad.html',
        destination: '/politica-privacidad',
        permanent: true,
      },
      {
        source: '/preguntas-frecuentes.html',
        destination: '/preguntas-frecuentes',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;