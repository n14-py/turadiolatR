import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';

// URL de tu API
const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';

// --- 1. FUNCIÓN (Se ejecuta en el SERVIDOR al construir) ---
// Esta función se ejecuta UNA SOLA VEZ cuando publicas el sitio.
// Llama a tu API y obtiene la lista de géneros.
export async function getStaticProps() {
    let tags = [];
    let error = null;

    try {
        const response = await fetch(`${API_URL}/radio/generos`);
        if (!response.ok) {
            throw new Error('Error al cargar géneros');
        }
        tags = await response.json();
    } catch (err) {
        console.error("Error en getStaticProps (Géneros):", err.message);
        error = "No se pudieron cargar los géneros. Intente más tarde.";
    }

    // Pasamos los tags (o un error) a la página
    return {
        props: {
            tags,
            error,
        },
        // Opcional: Le decimos a Vercel que vuelva a construir esta página
        // cada 1 hora (3600s) por si hay nuevos géneros.
        revalidate: 3600 
    };
}

// --- 2. COMPONENTE DE LA PÁGINA (Se ejecuta en el NAVEGADOR) ---
// Recibe los "props" (tags, error) de la función de arriba
export default function GenerosPage({ tags, error }) {
    return (
        <Layout>
            <Head>
                {/* SEO tags para esta página */}
                <title>Buscar por Género - TuRadio.lat</title>
                <meta name="description" content="Encuentra radios de Latinoamérica por género. Cumbia, Rock, Pop, Reggaetón, Folklore y más." />
                
                {/* Metatags OG específicas */}
                <meta property="og:title" content="Buscar por Género - TuRadio.lat" />
                <meta property="og:url" content="https://turadio.lat/generos" />
                <meta property="og:description" content="Encuentra radios de Latinoamérica por género. Cumbia, Rock, Pop, Reggaetón, Folklore y más." />

                {/* Etiqueta Canónica */}
                <link rel="canonical" href="https://turadio.lat/generos" />
            </Head>

            {/* Este es el <div id="page-container"> para esta página */}
            
            {/* Formulario de Búsqueda (lo pondremos en todas las páginas) */}
            <form id="search-form" className="search-form" action="/" method="GET">
                <input type="text" id="search-input" name="query" placeholder="Buscar radios, países o géneros..." required />
                <button type="submit" id="search-button"><i className="fas fa-search"></i></button>
            </form>

            <h2 id="page-title">Buscar por Género</h2>

            {/* Si hay un error, lo mostramos */}
            {error && (
                <div className="no-stations-message" style={{ color: 'red' }}>
                    <p>{error}</p>
                </div>
            )}

            {/* Si no hay error, mostramos los tags */}
            {!error && tags.length > 0 && (
                <div className="tags-container">
                    {tags.map(tag => (
                        // Cada link apunta a la PÁGINA DE INICIO
                        // pero con el filtro de ?genero=...
                        <Link 
                            key={tag.name} 
                            href={`/?genero=${encodeURIComponent(tag.name)}`} 
                            className="tag-btn"
                        >
                            {tag.name} <span>{tag.stationcount}</span>
                        </Link>
                    ))}
                </div>
            )}
            
        </Layout>
    );
}