import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { POPULAR_BRANDS } from '../data/brandsData';

const BrandLogoCarousel = ({ selectedBrand, onBrandSelect, brandCounts = {}, title = "Popular Brands" }) => {
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScrollButtons();
        window.addEventListener('resize', checkScrollButtons);
        return () => window.removeEventListener('resize', checkScrollButtons);
    }, []);

    const handleScroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScrollButtons, 350);
        }
    };

    // Normalize selected brand for case-insensitive comparison
    const isBrandSelected = (brandName) => {
        if (!selectedBrand) return false;
        if (Array.isArray(selectedBrand)) {
            return selectedBrand.some(b => b.trim().toLowerCase() === brandName.trim().toLowerCase());
        }
        return selectedBrand.trim().toLowerCase() === brandName.trim().toLowerCase();
    };

    return (
        <div className="brand-carousel-wrapper" style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '20px 24px',
            marginBottom: '28px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            position: 'relative'
        }}>
            <style>{`
                .brand-scroll-track::-webkit-scrollbar {
                    display: none;
                }
                .brand-scroll-track {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .brand-card-item {
                    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
                }
                .brand-card-item:hover .brand-logo-circle {
                    transform: translateY(-3px);
                    border-color: #0284c7 !important;
                    box-shadow: 0 8px 18px rgba(2, 132, 199, 0.16) !important;
                }
                .brand-card-item:hover .brand-label-text {
                    color: #0284c7 !important;
                }
                .carousel-nav-btn {
                    transition: background-color 0.2s, transform 0.15s, opacity 0.2s;
                }
                .carousel-nav-btn:hover:not(:disabled) {
                    background-color: #0284c7 !important;
                    color: #ffffff !important;
                    transform: scale(1.08);
                }
                .carousel-nav-btn:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }
                @media (max-width: 640px) {
                    .brand-carousel-wrapper {
                        padding: 16px 14px !important;
                    }
                    .carousel-nav-btn {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Header / Subheading */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} color="#0284c7" />
                        {title}
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                        Filter verified cars by your preferred manufacturer
                    </p>
                </div>

                {/* Arrow navigation buttons for desktop */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={() => handleScroll('left')}
                        disabled={!canScrollLeft}
                        className="carousel-nav-btn"
                        aria-label="Previous Brands"
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: canScrollLeft ? 'pointer' : 'default',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                        }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleScroll('right')}
                        disabled={!canScrollRight}
                        className="carousel-nav-btn"
                        aria-label="Next Brands"
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: canScrollRight ? 'pointer' : 'default',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                        }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Horizontally scrollable track */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScrollButtons}
                className="brand-scroll-track"
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '18px',
                    overflowX: 'auto',
                    padding: '8px 4px 10px 4px',
                    scrollSnapType: 'x proximity',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {/* "All Brands" Item to reset filter */}
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onBrandSelect('')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onBrandSelect(''); }}
                    className="brand-card-item"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flexShrink: 0,
                        width: '82px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        scrollSnapAlign: 'start',
                        userSelect: 'none'
                    }}
                >
                    <div
                        className="brand-logo-circle"
                        style={{
                            width: '68px',
                            height: '68px',
                            borderRadius: '50%',
                            backgroundColor: !selectedBrand || selectedBrand.length === 0 ? '#0284c7' : '#f8fafc',
                            border: !selectedBrand || selectedBrand.length === 0 ? '2.5px solid #0284c7' : '1.5px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: !selectedBrand || selectedBrand.length === 0 ? '0 0 0 3px rgba(2, 132, 199, 0.2), 0 6px 14px rgba(2, 132, 199, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s',
                            position: 'relative'
                        }}
                    >
                        <span style={{
                            fontSize: '0.82rem',
                            fontWeight: '800',
                            color: !selectedBrand || selectedBrand.length === 0 ? '#ffffff' : '#475569',
                            letterSpacing: '0.3px'
                        }}>
                            ALL
                        </span>
                    </div>
                    <span
                        className="brand-label-text"
                        style={{
                            marginTop: '8px',
                            fontSize: '0.8rem',
                            fontWeight: !selectedBrand || selectedBrand.length === 0 ? '700' : '600',
                            color: !selectedBrand || selectedBrand.length === 0 ? '#0284c7' : '#475569',
                            whiteSpace: 'nowrap',
                            transition: 'color 0.2s'
                        }}
                    >
                        All Brands
                    </span>
                </div>

                {/* Popular Brands List */}
                {POPULAR_BRANDS.map((brand) => {
                    const isSelected = isBrandSelected(brand.brandQuery);
                    const carCount = brandCounts[brand.name] || brandCounts[brand.brandQuery] || 0;

                    return (
                        <div
                            key={brand.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => onBrandSelect(isSelected ? '' : brand.brandQuery)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onBrandSelect(isSelected ? '' : brand.brandQuery);
                                }
                            }}
                            className="brand-card-item"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flexShrink: 0,
                                width: '84px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                scrollSnapAlign: 'start',
                                userSelect: 'none'
                            }}
                        >
                            {/* Circular Logo Container */}
                            <div
                                className="brand-logo-circle"
                                style={{
                                    width: '68px',
                                    height: '68px',
                                    borderRadius: '50%',
                                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                                    border: isSelected ? '2.5px solid #0284c7' : '1.5px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: isSelected
                                        ? '0 0 0 3px rgba(2, 132, 199, 0.22), 0 8px 18px rgba(2, 132, 199, 0.2)'
                                        : '0 2px 6px rgba(0, 0, 0, 0.04)',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    padding: '12px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <img
                                    src={brand.logo}
                                    alt={`${brand.name} logo`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        filter: isSelected ? 'none' : 'grayscale(15%)',
                                        transition: 'filter 0.2s'
                                    }}
                                    onError={(e) => {
                                        // Fallback if image fails
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = `<span style="font-size: 11px; font-weight: bold; color: #0284c7;">${brand.name.slice(0, 3)}</span>`;
                                    }}
                                />

                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-3px',
                                        right: '-3px',
                                        backgroundColor: '#0284c7',
                                        color: '#ffffff',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}>
                                        <Check size={11} strokeWidth={3} />
                                    </div>
                                )}
                            </div>

                            {/* Brand Name Text */}
                            <span
                                className="brand-label-text"
                                style={{
                                    marginTop: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: isSelected ? '700' : '600',
                                    color: isSelected ? '#0284c7' : '#334155',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '84px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    transition: 'color 0.2s'
                                }}
                                title={brand.name}
                            >
                                {brand.name}
                            </span>

                            {/* Count Badge (if count > 0) */}
                            {carCount > 0 && (
                                <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: '600',
                                    color: isSelected ? '#0284c7' : '#64748b',
                                    backgroundColor: isSelected ? '#e0f2fe' : '#f1f5f9',
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    marginTop: '2px'
                                }}>
                                    {carCount} {carCount === 1 ? 'car' : 'cars'}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BrandLogoCarousel;
