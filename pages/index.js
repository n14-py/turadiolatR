import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
// ¡Importamos el "cerebro" del reproductor!
import { usePlayer } from '../context/PlayerContext';

// --- Constantes de tu app.js ---
const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';
const PLACEHOLDER_LOGO = '/images/placeholder-radio.png';
const LIMITE_POR_PAGINA = 20;

// --- 1. FUNCIÓN (Se ejecuta en el SERVIDOR) ---
// Usamos getServerSideProps porque esta página maneja MÚLTIPLES
// tipos de contenido (Populares, País, Género, Búsqueda)
export async function getServerSideProps(context) {
    
    // --- ¡LA LÍNEA MÁGICA PARA EL RENDIMIENTO! ---
    // Le decimos a Vercel: "Guarda esta página por 60 segundos".
    // 1000 usuarios = 1 sola llamada a tu API.
    context.res.setHeader(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=120'
    );
    // ---------------------------------------------

    // 1. Obtenemos los parámetros de la URL (ej: ?pais=ar&pagina=2)
    const { query, pais, genero, pagina: pagina_raw } = context.query;
    
    // 2. Limpiamos los parámetros
    const queryParams = {
        query: query || null,
        pais: pais || null,
        genero: genero || null,
        pagina: parseInt(pagina_raw) || 1,
    };

    // 3. Construimos la URL de la API (misma lógica que en tu app.js)
    let url = `${API_URL}/radio/buscar?limite=${LIMITE_POR_PAGINA}&pagina=${queryParams.pagina}`;
    let tituloPagina = "Radios Populares";
    
    if (queryParams.query) {
        url += `&query=${encodeURIComponent(queryParams.query)}`;
        tituloPagina = `Resultados para: "${queryParams.query}"`;
    } else if (queryParams.pais) {
        url += `&pais=${queryParams.pais}`;
        tituloPagina = `Radios de ${queryParams.pais}`; // Título temporal
    } else if (queryParams.genero) {
        url += `&genero=${encodeURIComponent(queryParams.genero)}`;
        tituloPagina = `Radios de ${queryParams.genero}`;
    }

    try {
        // 4. Llamamos a tu API en Render
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Error de API: ${res.statusText}`);
        }
        const data = await res.json(); // { radios, totalRadios, ... }
        
        // 5. Refinamos el título si es un país (para obtener el nombre completo)
        if (queryParams.pais && data.radios.length > 0 && !queryParams.query) {
            tituloPagina = `Radios de ${data.radios[0].pais}`;
        }
        
        // 6. Devolvemos los datos y los queryParams como "props" a la página
        return {
            props: {
                data,
                queryParams,
                tituloPagina, // Pasamos el título ya procesado
            },
        };
    } catch (error) {
        console.error("Error en getServerSideProps (Index):", error.message);
        return {
            props: {
                data: { radios: [], totalRadios: 0, totalPaginas: 1, paginaActual: 1 },
                queryParams,
                tituloPagina,
                error: "No se pudieron cargar las estaciones. Intente más tarde.",
            },
        };
    }
}


// --- 2. COMPONENTE DE LA PÁGINA (Se ejecuta en el NAVEGADOR) ---
// Recibe los "props" que devolvió getServerSideProps
export default function Home({ data, queryParams, tituloPagina, error }) {

    // --- Lógica del formulario de búsqueda (traída de tu app.js) ---
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState(queryParams.query || '');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = searchTerm.trim();
        if (!query) return;

        // Limpiamos los filtros de país/género al buscar
        const newParams = new URLSearchParams();
        newParams.set('query', query);
        newParams.set('pagina', '1');
        
        router.push(`/?${newParams.toString()}`);
    };

    const clearSearch = () => {
        setSearchTerm('');
        router.push('/'); // Vuelve a la página principal ("Populares")
    };


    return (
        <Layout>
            {/* --- 3. SEO Dinámico para esta página --- */}
            <Head>
                <title>{tituloPagina} - TuRadio.lat</title>
                <meta name="description" content={`Escucha ${tituloPagina} en vivo. Las mejores estaciones de radio de Latinoamérica en un solo lugar.`} />
                <meta property="og:title" content={`${tituloPagina} - TuRadio.lat`} />
                <meta property="og:description" content={`Escucha ${tituloPagina} en vivo. Las mejores estaciones de radio de Latinoamérica en un solo lugar.`} />
                {/* La URL canónica la genera Next.js automáticamente */}
            </Head>

            {/* --- 4. Contenido de la Página (tu index.html) --- */}
            
            {/* --- Formulario de Búsqueda --- */}
            <form id="search-form" className="search-form" onSubmit={handleSearchSubmit}>
                <input 
                    type="text" 
                    id="search-input" 
                    name="query" 
                    placeholder="Buscar radios, países o géneros..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    required 
                />
                <button type="submit" id="search-button"><i className="fas fa-search"></i></button>
                {queryParams.query && (
                    <button 
                        type="button" 
                        id="clear-search-button" 
                        onClick={clearSearch}
                        style={{ display: 'inline-block' }}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
            </form>
            
            {/* --- Título de Categoría --- */}
            <h2 id="page-title">{tituloPagina}</h2>
            
            {/* --- Contenedor de Estaciones --- */}
            <div id="page-container">
                {/* Si hay un error de API */}
                {error && (
                    <div className="no-stations-message" style={{ color: 'red' }}>
                        <p>{error}</p>
                    </div>
                )}

                {/* Si no hay error, pero no hay radios */}
                {!error && data.radios.length === 0 && (
                    <div className="no-stations-message">
                        <p>No se encontraron estaciones para esta selección.</p>
                    </div>
                )}

                {/* Si hay radios, las mostramos */}
                {!error && data.radios.length > 0 && (
                    <>
                        <p id="radio-count-info">
                            Mostrando {data.radios.length} de {data.totalRadios} {data.totalRadios === 1 ? 'radio' : 'radios'} en total.
                        </p>
                        <div id="stations-container">
                            {data.radios.map(station => (
                                <StationCard key={station.uuid} station={station} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        
            {/* --- Paginación --- */}
            <Pagination 
                paginaActual={data.paginaActual} 
                totalPaginas={data.totalPaginas} 
                queryParams={queryParams}
            />

        </Layout>
    );
}


// --- 3. Componentes Ayudantes (para limpiar el código) ---

// --- Componente de Tarjeta de Estación (tu lógica de renderizado de app.js) ---
function StationCard({ station }) {
    // Conectamos la tarjeta al "cerebro" del reproductor
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    
    const logo = station.logo || PLACEHOLDER_LOGO;
    
    // Verificamos si ESTA radio es la que está sonando
    const isThisStationPlaying = currentStation?.uuid === station.uuid && isPlaying;

    const handlePlayClick = () => {
        if (isThisStationPlaying) {
            pauseStation();
        } else {
            playStation(station);
        }
    };
    
    // La URL amigable que crearemos en el siguiente paso
    const stationUrl = `/radio/${station.uuid}`;

    return (
        <div className={`station-card ${isThisStationPlaying ? 'is-playing' : ''}`}>
            <Link href={stationUrl} className="station-info-link">
                <img 
                    src={logo} 
                    alt={station.nombre} 
                    className="station-logo" 
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                />
                <h3 className="station-name" title={station.nombre}>{station.nombre}</h3>
            </Link>
            <p className="station-meta">{station.pais}</p>
            <button 
                className="btn-play" 
                onClick={handlePlayClick} 
                aria-label={`Reproducir ${station.nombre}`}
            >
                {/* Mostramos el ícono de Pausa si esta radio está sonando */}
                {isThisStationPlaying ? (
                    <i className="fas fa-pause"></i>
                ) : (
                    <i className="fas fa-play"></i>
                )}
            </button>
        </div>
    );
}

// --- Componente de Paginación (lógica de tu app.js que soluciona el bug de CSS) ---
function Pagination({ paginaActual, totalPaginas, queryParams }) {
    if (totalPaginas <= 1) return null;

    // Construimos el query string base
    const baseParams = new URLSearchParams();
    if (queryParams.query) baseParams.set('query', queryParams.query);
    if (queryParams.pais) baseParams.set('pais', queryParams.pais);
    if (queryParams.genero) baseParams.set('genero', queryParams.genero);

    // Lógica para mostrar solo 5 botones de página
    const maxPages = 5; 
    let startPage = Math.max(1, paginaActual - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPaginas, startPage + maxPages - 1);
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        const pageParams = new URLSearchParams(baseParams);
        pageParams.set('pagina', i);
        pages.push(
            <Link 
                key={i} 
                href={`/?${pageParams.toString()}`} 
                className={`pagination-btn ${i === paginaActual ? 'active' : ''}`}
            >
                {i}
            </Link>
        );
    }
    
    // Botón Anterior
    const prevParams = new URLSearchParams(baseParams);
    prevParams.set('pagina', Math.max(1, paginaActual - 1));
    const prevLink = `/?${prevParams.toString()}`;

    // Botón Siguiente
    const nextParams = new URLSearchParams(baseParams);
    nextParams.set('pagina', Math.min(totalPaginas, paginaActual + 1));
    const nextLink = `/?${nextParams.toString()}`;

    return (
        // Esta estructura con flex-wrap soluciona tu bug de diseño
        <div className="pagination-container">
            <Link 
                href={prevLink} 
                className={`pagination-btn ${paginaActual === 1 ? 'disabled' : ''}`}
            >
                &laquo; Anterior
            </Link>
            
            {pages}
            
             <Link 
                href={nextLink} 
                className={`pagination-btn ${paginaActual === totalPaginas ? 'disabled' : ''}`}
            >
                Siguiente &raquo;
            </Link>
        </div>
    );
}