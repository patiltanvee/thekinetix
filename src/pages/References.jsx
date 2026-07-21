// src/pages/References.jsx

const REFERENCE_SOURCES = [
  {
    id: 1,
    category: 'INSTITUTION',
    title: 'Amrita Virtual Lab',
    desc: 'vlab.amrita.edu — Physics simulations & Newton\'s Rings module (Experiment No. 1520)',
    linkText: 'Visit Source',
    linkUrl: 'https://vlab.amrita.edu',
    icon: '🏛️',
    colorClass: 'amrita-theme'
  },
  {
    id: 2,
    category: 'ENGINEERING HUB',
    title: 'Virtual Labs IIT Kharagpur',
    desc: 'vlab.iitkgp.ac.in — Engineering physics labs and optics experiments for advanced research.',
    linkText: 'Visit Source',
    linkUrl: 'http://vlab.iitkgp.ac.in',
    icon: '🧪',
    colorClass: 'iit-theme'
  },
  {
    id: 3,
    category: 'OPEN COURSEWARE',
    title: 'NPTEL (IIT/IISc)',
    desc: 'nptel.ac.in — Free lectures & comprehensive lab manuals on applied physics and quantum mechanics.',
    linkText: 'Visit Source',
    linkUrl: 'https://nptel.ac.in',
    icon: '🎓',
    colorClass: 'nptel-theme'
  },
  {
    id: 4,
    category: 'INTERACTIVE VISUALS',
    title: 'PhET Interactive Simulations',
    desc: 'phet.colorado.edu — Free physics simulations, University of Colorado Boulder. Pioneer in visual learning.',
    linkText: 'Visit Source',
    linkUrl: 'https://phet.colorado.edu',
    icon: '📈',
    colorClass: 'phet-theme'
  },
  {
    id: 5,
    category: 'NATIONAL INITIATIVE',
    title: 'Virtual Labs (MHRD)',
    desc: 'vlab.co.in — National virtual lab initiative for open-access science education, Govt. of India.',
    linkText: 'Visit Source',
    linkUrl: 'http://vlab.co.in',
    icon: '🌐',
    colorClass: 'mhrd-theme'
  },
  {
    id: 6,
    category: 'CURRICULUM',
    title: 'SIES GST Lab Manual',
    desc: 'First Year Engineering Applied Physics Laboratory — Official course manual, SIES Graduate School of Technology.',
    linkText: 'View Portal',
    linkUrl: '#',
    icon: '📖',
    colorClass: 'sies-theme'
  }
]

export default function References({ searchQuery = '', setSearchQuery }) {
  const filteredSources = REFERENCE_SOURCES.filter(src => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      src.title.toLowerCase().includes(query) ||
      src.category.toLowerCase().includes(query) ||
      src.desc.toLowerCase().includes(query)
    )
  })

  return (
    <div className="refs-embedded-container" style={{ padding: '20px 0' }}>
      {/* Header Block */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p className="refs-eyebrow" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase' }}>
          Documentation & Bibliography
        </p>
        <h2 className="refs-heading-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '700', color: 'var(--text)', marginBottom: '14px', letterSpacing: '-0.02em' }}>
          Academic References & Documentation
        </h2>
        <p style={{ maxWidth: '650px', margin: '0 auto 20px', fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          TheKinetix draws from these freely accessible academic resources. All simulations are built from first principles.
        </p>
        
        {/* Inline Search Bar */}
        {setSearchQuery && (
          <div style={{ maxWidth: '440px', margin: '0 auto 24px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, fontSize: '0.85rem' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search reference guides, lab manuals, sources..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 42px',
                background: 'var(--surface2)',
                border: '1px solid var(--border2)',
                borderRadius: '30px',
                color: 'var(--text)',
                fontSize: '0.85rem',
                outline: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
            />
          </div>
        )}

        {/* Verified Academic Integrity Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid rgba(79, 209, 197, 0.22)', background: 'rgba(79, 209, 197, 0.04)', color: 'var(--accent2)', borderRadius: '30px', padding: '6px 16px', fontSize: '0.73rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: '500', letterSpacing: '0.05em' }}>
          <span style={{ fontSize: '0.85rem' }}>✓</span> Verified Academic Integrity & Syllabus Standards
        </div>
      </div>

      {/* References Grid */}
      <div className="refs-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px', marginBottom: '50px' }}>
        {filteredSources.length > 0 ? (
          filteredSources.map(src => (
            <div key={src.id} className={`academic-ref-card ${src.colorClass}`} style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s', minHeight: '250px' }}>
              <div>
                {/* Styled Icon Wrapper */}
                <div className="academic-ico-box" style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', marginBottom: '16px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  {src.icon}
                </div>
                
                {/* Category Label */}
                <p className="academic-category" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
                  {src.category}
                </p>
                
                {/* Title */}
                <h3 className="academic-title" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)', marginBottom: '10px' }}>
                  {src.title}
                </h3>
                
                {/* Description */}
                <p className="academic-desc" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.55', marginBottom: '20px' }}>
                  {src.desc}
                </p>
              </div>

              {/* Footer Link */}
              <a 
                href={src.linkUrl} 
                target={src.linkUrl === '#' ? '_self' : '_blank'} 
                rel="noreferrer" 
                className="academic-link"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent)', textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {src.linkText} {src.linkText === 'View Portal' ? '📄' : '↗'}
              </a>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            No academic reference sources match "{searchQuery}".
          </div>
        )}
      </div>

      {/* First Principles Methodology Block */}
      <div className="methodology-banner" style={{ background: 'rgba(15, 24, 41, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '26px' }}>
        
        {/* Column 1: Title */}
        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)', marginBottom: '10px' }}>
            First Principles Methodology
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            All mathematical models used in our simulations—from interference fringe calculations to Hall coefficient derivations—are cross-referenced with these established academic sources.
          </p>
        </div>

        {/* Column 2: A Constant */}
        <div>
          <p className="methodology-label" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
            Standard Constant
          </p>
          <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
            Sodium Light Standard
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Sodium monochromatic light is standardized at 5893 Å (589.3 nm) for all interference labs.
          </p>
        </div>

        {/* Column 3: Equation Verification */}
        <div>
          <p className="methodology-label" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
            Equation Verification
          </p>
          <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
            Airy's Formulation
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Wedge film and Newton's Rings equations follow the standard Airy's formulations for thin-film interference.
          </p>
        </div>
      </div>
    </div>
  )
}

