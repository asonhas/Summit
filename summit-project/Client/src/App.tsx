import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import LoginPage from './pages/login/LoginPage';
import MainContent from './pages/logged-in/mainContent';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} /> 
        <Route path='/main' element={<MainContent />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App