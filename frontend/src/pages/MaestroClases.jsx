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

  const irACrearClase = () => navigate('/maestro/crear-clase');

  const irADetalleClase = (idClase) => navigate(`/maestro/clase/${idClase}`);

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Tus Clases</h2>
        <button onClick={irACrearClase}>+ Crear nueva clase</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        {clases.map(clase => (
          <div
            key={clase.id}
            onClick={() => irADetalleClase(clase.id)}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9',
              transition: '0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
          >
            <h3>{clase.nombre}</h3>
            <p><strong>Grupo:</strong> {clase.codigo_grupo}</p>
            <p><strong>Carrera:</strong> {clase.carrera}</p>
            <p><strong>Cuatrimestre:</strong> {clase.cuatrimestre}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaestroClases;
