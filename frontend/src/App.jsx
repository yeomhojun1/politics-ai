import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PoliticianSearch from './pages/PoliticianSearch';
import PolicyCompare from './pages/PolicyCompare';
import NewsSummary from './pages/NewsSummary';
import Chatbot from './pages/Chatbot';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/politician" element={<PoliticianSearch />} />
            <Route path="/policy" element={<PolicyCompare />} />
            <Route path="/news" element={<NewsSummary />} />
            <Route path="/chat" element={<Chatbot />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
