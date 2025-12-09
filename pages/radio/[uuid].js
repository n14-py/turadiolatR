import Layout from '../../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { usePlayer } from '../../context/PlayerContext'; // Importamos el "cerebro"
import { useState } from 'react';

// --- Constantes ---
const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';
const PLACEHOLDER_LOGO = '/images/placeholder-radio.png';
const LOGO_FALLBACK_URL = 'https://api.radio-browser.info/json/stations/search?limit=1&byuuid=';

// --- 1. FUNCIÓN (Se ejecuta en el SERVIDOR) ---
export async function getStaticPaths() {
    return {
        paths: [], 
        fallback: 'blocking' 
    };
}

// --- 2. FUNCIÓN (Se ejecuta en el SERVIDOR) ---
export async function getStaticProps(context) {
    const { uuid } = context.params;
    const radioUrl = `${API_URL}/radio/${uuid}`; // URL de la radio principal
    
    let station;
    let recommended = [];
    let logoUrl = PLACEHOLDER_LOGO;

    try {
        // 1. Buscamos la radio principal
        const radioResponse = await fetch(radioUrl);
        if (!radioResponse.ok) {
            throw new Error('Estación no encontrada');
        }
        station = await radioResponse.json();

        // 2. Buscamos el logo (igual que en app.js)
        if (station.logo && station.logo !== '') {
            logoUrl = station.logo;
        } else {
            // Buscamos un logo de fallback
            try {
                const logoRes = await fetch(`${LOGO_FALLBACK_URL}${station.uuid}`);
                const logoData = await logoRes.json();
                if (logoData && logoData[0] && logoData[0].favicon && logoData[0].favicon !== '') {
                    logoUrl = logoData[0].favicon;
                }
            } catch (e) {
                console.warn("Error buscando logo de fallback");
            }
        }

        // 3. Buscamos radios recomendadas
        const recommendedParams = new URLSearchParams();
        recommendedParams.append('pais', station.pais_code);
        recommendedParams.append('excludeUuid', station.uuid);
        recommendedParams.append('limite', 10); 
        
        const recommendedResponse = await fetch(`${API_URL}/radio/buscar?${recommendedParams.toString()}`);
        if (recommendedResponse.ok) {
            const recommendedData = await recommendedResponse.json();
            recommended = recommendedData.radios; // Asignamos las radios
        }

        // 4. Devolvemos los datos como "props" a la página
        return {
            props: {
                station,
                recommended,
                logoUrl, // Pasamos el logo ya procesado
                canonicalUrl: `https://turadio.lat/radio/${uuid}`
            },
            revalidate: 3600 
        };
    } catch (error) {
        console.error("Error en getStaticProps (Radio):", error.message);
        return {
            notFound: true, // Esto mostrará la página 404
        };
    }
}

