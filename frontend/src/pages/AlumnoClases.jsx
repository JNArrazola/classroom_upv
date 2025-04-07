import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AlumnoClases.css';

const AlumnoClases = () => {
  const [clases, setClases] = useState([]);
  const [tareasProximas, setTareasProximas] = useState([]);
  const { usuario } = useAuth(); 

  useEffect(() => {
    if (!usuario?.id) return;
  
    const fetchClases = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/alumno/${usuario.id}/clases`);
        setClases(res.data);
      } catch (err) {
        console.error('Error al obtener las clases del alumno:', err);
      }
    };
  
    const fetchTareasProximas = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/alumno/${usuario.id}/tareas-proximas`);
        const ordenadas = res.data.sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega));
        setTareasProximas(ordenadas.slice(0, 3)); // Mostrar solo las 3 más cercanas
      } catch (err) {
        console.error('Error al obtener tareas próximas:', err);
      }
    };
  
    fetchClases();
    fetchTareasProximas();
  }, [usuario]);

  if (!usuario) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div className="alumno-clases">
      <h2>Mis Clases</h2>

      {tareasProximas.length > 0 && (
        <div className="proximas-tareas">
          <h3>📅 Próximas entregas</h3>
          <ul>
            {tareasProximas.map((tarea) => (
              <li key={tarea.id}>
                <Link to={`/alumno/clase/${tarea.id_clase}/tarea/${tarea.id}`} className="enlace-tarea">
                  <strong>{tarea.texto}</strong>
                </Link>
                <br />
                <span style={{ fontSize: '0.9rem' }}>
                  Clase: {tarea.nombre_clase} — entrega: {new Date(tarea.fecha_entrega).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {clases.length === 0 ? (
        <p>No estás inscrito en ninguna clase.</p>
      ) : (
        <div className="tarjetas-clases">
          {clases.map((clase) => (
            <Link
              to={`/alumno/clase/${clase.id}`}
              key={clase.id}
              className="tarjeta-clase"
            >
              <h3>{clase.nombre}</h3>
              <p>Grupo: {clase.grupo}</p>
              <p>Cuatrimestre: {clase.cuatrimestre}</p>
              <p>Carrera: {clase.carrera}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumnoClases;
