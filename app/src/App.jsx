import { useState } from 'react'
import './App.css'

function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'Cinematic', '3D', 'Anime', 'Photography', 'Abstract'];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>SEED LIB</h2>
        </div>
        <nav className="sidebar-nav">
          <ul className="category-list">
            {categories.map(cat => (
              <li key={cat}>
                <button 
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="main-header">
          <h1>{activeCategory} Styles</h1>
          <p className="subtitle">Explore curated Midjourney seeds for {activeCategory.toLowerCase()} generation.</p>
        </header>
        
        <div className="gallery-placeholder">
          <div className="empty-state">
            <p>Gallery content for {activeCategory} will appear here.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
