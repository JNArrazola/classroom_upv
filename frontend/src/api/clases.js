import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const crearClase = async (data, token) => {
  const res = await axios.post(`${API_URL}/clases`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};

export const obtenerCarreras = async () => {
  const res = await axios.get(`${API_URL}/carreras`);
  return res.data;
};
