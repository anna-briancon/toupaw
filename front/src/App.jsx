import React from "react";
import { useSelector } from 'react-redux';
import { Navigate, BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Plus from './pages/Plus';
import CreatePet from './pages/CreatePet';
import Suivi from './pages/Suivi';
import RappelsList from './pages/RappelsList';
import PromenadesList from './pages/PromenadesList';
import AlimentationList from './pages/AlimentationList';
import HealthEventEdit from './pages/HealthEventEdit';
import PoidsList from './pages/PoidsList';
import SymptomesList from './pages/SymptomesList';
import SymptomEdit from './pages/SymptomEdit';
import MealEdit from './pages/MealEdit';


function PrivateRoute({ children }) {
  const token = useSelector(state => state.auth.token);
  return token ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const location = useLocation();
  const hideNav = ['/login', '/register'].includes(location.pathname);
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/plus" element={<Plus />} />
        <Route path="/create-pet" element={<CreatePet />} />
        <Route path="/suivi" element={<Suivi />} />
        <Route path="/suivi/rappels" element={<RappelsList />} />
        <Route path="/suivi/promenade" element={<PromenadesList />} />
        <Route path="/suivi/alimentation" element={<AlimentationList />} />
        <Route path="/suivi/health-event/:id" element={<HealthEventEdit />} />
        <Route path="/suivi/poids" element={<PoidsList />} />
        <Route path="/suivi/symptomes" element={<SymptomesList />} />
        <Route path="/suivi/symptome/:id" element={<SymptomEdit />} />
        <Route path="/suivi/repas/:id" element={<MealEdit />} />

        {/* ...autres routes */}
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
