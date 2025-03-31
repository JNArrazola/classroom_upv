import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MaestroClases = () => {
  const { usuario } = useAuth();
  const [clases, setClases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerClases = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/clases/maestro/${usuario.id}`, {
          headers: {
            Authorization: `Bearer ${usuario.token}`
          }
        });
        setClases(res.data);
      } catch (err) {
        console.error('Error al obtener clases:', err);
      }
    };

    obtenerClases();
  }, [usuario]);

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>Tus Clases</h2>
      <button onClick={() => navigate('/maestro/crear-clase')}>+ Crear nueva clase</button>
      <ul>
        {clases.map(clase => (
          <li key={clase.id}>
            <strong>{clase.nombre}</strong> — {clase.codigo_grupo}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaestroClases;
