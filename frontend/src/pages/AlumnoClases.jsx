import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AlumnoClases.css';

const AlumnoClases = () => {
  const [clases, setClases] = useState([]);
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

    fetchClases();
  }, [usuario]);

  if (!usuario) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div className="alumno-clases">
      <h2>Mis Clases</h2>
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
