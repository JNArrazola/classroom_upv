import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './TareaDetalleMaestro.css';

const TareaDetalleMaestro = () => {
  const { idClase, idTarea } = useParams(); // ya que ahora recibes los dos
  const { usuario } = useAuth();
  const [tarea, setTarea] = useState(null);
  const [entregas, setEntregas] = useState([]);

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

  const calificarEntrega = async (idEntrega, calificacion) => {
    try {
      await axios.put(`http://localhost:3001/api/entregas/${idEntrega}`, { calificacion }, {
        headers: { Authorization: `Bearer ${usuario.token}` }
      });
      setEntregas(prev => prev.map(e => e.id === idEntrega ? { ...e, calificacion } : e));
    } catch (err) {
      alert('Error al guardar calificación.');
    }
  };

  if (!tarea) return <p>Cargando tarea...</p>;

  return (<div className="tarea-detalle">
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
                <iframe src={`http://localhost:3001/storage/${archivo}#toolbar=0`} className="pdf-miniatura"></iframe>
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

            return (
              <tr key={entrega.id || entrega.id_alumno}>
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
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={entrega.calificacion || ''}
                      onChange={e => calificarEntrega(entrega.id, e.target.value)}
                    />
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
  </div>);
};

export default TareaDetalleMaestro;