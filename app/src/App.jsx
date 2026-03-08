import { useState } from 'react';
import { seedCategories, categoriesList } from './data/mockData';
import SeedCard from './components/SeedCard';
import './App.css';

function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Filter logic: if 'All', flatten all items, else find the specific category
  const displayedItems = activeCategory === 'All' 
    ? seedCategories.flatMap(c => c.items)
    : seedCategories.find(c => c.category === activeCategory)?.items || [];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>SEED LIB</h2>
        </div>
        <nav className="sidebar-nav">
          <ul className="category-list">
            {categoriesList.map(cat => (
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
        
        <div className="seed-feed" key={activeCategory}>
          {displayedItems.length > 0 ? (
            displayedItems.map(item => (
              <SeedCard 
                key={item.id} 
                prompt={item.prompt} 
                images={item.images} 
              />
            ))
          ) : (
            <div className="empty-state">
              <p>No seeds available for {activeCategory} yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
