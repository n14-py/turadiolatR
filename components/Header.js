import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Esta es la URL de tu API
const API_URL = 'https://lfaftechapi-7nrb.onrender.com/api';

export default function Header() {
    // --- 1. LÓGICA DEL MENÚ MÓVIL (de app.js) ---
    const [menuActivo, setMenuActivo] = useState(false);
    const closeMenu = () => setMenuActivo(false);

    // --- 2. LÓGICA DE CARGAR PAÍSES (de app.js) ---
    const [paises, setPaises] = useState([]);
    useEffect(() => {
        // Esta función se ejecuta una vez para cargar los países
        async function fetchPaises() {
            try {
                const response = await fetch(`${API_URL}/radio/paises`);
                if (!response.ok) throw new Error('Error al cargar países');
                const data = await response.json();
                data.sort((a, b) => a.name.localeCompare(b.name));
                setPaises(data);
            } catch (error) {
                console.error(error);
                // Si falla, al menos ponemos un enlace de error
                setPaises([{ code: 'error', name: 'Error al cargar' }]);
            }
        }
        fetchPaises();
    }, []); // El array vacío [] significa "ejecutar esto solo una vez"

    // --- 3. LÓGICA PARA MARCAR EL ENLACE ACTIVO (de app.js) ---
    const router = useRouter();
    const { filtro, pais, genero, query } = router.query;
    
    let activeFilter = 'populares'; // Por defecto
    if (filtro === 'generos' || genero) activeFilter = 'generos';
    if (pais) activeFilter = pais;
    if (query) activeFilter = 'search';

    // Para las páginas estáticas
    if (router.pathname.startsWith('/sobre-nosotros')) activeFilter = 'sobre-nosotros';
    if (router.pathname.startsWith('/contacto')) activeFilter = 'contacto';
    if (router.pathname.startsWith('/preguntas-frecuentes')) activeFilter = 'preguntas-frecuentes';
    
    const getLinkClass = (key) => {
        return activeFilter === key ? 'nav-link active' : 'nav-link';
    };

    return (
        <>
            <header className="main-header">
                <nav className="container">
                    <Link href="/" className="logo">
                        <i className="fas fa-broadcast-tower"></i> TuRadio.lat
                    </Link>
                    
                    <ul className="nav-links desktop-menu">
                        <li><Link href="/" className={getLinkClass('populares')} data-filtro="populares">Populares</Link></li>
                        <li><Link href="/generos" className={getLinkClass('generos')} data-filtro="generos">Géneros</Link></li>
                        
                        <li className="dropdown">
                            <a href="#" className="nav-link">Países <i className="fas fa-chevron-down"></i></a>
                            <ul id="dropdown-paises" className="dropdown-menu">
                                {paises.length === 0 ? (
                                    <li><a href="#">Cargando...</a></li>
                                ) : (
                                    paises.map(pais => (
                                        <li key={pais.code}>
                                            <Link 
                                                href={`/?pais=${pais.code}`} 
                                                className={getLinkClass(pais.code)} 
                                                data-filtro={pais.code}
                                            >
                                                {pais.name}
                                            </Link>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </li>
                        <li><Link href="/sobre-nosotros" className={getLinkClass('sobre-nosotros')}>Sobre Nosotros</Link></li>
                        <li><Link href="/contacto" className={getLinkClass('contacto')} data-filtro="contacto">Contacto</Link></li>
                    </ul>

                    <button id="menu-toggle" className="menu-toggle" onClick={() => setMenuActivo(true)}>
                        <i className="fas fa-bars"></i>
                    </button>
                </nav>
            </header>

            {/* --- Menú Móvil --- */}
            <div id="mobile-menu" className={menuActivo ? "mobile-menu active" : "mobile-menu"}>
                <div className="mobile-menu-header">
                    <button id="menu-close" className="menu-close" onClick={closeMenu}>&times;</button>
                </div>
                <div className="mobile-menu-content">
                    <Link href="/" className={getLinkClass('populares')} data-filtro="populares" onClick={closeMenu}>Radios Populares</Link>
                    <Link href="/generos" className={getLinkClass('generos')} data-filtro="generos" onClick={closeMenu}>Buscar por Género</Link>
                    <hr />
                    <div id="mobile-paises">
                         {paises.length === 0 ? (
                            <a href="#" className="nav-link">Cargando países...</a>
                        ) : (
                            paises.map(pais => (
                                <Link 
                                    key={pais.code} 
                                    href={`/?pais=${pais.code}`} 
                                    className={getLinkClass(pais.code)} 
                                    data-filtro={pais.code} 
                                    onClick={closeMenu}
                                >
                                    {pais.name}
                                </Link>
                            ))
                        )}
                    </div>
                    <hr />
                    <Link href="/sobre-nosotros" className={getLinkClass('sobre-nosotros')} onClick={closeMenu}>Sobre Nosotros</Link>
                    <Link href="/preguntas-frecuentes" className={getLinkClass('preguntas-frecuentes')} onClick={closeMenu}>Preguntas Frecuentes</Link>
                    <Link href="/contacto" className={getLinkClass('contacto')} data-filtro="contacto" onClick={closeMenu}>Contacto</Link>
                </div>
            </div>

            {/* --- Overlay --- */}
            <div id="overlay" className={menuActivo ? "overlay active" : "overlay"} onClick={closeMenu}></div>
        </>
    );
}