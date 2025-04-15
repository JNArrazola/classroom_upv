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
  const [modalArchivos, setModalArchivos] = useState({ visible: false, archivos: [] });

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
    
        const mapa = new Map();
    
        // Agrupamos entregas por alumno
        for (const e of res.data) {
          if (!mapa.has(e.id_alumno)) {
            mapa.set(e.id_alumno, {
              id_alumno: e.id_alumno,
              nombre_alumno: e.nombre_alumno,
              archivos: [],
              entregado: false, // se actualizará abajo
              fecha_entrega: null,
              calificacion: null,
              id_entrega: e.id_entrega
            });
          }
    
          const alumno = mapa.get(e.id_alumno);
          alumno.archivos.push(e.archivo);
    
          if (!alumno.fecha_entrega || new Date(e.fecha_entrega) > new Date(alumno.fecha_entrega)) {
            alumno.fecha_entrega = e.fecha_entrega;
          }
    
          if (e.calificacion !== null && e.calificacion !== undefined) {
            alumno.calificacion = e.calificacion;
          }
    
          alumno.id_entrega = e.id_entrega;
        }
    
        const alumnosActualizados = Array.from(mapa.values());
    
        await Promise.all(alumnosActualizados.map(async (alumno) => {
          try {
            const r = await axios.get(`http://localhost:3001/api/entregas/entregado/${idTarea}/${alumno.id_alumno}`);
            alumno.entregado = Number(r.data.entregado) === 1;
            console.log(`✅ [${alumno.nombre_alumno}] entregado = ${alumno.entregado}`);
          } catch (err) {
            console.warn(`⚠️ No se pudo obtener entregado para ${alumno.nombre_alumno}`);
            alumno.entregado = false;
          }
        }));
    
        setEntregas(alumnosActualizados);
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
      setEntregas(prev =>
        prev.map(ent =>
          ent.id_entrega === entregaId ? { ...ent, calificacion: cal } : ent
        )
      );
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

  const puntajeMaximo = tarea?.puntaje_maximo || 100;

  return (
    <div className="tarea-detalle">
      <h2>📝 {tarea?.texto}</h2>
      <p><strong>Fecha de publicación:</strong> {new Date(tarea?.fecha).toLocaleString()}</p>
      {tarea?.fecha_entrega && (
        <p><strong>Fecha de entrega:</strong> {new Date(tarea.fecha_entrega).toLocaleDateString()}</p>
      )}

      {tarea?.archivos?.length > 0 && (
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
              <th>Archivos</th>
              <th>Fecha de entrega</th>
              <th>Estatus</th>
              <th>Calificación</th>
            </tr>
          </thead>
          <tbody>
            {entregas.map((entrega, index) => {
              const fechaEntrega = entrega.fecha_entrega ? new Date(entrega.fecha_entrega) : null;
              const fechaLimite = tarea?.fecha_entrega ? new Date(tarea.fecha_entrega) : null;

              let estatus = '';
              let estatusColor = '';

              if (!entrega.entregado) {
                estatus = 'Borrador';
                estatusColor = 'gray';
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
                <tr key={`${entrega.id_alumno}-${index}`}>
                  <td>{entrega.nombre_alumno}</td>
                  <td>
                    <button
                      onClick={() =>
                        setModalArchivos({
                          visible: true,
                          archivos: entrega.archivos || []
                        })
                      }
                    >
                      Ver archivos ({entrega.archivos.length})
                    </button>
                  </td>
                  <td>{fechaEntrega ? fechaEntrega.toLocaleString() : '—'}</td>
                  <td style={{ color: estatusColor, fontWeight: 'bold' }}>{estatus}</td>
                  <td>
                    {entrega.entregado ? (
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

      {modalArchivos.visible && (
        <div className="modal">
          <div className="modal-contenido">
            <h4>Archivos entregados</h4>
            <ul className="archivo-lista">
              {modalArchivos.archivos.map((archivo, idx) => (
                <li key={idx}>
                  <a href={`http://localhost:3001/storage/${archivo}`} target="_blank" rel="noreferrer">
                    {archivo}
                  </a>
                </li>
              ))}
            </ul>
            <button onClick={() => setModalArchivos({ visible: false, archivos: [] })}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TareaDetalleMaestro;
