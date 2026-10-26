import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { DEMO } from './config';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PoliticianSearch from './pages/PoliticianSearch';
import PolicyCompare from './pages/PolicyCompare';
import NewsSummary from './pages/NewsSummary';
import Chatbot from './pages/Chatbot';
import NotFound from './pages/NotFound';

// 데모(GitHub Pages)는 새로고침 404 를 피하려고 HashRouter 를 쓴다.
const Router = DEMO ? HashRouter : BrowserRouter;

function App() {
  return (
    <Router>
      <div className="app">
        {DEMO && <div className="demo-banner">데모 모드: 실제 AI 서버 없이 미리 준비한 답변으로 동작합니다</div>}
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/politician" element={<PoliticianSearch />} />
            <Route path="/policy" element={<PolicyCompare />} />
            <Route path="/news" element={<NewsSummary />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
