import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

// Este componente envuelve todas las páginas
// {children} será el contenido de la página (ej: la lista de radios)
export default function Layout({ children }) {
  return (
    <>
      <Head>
        {/* Metatags de tu index.html original */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Título y descripción por defecto (las páginas específicas pueden sobreescribirlos) */}
        <title>TuRadio.lat - Todas las radios de Latinoamérica en un solo lugar</title>
        <meta name="description" content="Escucha miles de estaciones de radio en vivo de Argentina, México, Colombia, Paraguay, Chile, Perú y todo LATAM. Filtrado por país y género." />
        
        {/* Tags de Open Graph (para redes sociales) por defecto */}
        <meta property="og:title" content="TuRadio.lat - Radios de LATAM en vivo" />
        <meta property="og:description" content="El portal líder para escuchar radios en vivo de toda Latinoamérica. Sintoniza gratis miles de estaciones." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://turadio.lat" />
        {/* Apuntamos a la imagen que movimos a /public/images/ */}
        <meta property="og:image" content="https://turadio.lat/images/og-image.png" />
        
        {/* Favicon (lo movimos a /public/images/) */}
        <link rel="icon" href="/favicon.png" type="image/png" />

        {/* Google tag (gtag.js) (de tu index.html) */}
        <script 
          async 
          src="https://www.googletagmanager.com/gtag/js?id=G-01KQHC4JWK"
        ></script>
        <script
          // Usamos dangerouslySetInnerHTML para insertar el script que no es un archivo
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-01KQHC4JWK');
            `,
          }}
        />
        
        {/* Sitemap (de tu index.html) */}
        <link rel="sitemap" type="application/xml" title="Sitemap Radios" href="https://lfaftechapi-7nrb.onrender.com/api/radio/sitemap.xml" />

        {/* AdSense (de preguntas-frecuentes.html) */}
         <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5461370198299696"
          crossOrigin="anonymous"
        ></script>
      </Head>

      {/* Aquí se renderiza tu cabecera */}
      <Header />

      {/* Aquí se renderiza el contenido de la página */}
      <main className="container">
          <div className="main-content">
            {children}
          </div>
      </main>

      {/* Aquí se renderiza tu pie de página */}
      <Footer />
      
      {/* El reproductor de audio lo añadiremos en el siguiente paso de una forma especial */}
    </>
  );
}