// --- 3. COMPONENTE DE LA PÁGINA (Se ejecuta en el NAVEGADOR) ---
export default function RadioPage({ station, recommended, logoUrl, canonicalUrl }) {
    const router = useRouter();
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    const isThisStationPlaying = currentStation?.uuid === station.uuid && isPlaying;

    const handlePrimaryPlayClick = () => {
        if (isThisStationPlaying) {
            pauseStation();
        } else {
            // Pasamos el logo que ya procesamos en el servidor
            playStation({ ...station, logo: logoUrl });
        }
    };

    const description = station.descripcionGenerada 
        ? station.descripcionGenerada.substring(0, 155) + '...'
        : `Escucha ${station.nombre} (${station.pais}) en vivo. La mejor radio online en TuRadio.lat.`;

    let descriptionHTML = '';
    if (station.descripcionGenerada && station.descripcionGenerada.trim() !== '') {
        descriptionHTML = station.descripcionGenerada.split('\n')
                           .filter(p => p.trim() !== '')
                           .map((p, i) => `<p>${p.trim()}</p>`)
                           .join('');
    }

    // --- Lógica del formulario de búsqueda ---
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const query = searchTerm.trim();
        if (!query) return;
        router.push(`/?query=${encodeURIComponent(query)}&pagina=1`);
    };

    return (
        <Layout>
            <Head>
                <title>{`${station.nombre} - ${station.pais} | TuRadio.lat`}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={canonicalUrl} />
                
                <meta property="og:title" content={`${station.nombre} - ${station.pais} | TuRadio.lat`} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={logoUrl.startsWith('http') ? logoUrl : `https://turadio.lat${logoUrl}`} />
            </Head>

            {/* Formulario de Búsqueda (corregido para usar router) */}
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
            </form>

            <div className="station-info-page">
                <div className="station-info-header">
                    <img 
                        src={logoUrl} 
                        alt={station.nombre} 
                        onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_LOGO; }}
                        className="station-logo"
                    />
                    <div className="station-info-header-text">
                        <h1>{station.nombre}</h1>
                        <p>{station.pais}</p>
                        <button 
                            className={`btn-play primary-play-btn ${isThisStationPlaying ? 'is-playing' : ''}`}
                            onClick={handlePrimaryPlayClick}
                            aria-label={isThisStationPlaying ? 'Pausar' : 'Escuchar Ahora'}
                        >
                            <i className={`fas ${isThisStationPlaying ? 'fa-pause' : 'fa-play'}`}></i> 
                            <span>{isThisStationPlaying ? 'Pausar' : 'Escuchar Ahora'}</span>
                        </button>
                    </div>
                </div>
                
                <div className="station-info-body">
                    <div className="station-info-details">
                        <h3>Detalles de la Estación</h3>
                        <ul>
                            <li><strong>País:</strong> {station.pais}</li>
                            <li><strong>Popularidad:</strong> {station.popularidad} votos</li>
                        </ul>

                        {descriptionHTML && (
                            <>
                                <h3>Sobre {station.nombre}</h3>
                                <div 
                                    className={`station-info-description ${isDescExpanded ? 'expanded' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: descriptionHTML }}
                                />
                                <button 
                                    className="toggle-description-btn"
                                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                                >
                                    {isDescExpanded ? 'Mostrar menos' : 'Leer más'} 
                                    <i className={`fas ${isDescExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                </button>
                            </>
                        )}
                        
                        <h3>Géneros</h3>
                        <div className="station-info-tags">
                            {(station.generos || '').split(',').map(g => g.trim()).filter(g => g).length > 0 ? (
                                station.generos.split(',').map(g => g.trim()).filter(g => g).map(genero => (
                                    <Link key={genero} href={`/?genero=${encodeURIComponent(genero)}`} className="tag-btn">
                                        {genero}
                                    </Link>
                                ))
                            ) : (
                                <p style={{ color: 'var(--color-texto-secundario)', fontSize: '0.9rem' }}>No hay géneros específicos.</p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="btn-back-container">
                    <button onClick={() => router.back()} className="btn-back">
                         <i className="fas fa-arrow-left"></i> Volver atrás
                    </button>
                </div>
            </div>

            {recommended.length > 0 && (
                <section id="recommended-section" style={{ paddingTop: '1rem', marginTop: '3rem' }}>
                    <h2 id="page-title">Radios Recomendadas de {station.pais}</h2>
                    <div id="stations-container" className="recommended-grid">
                        {recommended.map(recStation => (
                            // ¡Usamos el componente 'StationCard' de abajo!
                            <StationCard key={recStation.uuid} station={recStation} />
                        ))}
                    </div>
                </section>
            )}

        </Layout>
    );
}

// --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
// Este es el componente de tarjeta de radio correcto, 
// que antes faltaba y causaba el 404.
function StationCard({ station }) {
    const { playStation, pauseStation, currentStation, isPlaying } = usePlayer();
    const logo = station.logo || PLACEHOLDER_LOGO;
    const isThisStationPlaying = currentStation?.uuid === station.uuid && isPlaying;

    const handlePlayClick = () => {
        if (isThisStationPlaying) {
            pauseStation();
        } else {
            playStation(station);
        }
    };
    
    const stationUrl = `/radio/${station.uuid}`;

    return (
        <div className={`station-card small-card ${isThisStationPlaying ? 'is-playing' : ''}`}>
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
                {isThisStationPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
            </button>
        </div>
    );
}