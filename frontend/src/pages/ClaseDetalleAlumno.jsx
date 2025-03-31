import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ClaseDetalleAlumno.css';

const ClaseDetalleAlumno = () => {
  const { id } = useParams();
  const [clase, setClase] = useState(null);
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const claseRes = await axios.get(`/api/clases/${id}/detalle`);
        setClase(claseRes.data);

        const avisosRes = await axios.get(`/api/avisos/clase/${id}`);
        setAvisos(avisosRes.data);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };

    fetchData();
  }, [id]);

  if (!clase) return <div className="cargando">Cargando clase...</div>;

  return (
    <div className="clase-detalle-alumno">
      <h2 className="titulo-clase">{clase.nombre} - {clase.grupo}</h2>

      <div className="contenido-clase">
        {/* Avisos */}
        <div className="avisos">
          <h3>Avisos del maestro</h3>
          {avisos.length === 0 && <p>No hay avisos aún.</p>}
          {avisos.map(aviso => (
            <div key={aviso.id} className="aviso">
              <p className="aviso-titulo">{aviso.titulo}</p>
              <p className="aviso-contenido">{aviso.contenido}</p>
              <small>{new Date(aviso.fecha_creacion).toLocaleString()}</small>
              {aviso.archivos?.length > 0 && (
                <div className="archivos">
                  <strong>Archivos adjuntos:</strong>
                  <ul>
                    {aviso.archivos.map((archivo, index) => (
                      <li key={index}>
                        <a href={`/storage/${archivo.ruta}`} target="_blank" rel="noopener noreferrer">
                          {archivo.nombre_archivo}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Participantes */}
        <div className="participantes">
          <div className="viñeta maestro">
            <h4>👨‍🏫 Maestro</h4>
            <p>{clase.maestro?.nombre}</p>
          </div>
          <div className="viñeta alumnos">
            <h4>👥 Compañeros</h4>
            <ul>
              {clase.alumnos.map(alumno => (
                <li key={alumno.id}>{alumno.nombre}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaseDetalleAlumno;
