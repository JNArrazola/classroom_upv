import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './TareaDetalleAlumno.css';

const TareaDetalleAlumno = () => {
  const { idClase, idTarea } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [tarea, setTarea] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [archivosSeleccionados, setArchivosSeleccionados] = useState([]);

  useEffect(() => {
    const fetchTareaYEntregas = async () => {
      try {
        const resTarea = await axios.get(`http://localhost:3001/api/avisos/${idTarea}`);
        setTarea(resTarea.data);

        const resEntregas = await axios.get(`http://localhost:3001/api/entregas/alumno/${usuario.id}/entregas`);
        const entregasFiltradas = resEntregas.data.filter(e => e.id_tarea === parseInt(idTarea));
        setEntregas(entregasFiltradas);
      } catch (err) {
        console.error('Error al cargar tarea o entregas:', err);
      }
    };

    fetchTareaYEntregas();
  }, [idTarea, usuario.id]);

  const entregar = async () => {
    if (!archivosSeleccionados.length) return alert('Debes seleccionar al menos un archivo');

    const formData = new FormData();
    formData.append('id_tarea', idTarea);
    formData.append('id_alumno', usuario.id);
    archivosSeleccionados.forEach((file) => formData.append('archivos', file));

    try {
      await axios.post('http://localhost:3001/api/entregas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Tarea entregada correctamente');
      setArchivosSeleccionados([]);
      const resEntregas = await axios.get(`http://localhost:3001/api/entregas/alumno/${usuario.id}/entregas`);
      const nuevas = resEntregas.data.filter(e => e.id_tarea === parseInt(idTarea));
      setEntregas(nuevas);
    } catch (err) {
      console.error('Error al entregar tarea:', err);
      alert('No se pudo entregar la tarea');
    }
  };

  const deshacerEntrega = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu entrega?')) return;

    try {
      for (const entrega of entregas) {
        await axios.delete(`http://localhost:3001/api/entregas/${entrega.id}`);
      }
      setEntregas([]);
      alert('Entrega eliminada');
    } catch (err) {
      console.error('Error al eliminar entrega:', err);
      alert('No se pudo eliminar la entrega');
    }
  };

  if (!tarea) return <p>Cargando tarea...</p>;

  const fechaEntrega = tarea.fecha_entrega ? new Date(tarea.fecha_entrega) : null;
  const entregadoTarde =
    entregas.length &&
    fechaEntrega &&
    new Date(entregas[0].fecha_entrega) > fechaEntrega;

  return (
    <div className="detalle-tarea-alumno">
      <button onClick={() => navigate(-1)}>← Volver</button>
      <h2>📝 {tarea.texto}</h2>

      {fechaEntrega && (
        <p><strong>Fecha de entrega:</strong> {fechaEntrega.toLocaleDateString()}</p>
      )}

      {tarea.archivos?.length > 0 && (
        <div className="adjuntos-grid">
          {tarea.archivos.map((archivo, i) => {
            const url = `http://localhost:3001/storage/${archivo}`;
            const isImage = archivo.match(/\.(jpg|jpeg|png|gif)$/i);
            const isPDF = archivo.match(/\.pdf$/i);
            return (
              <div key={i} className="adjunto-card">
                {isImage ? (
                  <img src={url} className="imagen-miniatura" alt={`Archivo ${i}`} />
                ) : isPDF ? (
                  <iframe src={`${url}#toolbar=0`} className="pdf-miniatura" title={`Archivo ${i}`}></iframe>
                ) : (
                  <p>Archivo {i + 1}</p>
                )}
                <a href={url} target="_blank" rel="noopener noreferrer">Ver archivo</a>
              </div>
            );
          })}
        </div>
      )}

      <hr />

      <h4>Tu trabajo</h4>

      {entregas.length > 0 ? (
        <>
          <p><strong>Entregado el:</strong> {new Date(entregas[0].fecha_entrega).toLocaleString()} {entregadoTarde && <span style={{ color: 'orange' }}>(tarde)</span>}</p>
          <p><strong>Calificación:</strong> {entregas[0].calificacion ?? 'Pendiente'}</p>

          <div className="adjuntos-grid">
            {entregas.map((entrega, i) => {
              const url = `http://localhost:3001/storage/${entrega.archivo}`;
              const isImage = entrega.archivo.match(/\.(jpg|jpeg|png|gif)$/i);
              const isPDF = entrega.archivo.match(/\.pdf$/i);
              return (
                <div key={i} className="adjunto-card">
                  {isImage ? (
                    <img src={url} className="imagen-miniatura" alt={`Entrega ${i}`} />
                  ) : isPDF ? (
                    <iframe src={`${url}#toolbar=0`} className="pdf-miniatura" title={`Entrega ${i}`}></iframe>
                  ) : (
                    <p>Archivo {i + 1}</p>
                  )}
                  <a href={url} target="_blank" rel="noreferrer">Ver archivo</a>
                </div>
              );
            })}
          </div>

          <br />
          <button onClick={deshacerEntrega}>❌ Deshacer entrega</button>
        </>
      ) : (
        <div>
          <input
            type="file"
            multiple
            onChange={(e) => setArchivosSeleccionados(Array.from(e.target.files))}
            accept=".pdf,image/*"
          />
          <button onClick={entregar} disabled={archivosSeleccionados.length === 0}>📤 Entregar</button>
        </div>
      )}
    </div>
  );
};

export default TareaDetalleAlumno;
