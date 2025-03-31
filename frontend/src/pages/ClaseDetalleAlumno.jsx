import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ClaseDetalleMaestro.css';

const ClaseDetalleAlumno = () => {
  const { id } = useParams();
  const [clase, setClase] = useState(null);
  const [seccion, setSeccion] = useState('avisos');
  const [alumnos, setAlumnos] = useState([]);
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const fetchClase = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/clases/${id}/detalle`);
        setClase(res.data);
      } catch (error) {
        console.error('Error al cargar la clase:', error);
      }
    };

    fetchClase();
  }, [id]);

  const cargarAlumnos = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/clases/${id}/alumnos`);
      setAlumnos(res.data);
    } catch (err) {
      console.error('Error al cargar alumnos:', err);
    }
  };

  const cargarAvisos = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/avisos/clase/${id}`);
      setAvisos(res.data);
    } catch (err) {
      console.error('Error al cargar avisos:', err);
    }
  };

  useEffect(() => {
    if (seccion === 'alumnos') cargarAlumnos();
    if (seccion === 'avisos') cargarAvisos();
  }, [seccion]);

  if (!clase) return <p>Cargando...</p>;

  return (
    <div className="clase-contenedor">
      <h2>{clase.nombre} ({clase.codigo_grupo})</h2>
      <p><strong>Carrera:</strong> {clase.carrera}</p>
      <p><strong>Cuatrimestre:</strong> {clase.cuatrimestre}</p>

      <div className="clase-tabs">
        <button onClick={() => setSeccion('avisos')}>📢 Avisos</button>
        <button onClick={() => setSeccion('alumnos')}>👥 Alumnos</button>
      </div>

      {seccion === 'avisos' && (
        <div className="avisos-seccion">
          <ul className="avisos-lista">
            {avisos.map((aviso) => (
              <li key={aviso.id} className="aviso-item">
                <div className="aviso-header">
                  <strong>{new Date(aviso.fecha).toLocaleString()}</strong>
                </div>
                <p>{aviso.texto}</p>
                {aviso.archivos && aviso.archivos.length > 0 && (
                  <div className="adjuntos-grid">
                    {aviso.archivos.map((archivo, index) => {
                      const isImage = archivo.match(/\.(jpg|jpeg|png|gif)$/i);
                      const isPDF = archivo.match(/\.pdf$/i);
                      const ruta = `http://localhost:3001/storage/${archivo}`;
                      return (
                        <div key={index} className="adjunto-card">
                          {isImage ? (
                            <img src={ruta} alt={`Archivo ${index}`} className="imagen-miniatura" />
                          ) : isPDF ? (
                            <iframe
                              src={`${ruta}#toolbar=0&navpanes=0&scrollbar=0&page=1`}
                              type="application/pdf"
                              className="pdf-miniatura"
                            ></iframe>
                          ) : (
                            <p>Archivo {index + 1}</p>
                          )}
                          <a href={ruta} target="_blank" rel="noopener noreferrer">Ver archivo</a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {seccion === 'alumnos' && (
        <div>
          <h4>Alumnos registrados en la clase</h4>
          <ul>
            {alumnos.map((alumno) => (
              <li key={alumno.id}>
                {alumno.nombre} - {alumno.matricula} - {alumno.correo}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClaseDetalleAlumno;
