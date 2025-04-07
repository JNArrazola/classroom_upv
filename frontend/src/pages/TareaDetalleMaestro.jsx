import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './TareaDetalleMaestro.css';

const TareaDetalleMaestro = () => {
  const { idClase, idTarea } = useParams();
  const { usuario } = useAuth();
  const [tarea, setTarea] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [calificacionesTemp, setCalificacionesTemp] = useState({});

  useEffect(() => {
    const fetchTarea = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/avisos/${idTarea}`);
        setTarea(res.data);
      } catch (err) {
        console.error('Error al cargar la tarea:', err);
      }
    };

    const fetchEntregas = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/tareas/${idTarea}/entregas`, {
          headers: { Authorization: `Bearer ${usuario.token}` }
        });
        setEntregas(res.data);
      } catch (err) {
        console.error('Error al cargar entregas:', err);
      }
    };

    fetchTarea();
    fetchEntregas();
  }, [idTarea, usuario]);

  const calificarEntrega = async (entregaId, calificacion) => {
    if (isNaN(calificacion)) return alert('La calificación debe ser un número válido');
    const cal = parseFloat(calificacion);
    if (cal < 0 || cal > (tarea.puntaje_maximo || 100)) {
      return alert(`La calificación debe estar entre 0 y ${tarea.puntaje_maximo || 100}`);
    }
    try {
      await axios.put(`http://localhost:3001/api/entregas/${entregaId}`, { calificacion: cal });
      setEntregas(prev => prev.map(ent =>
        ent.id_entrega === entregaId ? { ...ent, calificacion: cal } : ent
      ));
      setCalificacionesTemp(prev => {
        const updated = { ...prev };
        delete updated[entregaId];
        return updated;
      });
    } catch (err) {
      console.error('Error al calificar:', err);
      alert('No se pudo guardar la calificación');
    }
  };

  if (!tarea) return <p>Cargando tarea...</p>;

  const puntajeMaximo = tarea.puntaje_maximo || 100;

  return (
    <div className="tarea-detalle">
      <h2>📝 {tarea.texto}</h2>
      <p><strong>Fecha de publicación:</strong> {new Date(tarea.fecha).toLocaleString()}</p>
      {tarea.fecha_entrega && (
        <p><strong>Fecha de entrega:</strong> {new Date(tarea.fecha_entrega).toLocaleDateString()}</p>
      )}

      {tarea.archivos?.length > 0 && (
        <div className="adjuntos-grid">
          {tarea.archivos.map((archivo, index) => {
            const isImage = archivo.match(/\.(jpg|jpeg|png|gif)$/i);
            const isPDF = archivo.match(/\.pdf$/i);
            return (
              <div key={index} className="adjunto-card">
                {isImage ? (
                  <img src={`http://localhost:3001/storage/${archivo}`} alt={`Archivo ${index}`} className="imagen-miniatura" />
                ) : isPDF ? (
                  <iframe src={`http://localhost:3001/storage/${archivo}#toolbar=0`} className="pdf-miniatura" title={`Archivo ${index}`}></iframe>
                ) : (
                  <p>Archivo {index + 1}</p>
                )}
                <a href={`http://localhost:3001/storage/${archivo}`} target="_blank" rel="noopener noreferrer">Ver archivo</a>
              </div>
            );
          })}
        </div>
      )}

      <h3>Entregas de alumnos</h3>
      {entregas.length === 0 ? (
        <p>No hay entregas registradas.</p>
      ) : (
        <table className="tabla-entregas">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Archivo</th>
              <th>Fecha de entrega</th>
              <th>Estatus</th>
              <th>Calificación</th>
            </tr>
          </thead>
          <tbody>
            {entregas.map(entrega => {
              const fechaEntrega = entrega.fecha_entrega ? new Date(entrega.fecha_entrega) : null;
              const fechaLimite = tarea.fecha_entrega ? new Date(tarea.fecha_entrega) : null;
              const hoy = new Date();

              let estatus = '';
              let estatusColor = '';

              if (!fechaEntrega && fechaLimite && hoy > fechaLimite) {
                estatus = 'Sin entregar';
                estatusColor = 'red';
              } else if (fechaEntrega && fechaLimite && fechaEntrega > fechaLimite) {
                estatus = 'Entregado tarde';
                estatusColor = 'orange';
              } else if (fechaEntrega) {
                estatus = 'Entregado a tiempo';
                estatusColor = 'green';
              } else {
                estatus = '-';
                estatusColor = '';
              }

              const calTemp = calificacionesTemp[entrega.id_entrega];

              return (
                <tr key={entrega.id_entrega || entrega.id_alumno}>
                  <td>{entrega.nombre_alumno}</td>
                  <td>
                    {fechaEntrega ? (
                      <a href={`http://localhost:3001/storage/${entrega.archivo}`} target="_blank" rel="noreferrer">
                        Ver archivo
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{fechaEntrega ? fechaEntrega.toLocaleString() : '—'}</td>
                  <td style={{ color: estatusColor, fontWeight: 'bold' }}>{estatus}</td>
                  <td>
                    {fechaEntrega ? (
                      <>
                        <input
                          type="number"
                          min="0"
                          max={puntajeMaximo}
                          placeholder="0"
                          value={calTemp !== undefined ? calTemp : entrega.calificacion ?? ''}
                          onChange={e =>
                            setCalificacionesTemp(prev => ({
                              ...prev,
                              [entrega.id_entrega]: e.target.value
                            }))
                          }
                          onBlur={() => {
                            const nueva = calificacionesTemp[entrega.id_entrega];
                            if (
                              nueva !== undefined &&
                              nueva !== '' &&
                              nueva !== String(entrega.calificacion)
                            ) {
                              calificarEntrega(entrega.id_entrega, nueva);
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            }
                          }}
                        />
                        <span style={{ marginLeft: '5px' }}>/ {puntajeMaximo}</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TareaDetalleMaestro;