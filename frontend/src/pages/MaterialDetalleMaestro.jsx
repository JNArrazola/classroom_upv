import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './TareaDetalleMaestro.css';

const MaterialDetalleMaestro = () => {
  const { idMaterial } = useParams();
  const { usuario } = useAuth();
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/avisos/${idMaterial}`, {
          headers: { Authorization: `Bearer ${usuario.token}` }
        });
        setMaterial(res.data);
      } catch (err) {
        console.error('Error al cargar el material:', err);
      }
    };

    fetchMaterial();
  }, [idMaterial, usuario]);

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
            return (
              <div key={index} className="adjunto-card">
                {isImage ? (
                  <img src={`http://localhost:3001/storage/${archivo}`} alt={`Archivo ${index}`} className="imagen-miniatura" />
                ) : isPDF ? (
                  <iframe
                    src={`http://localhost:3001/storage/${archivo}#toolbar=0`}
                    className="pdf-miniatura"
                    title={`Archivo ${index}`}
                  ></iframe>
                ) : (
                  <p>Archivo {index + 1}</p>
                )}
                <a
                  href={`http://localhost:3001/storage/${archivo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver archivo
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MaterialDetalleMaestro;
