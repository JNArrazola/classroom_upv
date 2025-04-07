import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TareaDetalleMaestro.css'; // Reutilizamos los mismos estilos

const MaterialDetalleAlumno = () => {
  const { idClase, idMaterial } = useParams();
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/avisos/${idMaterial}`);
        setMaterial(res.data);
      } catch (err) {
        console.error('Error al cargar el material:', err);
      }
    };

    fetchMaterial();
  }, [idMaterial]);

  if (!material) return <p>Cargando material...</p>;

  return (
    <div className="tarea-detalle">
      <h2>📚 {material.texto}</h2>
      <p><strong>Fecha de publicación:</strong> {new Date(material.fecha).toLocaleString()}</p>

      {material.archivos?.length > 0 && (
        <div className="adjuntos-grid">
          {material.archivos.map((archivo, index) => {
            const isImage = archivo.match(/\.(jpg|jpeg|png|gif)$/i);
            const isPDF = archivo.match(/\.pdf$/i);
            const ruta = `http://localhost:3001/storage/${archivo}`;
            return (
              <div key={index} className="adjunto-card">
                {isImage ? (
                  <img src={ruta} alt={`Archivo ${index}`} className="imagen-miniatura" />
                ) : isPDF ? (
                  <iframe
                    src={`${ruta}#toolbar=0`}
                    title={`Archivo ${index}`}
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
    </div>
  );
};

export default MaterialDetalleAlumno;
