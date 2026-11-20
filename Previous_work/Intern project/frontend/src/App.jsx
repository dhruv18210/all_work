import React from 'react';
import Workflow from './components/Workflow';

function App() {
  return (
    <div className="container">
      <header className="text-center mb-8">
        <h1>AI Growth Intelligence</h1>
        <p>Analyze social presence, build strategies, and generate premium content autonomously.</p>
      </header>
      
      <main>
        <Workflow />
      </main>
    </div>
  );
}

export default App;
