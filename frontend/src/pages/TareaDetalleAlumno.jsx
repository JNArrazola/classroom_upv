// src/pages/TareaDetalleAlumno.jsx
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
  const [entrega, setEntrega] = useState(null);
  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    const fetchTareaYEntrega = async () => {
      try {
        const resTarea = await axios.get(`http://localhost:3001/api/avisos/${idTarea}`);
        setTarea(resTarea.data);

        const resEntrega = await axios.get(`http://localhost:3001/api/entregas/alumno/${usuario.id}/entregas`);
        const entregaEncontrada = resEntrega.data.find(e => e.id_tarea === parseInt(idTarea));
        setEntrega(entregaEncontrada || null);
      } catch (err) {
        console.error('Error al cargar tarea o entrega:', err);
      }
    };

    fetchTareaYEntrega();
  }, [idTarea, usuario.id]);

  const entregar = async () => {
    if (!archivo) return alert('Debes seleccionar un archivo');
    const formData = new FormData();
    formData.append('id_tarea', idTarea);
    formData.append('id_alumno', usuario.id);
    formData.append('archivos', archivo);

    try {
      await axios.post('http://localhost:3001/api/entregas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Tarea entregada correctamente');
      setArchivo(null);
      const resEntrega = await axios.get(`http://localhost:3001/api/entregas/alumno/${usuario.id}/entregas`);
      const nuevaEntrega = resEntrega.data.find(e => e.id_tarea === parseInt(idTarea));
      setEntrega(nuevaEntrega);
    } catch (err) {
      console.error('Error al entregar tarea:', err);
      alert('No se pudo entregar la tarea');
    }
  };

  const deshacerEntrega = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu entrega?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/entregas/${entrega.id}`);
      setEntrega(null);
      alert('Entrega eliminada');
    } catch (err) {
      console.error('Error al eliminar entrega:', err);
      alert('No se pudo eliminar la entrega');
    }
  };

  if (!tarea) return <p>Cargando tarea...</p>;

  const fechaEntrega = tarea.fecha_entrega ? new Date(tarea.fecha_entrega) : null;
  const entregadoTarde = entrega?.fecha_entrega && fechaEntrega && new Date(entrega.fecha_entrega) > fechaEntrega;

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
      {entrega ? (
        <div>
          <p><strong>Entregado el:</strong> {new Date(entrega.fecha_entrega).toLocaleString()} {entregadoTarde && <span style={{ color: 'orange' }}>(tarde)</span>}</p>
          <p><strong>Calificación:</strong> {entrega.calificacion ?? 'Pendiente'}</p>
          <a href={`http://localhost:3001/storage/${entrega.archivo}`} target="_blank" rel="noreferrer">Ver tu archivo</a>
          <br />
          <button onClick={deshacerEntrega}>❌ Deshacer entrega</button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            onChange={(e) => setArchivo(e.target.files[0])}
            accept=".pdf,image/*"
          />
          <button onClick={entregar} disabled={!archivo}>📤 Entregar</button>
        </div>
      )}
    </div>
  );
};

export default TareaDetalleAlumno;
