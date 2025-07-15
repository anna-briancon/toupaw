// Exemple d'action asynchrone pour récupérer l'utilisateur connecté
// À adapter selon la logique de ton backend et de ton slice
import axios from '../../../utils/axiosInstance';
import { setUser } from './authSlice';

export const getUser = () => async (dispatch) => {
  try {
    const res = await axios.get('/auth/me');
    dispatch(setUser(res.data));
  } catch (e) {
    // Optionnel : gestion d'erreur
  }
}; 