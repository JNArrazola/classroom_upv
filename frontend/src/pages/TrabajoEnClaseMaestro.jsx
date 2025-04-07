import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CrearTemaModal from '../modals/CrearTemaModal';
import EditarTemaModal from '../modals/EditarTemaModal';
import AgregarAvisosModal from '../modals/AgregarAvisosModal';
import './TrabajoEnClaseMaestro.css';

const TrabajoEnClaseMaestro = () => {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [temas, setTemas] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [temaEditando, setTemaEditando] = useState(null);
  const [temaAgregando, setTemaAgregando] = useState(null);
  const [avisos, setAvisos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchTemas();
    fetchAvisos();
  }, [id]);

  const fetchTemas = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/temas/${id}`);
      setTemas(res.data);
    } catch (err) {
      console.error('Error al cargar temas:', err);
    }
  };

  const fetchAvisos = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/avisos/clase/${id}`);
      setAvisos(res.data);
    } catch (err) {
      console.error('Error al cargar avisos:', err);
    }
  };

  const crearTema = async (nombre) => {
    try {
      await axios.post('http://localhost:3001/api/temas', {
        id_clase: id,
        nombre
      });
      fetchTemas();
      setModalCrear(false);
    } catch (err) {
      console.error('Error al crear tema:', err);
    }
  };

  const actualizarTema = async (idTema, nuevoNombre) => {
    try {
      await axios.put(`http://localhost:3001/api/temas/${idTema}`, {
        nombre: nuevoNombre
      });
      fetchTemas();
      setTemaEditando(null);
    } catch (err) {
      console.error('Error al editar tema:', err);
    }
  };

  const eliminarTema = async (idTema) => {
    if (!window.confirm('¿Deseas eliminar este tema?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/temas/${idTema}`);
      fetchTemas();
    } catch (err) {
      console.error('Error al eliminar tema:', err);
    }
  };

  const agregarAvisoATema = async (idAviso, idTema) => {
    try {
      await axios.post(`http://localhost:3001/api/temas/${idTema}/agregar-aviso`, { id_aviso: idAviso });
      fetchTemas();
    } catch (err) {
      console.error('Error al agregar aviso al tema:', err);
    }
  };

  const filtrarAvisos = () => {
    return avisos.filter(aviso =>
      aviso.texto.toLowerCase().includes(busqueda.toLowerCase()) &&
      !temas.some(t => t.avisos?.some(a => a.id === aviso.id))
    );
  };

  return (
    <div className="trabajo-clase">
      <h2>📂 Trabajo en Clase</h2>
      <button onClick={() => setModalCrear(true)}>➕ Crear nuevo tema</button>

      {temas.map((tema) => (
        <div key={tema.id} className="tema-bloque">
          <div className="tema-header">
            <h3>{tema.nombre}</h3>
            <div>
              <button onClick={() => setTemaEditando(tema)}>✏️</button>
              <button onClick={() => eliminarTema(tema.id)}>🗑️</button>
              <button onClick={() => setTemaAgregando(tema)}>➕ Agregar contenido</button>
            </div>
          </div>
          <ul className="avisos-en-tema">
            {tema.avisos?.map((a) => (
              <li key={a.id}>
                <span>{a.es_tarea ? '📝' : a.es_material ? '📚' : '📢'} {a.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {modalCrear && (
        <CrearTemaModal
          onCrear={crearTema}
          onClose={() => setModalCrear(false)}
        />
      )}

      {temaEditando && (
        <EditarTemaModal
          tema={temaEditando}
          onGuardar={(nuevoNombre) => actualizarTema(temaEditando.id, nuevoNombre)}
          onClose={() => setTemaEditando(null)}
        />
      )}

      {temaAgregando && (
        <AgregarAvisosModal
          avisos={filtrarAvisos()}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          onAgregar={(idAviso) => agregarAvisoATema(idAviso, temaAgregando.id)}
          onClose={() => setTemaAgregando(null)}
        />
      )}
    </div>
  );
};

export default TrabajoEnClaseMaestro;
