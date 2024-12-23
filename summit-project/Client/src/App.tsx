import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css'
import LoginPage from './pages/login/LoginPage';
import MainContent from './pages/logged-in/mainContent';
import { useEffect, useState } from 'react';
import { useUser } from './contexts/User-Context';

function App() {
  const { user } = useUser();
  const [ isLoggedIn, setIsLoggedIn ] = useState(false)
  useEffect(()=>{
    if(user){
      setIsLoggedIn(user.isLoggedIn)
    }
  },[user]);
  return (
    <BrowserRouter>
      {!isLoggedIn ? 
        <Routes>
          <Route path="/" element={<LoginPage />} />
        </Routes>
      :
        <Routes>
          <Route path="/" element={<MainContent />} /> 
        </Routes>
      }
    </BrowserRouter>
  )
}

export default App