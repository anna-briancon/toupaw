import React from "react";
import { useSelector } from 'react-redux';
import { Navigate, BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Plus from './pages/Plus';
import CreatePet from './pages/pet/CreatePet';
import Suivi from './pages/Suivi';
import ReminderList from './pages/reminder/ReminderList';
import ReminderEdit from './pages/reminder/ReminderEdit';
import WalkList from './pages/walk/WalkList';
import MealsList from './pages/meal/MealList';
import MealsEdit from './pages/meal/MealEdit';
import WeightList from './pages/weight/WeightList';
import SymptomesList from './pages/symptom/SymptomesList';
import SymptomEdit from './pages/symptom/SymptomEdit';


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
        <Route path="/suivi/rappels" element={<ReminderList />} />
        <Route path="/suivi/promenade" element={<WalkList />} />
        <Route path="/suivi/alimentation" element={<MealsList />} />
        <Route path="/suivi/health-event/:id" element={<ReminderEdit />} />
        <Route path="/suivi/poids" element={<WeightList />} />
        <Route path="/suivi/symptomes" element={<SymptomesList />} />
        <Route path="/suivi/symptome/:id" element={<SymptomEdit />} />
        <Route path="/suivi/repas/:id" element={<MealsEdit />} />

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
