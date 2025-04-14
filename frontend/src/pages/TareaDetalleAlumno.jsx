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

  const subirArchivos = async (files) => {
    const formData = new FormData();
    formData.append('id_tarea', idTarea);
    formData.append('id_alumno', usuario.id);
    files.forEach((file) => formData.append('archivos', file));

    try {
      await axios.post('http://localhost:3001/api/entregas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const resEntregas = await axios.get(`http://localhost:3001/api/entregas/alumno/${usuario.id}/entregas`);
      const nuevas = resEntregas.data.filter(e => e.id_tarea === parseInt(idTarea));
      setEntregas(nuevas);
    } catch (err) {
      console.error('Error al subir archivos:', err);
      alert('No se pudo subir el archivo');
    }
  };

  const confirmarEntrega = async () => {
    try {
      await axios.put('http://localhost:3001/api/entregas/confirmar', {
        id_tarea: idTarea,
        id_alumno: usuario.id
      });
      const resEntregas = await axios.get(`http://localhost:3001/api/entregas/alumno/${usuario.id}/entregas`);
      const actualizadas = resEntregas.data.filter(e => e.id_tarea === parseInt(idTarea));
      setEntregas(actualizadas);
    } catch (err) {
      console.error('Error al confirmar entrega:', err);
      alert('No se pudo confirmar la entrega');
    }
  };

  const deshacerEntrega = async () => {
    if (!window.confirm('¿Estás seguro de que quieres deshacer tu entrega?')) return;

    try {
      await axios.put('http://localhost:3001/api/entregas/revertir', {
        id_tarea: idTarea,
        id_alumno: usuario.id
      });
      const resEntregas = await axios.get(`http://localhost:3001/api/entregas/alumno/${usuario.id}/entregas`);
      const revertidas = resEntregas.data.filter(e => e.id_tarea === parseInt(idTarea));
      setEntregas(revertidas);
    } catch (err) {
      console.error('Error al deshacer entrega:', err);
      alert('No se pudo deshacer la entrega');
    }
  };

  const eliminarArchivo = async (idEntrega) => {
    try {
      await axios.delete(`http://localhost:3001/api/entregas/${idEntrega}`);
      const resEntregas = await axios.get(`http://localhost:3001/api/entregas/alumno/${usuario.id}/entregas`);
      const actualizadas = resEntregas.data.filter(e => e.id_tarea === parseInt(idTarea));
      setEntregas(actualizadas);
    } catch (err) {
      console.error('Error al eliminar archivo:', err);
      alert('No se pudo eliminar el archivo');
    }
  };

  if (!tarea) return <p>Cargando tarea...</p>;

  const fechaEntrega = tarea.fecha_entrega ? new Date(tarea.fecha_entrega) : null;
  const entregadoTarde = entregas.length && fechaEntrega && new Date(entregas[0].fecha_entrega) > fechaEntrega;
  const calificacion = entregas.length ? entregas[0].calificacion : null;
  const fueEntregada = entregas.some(e => e.entregado);

  let estadoEntrega = 'Sin entregar';
  if (fueEntregada) estadoEntrega = 'Entregado con éxito';
  else if (entregas.length) estadoEntrega = 'Borrador guardado';

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
      <p><strong>Estado:</strong> {estadoEntrega}</p>
      {entregas.length > 0 && (
        <>
          <p><strong>Última modificación:</strong> {new Date(entregas[0].fecha_entrega).toLocaleString()} {entregadoTarde && <span style={{ color: 'orange' }}>(tarde)</span>}</p>
          <p><strong>Calificación:</strong> {calificacion ?? 'Pendiente'}</p>

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
                  {!entrega.entregado && (
                    <button className="btn-eliminar" onClick={() => eliminarArchivo(entrega.id)}>🗑️</button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="subida-tarea">
        <input
          type="file"
          multiple
          onChange={(e) => subirArchivos(Array.from(e.target.files))}
          accept=".pdf,image/*"
        />
        {!fueEntregada ? (
          <button onClick={confirmarEntrega} disabled={entregas.length === 0}>📤 Entregar tarea</button>
        ) : (
          <button onClick={deshacerEntrega}>❌ Deshacer entrega</button>
        )}
      </div>
    </div>
  );
};

export default TareaDetalleAlumno;
