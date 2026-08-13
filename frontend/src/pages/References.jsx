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
    colorClass: 'amrita-theme',
    domain: 'AMRITA.EDU'
  },
  {
    id: 2,
    category: 'ENGINEERING HUB',
    title: 'Virtual Labs IIT Kharagpur',
    desc: 'vlab.iitkgp.ac.in — Engineering physics labs and optics experiments for advanced research.',
    linkText: 'Visit Source',
    linkUrl: 'http://vlab.iitkgp.ac.in',
    icon: '🧪',
    colorClass: 'iit-theme',
    domain: 'IITKGP.AC.IN'
  },
  {
    id: 3,
    category: 'OPEN COURSEWARE',
    title: 'NPTEL (IIT/IISc)',
    desc: 'nptel.ac.in — Free lectures & comprehensive lab manuals on applied physics and quantum mechanics.',
    linkText: 'Visit Source',
    linkUrl: 'https://nptel.ac.in',
    icon: '🎓',
    colorClass: 'nptel-theme',
    domain: 'NPTEL.AC.IN'
  },
  {
    id: 4,
    category: 'INTERACTIVE VISUALS',
    title: 'PhET Interactive Simulations',
    desc: 'phet.colorado.edu — Free physics simulations, University of Colorado Boulder. Pioneer in visual learning.',
    linkText: 'Visit Source',
    linkUrl: 'https://phet.colorado.edu',
    icon: '📈',
    colorClass: 'phet-theme',
    domain: 'COLORADO.EDU'
  },
  {
    id: 5,
    category: 'NATIONAL INITIATIVE',
    title: 'Virtual Labs (MHRD)',
    desc: 'vlab.co.in — National virtual lab initiative for open-access science education, Govt. of India.',
    linkText: 'Visit Source',
    linkUrl: 'http://vlab.co.in',
    icon: '🌐',
    colorClass: 'mhrd-theme',
    domain: 'VLAB.CO.IN'
  },
  {
    id: 6,
    category: 'CURRICULUM',
    title: 'SIES GST Lab Manual',
    desc: 'First Year Engineering Applied Physics Laboratory — Official course manual, SIES Graduate School of Technology.',
    linkText: 'View Portal',
    linkUrl: '#',
    icon: '📖',
    colorClass: 'sies-theme',
    domain: 'SIES.EDU'
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
    <div className="refs-embedded-container" style={{ padding: '10px 0' }}>
      {/* Header Block */}
      <div style={{ textAlign: 'left', marginBottom: '40px', maxWidth: '1000px' }}>
        <p className="refs-eyebrow" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '11px', letterSpacing: '0.2em', color: '#2563eb', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase' }}>
          Documentation & Bibliography
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '16px' }}>
          <h2 className="refs-heading-title" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Academic References & Documentation
          </h2>
          
          {/* Inline Search Bar */}
          {setSearchQuery && (
            <div style={{ width: '100%', maxWidth: '360px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, fontSize: '0.85rem' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search reference guides, lab manuals..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 42px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '30px',
                  color: '#0f172a',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s'
                }}
              />
            </div>
          )}
        </div>

        <p style={{ maxWidth: '750px', margin: '0 0 16px', fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
          TheKinetix draws from these freely accessible academic resources. All simulations are built from first principles.
        </p>

        {/* Verified Academic Integrity Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid rgba(52, 211, 153, 0.3)', background: 'rgba(52, 211, 153, 0.06)', color: '#059669', borderRadius: '30px', padding: '6px 16px', fontSize: '0.73rem', fontFamily: "'JetBrains Mono', monospace", fontWeight: '600', letterSpacing: '0.05em' }}>
          <span style={{ fontSize: '0.9rem', color: '#10b981' }}>✓</span> Verified Academic Integrity & Syllabus Standards
        </div>
      </div>

      {/* References Grid */}
      <div className="refs-layout-grid">
        {filteredSources.length > 0 ? (
          filteredSources.map(src => (
            <div key={src.id} className={`academic-ref-card ${src.colorClass}`}>
              <div>
                <span className="academic-category">{src.category}</span>
                <h3 className="academic-title">{src.title}</h3>
                
                {/* Visual Centered Circle Illustration */}
                <div className="ref-illustration-circle">
                  <span className="ref-illustration-emoji">{src.icon}</span>
                </div>

                <p className="academic-desc">{src.desc}</p>
              </div>

              {/* Card Footer */}
              <div className="academic-card-footer">
                <a 
                  href={src.linkUrl} 
                  target={src.linkUrl === '#' ? '_self' : '_blank'} 
                  rel="noreferrer" 
                  className="academic-link"
                >
                  {src.linkText} {src.linkText === 'View Portal' ? '📄' : '→'}
                </a>
                <span className="academic-domain-label">{src.domain}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', color: '#64748b', background: '#ffffff' }}>
            No academic reference sources match "{searchQuery}".
          </div>
        )}
      </div>

      {/* First Principles Methodology Block (Light Theme) */}
      <div className="methodology-banner" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '26px' }}>
        {/* Column 1: Title */}
        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
            First Principles Methodology
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
            All mathematical models used in our simulations—from interference fringe calculations to Hall coefficient derivations—are cross-referenced with these established academic sources.
          </p>
        </div>

        {/* Column 2: A Constant */}
        <div>
          <p className="methodology-label" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#2563eb', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' }}>
            Standard Constant
          </p>
          <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
            Sodium Light Standard
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
            Sodium monochromatic light is standardized at 5893 Å (589.3 nm) for all interference labs.
          </p>
        </div>

        {/* Column 3: Equation Verification */}
        <div>
          <p className="methodology-label" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#2563eb', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase' }}>
            Equation Verification
          </p>
          <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
            Airy's Formulation
          </h4>
          <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.5' }}>
            Wedge film and Newton's Rings equations follow the standard Airy's formulations for thin-film interference.
          </p>
        </div>
      </div>
    </div>
  )
}

