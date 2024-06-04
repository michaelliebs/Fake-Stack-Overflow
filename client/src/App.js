// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import FakeStackOverflow from './components/fakestackoverflow.js'
import React from 'react';

function App() {
  return (
    <section className="fakeso">
      <FakeStackOverflow />
    </section>
  );
}

export default App;
