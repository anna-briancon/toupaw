import React from "react";
import { useSelector } from 'react-redux';
import { Navigate, BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import MultiPets from './pages/pet/MultiPets.jsx';
import EditPet from './pages/pet/EditPet.jsx';
import AccountSettings from './pages/auth/AccountSettings';
import FAQSupport from './pages/FAQSupport';
import Advice from './pages/Advice';


function PrivateRoute({ children }) {
  const token = useSelector(state => state.auth.token);
  return token ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const location = useLocation();
  const hideNav = ['/login', '/register'].includes(location.pathname);
  const token = useSelector(state => state.auth.token);
  const navigate = useNavigate();
  const publicRoutes = ['/login', '/register'];
  React.useEffect(() => {
    if (!token && !publicRoutes.includes(location.pathname)) {
      navigate('/login');
    }
  }, [token, navigate, location.pathname]);
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/plus" element={<PrivateRoute><Plus /></PrivateRoute>} />
        <Route path="/create-pet" element={<PrivateRoute><CreatePet /></PrivateRoute>} />
        <Route path="/multi-pets" element={<PrivateRoute><MultiPets /></PrivateRoute>} />
        <Route path="/edit-pet/:id" element={<PrivateRoute><EditPet /></PrivateRoute>} />
        <Route path="/suivi" element={<PrivateRoute><Suivi /></PrivateRoute>} />
        <Route path="/suivi/rappels" element={<PrivateRoute><ReminderList /></PrivateRoute>} />
        <Route path="/suivi/promenade" element={<PrivateRoute><WalkList /></PrivateRoute>} />
        <Route path="/suivi/alimentation" element={<PrivateRoute><MealsList /></PrivateRoute>} />
        <Route path="/suivi/health-event/:id" element={<PrivateRoute><ReminderEdit /></PrivateRoute>} />
        <Route path="/suivi/poids" element={<PrivateRoute><WeightList /></PrivateRoute>} />
        <Route path="/suivi/symptomes" element={<PrivateRoute><SymptomesList /></PrivateRoute>} />
        <Route path="/suivi/symptome/:id" element={<PrivateRoute><SymptomEdit /></PrivateRoute>} />
        <Route path="/suivi/repas/:id" element={<PrivateRoute><MealsEdit /></PrivateRoute>} />
        <Route path="/account-settings" element={<PrivateRoute><AccountSettings /></PrivateRoute>} />
        <Route path="/faq-support" element={<PrivateRoute><FAQSupport /></PrivateRoute>} />
        <Route path="/advice" element={<PrivateRoute><Advice /></PrivateRoute>} />
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
