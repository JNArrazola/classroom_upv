import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ClaseDetalleMaestro.css';

const ClaseDetalleMaestro = () => {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [clase, setClase] = useState(null);
  const [seccion, setSeccion] = useState('avisos');

  const [alumnos, setAlumnos] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);

  const [nuevoAviso, setNuevoAviso] = useState('');
  const [adjuntos, setAdjuntos] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [mostrarFormularioAviso, setMostrarFormularioAviso] = useState(false);
  const [menuAvisoActivo, setMenuAvisoActivo] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');

  useEffect(() => {
    const fetchClase = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/clases/maestro/${usuario.id}`, {
          headers: { Authorization: `Bearer ${usuario.token}` }
        });
        const claseEncontrada = res.data.find(c => c.id === parseInt(id));
        setClase(claseEncontrada);
      } catch (error) {
        console.error('Error al cargar la clase:', error);
      }
    };
    fetchClase();
  }, [id, usuario]);

  const cargarAlumnos = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/clases/${id}/alumnos`);
      setAlumnos(res.data);
    } catch (err) {
      console.error('Error al cargar alumnos:', err);
    }
  };

  const eliminarAlumno = async (idAlumno) => {
    if (!window.confirm('¿Seguro que quieres eliminar a este alumno de la clase?')) return;
  
    try {
      await axios.delete(`http://localhost:3001/api/clases/${id}/alumnos/${idAlumno}`, {
        headers: { Authorization: `Bearer ${usuario.token}` }
      });
      cargarAlumnos();
    } catch (err) {
      console.error('Error al eliminar alumno:', err);
      alert('No se pudo eliminar el alumno.');
    }
  };
  

  const handleBuscar = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:3001/api/usuarios/buscar?termino=${terminoBusqueda}`);
      setResultadosBusqueda(res.data);
    } catch (err) {
      console.error('Error al buscar alumnos:', err);
    }
  };

  const agregarAlumno = async (id_alumno) => {
    try {
      await axios.post(`http://localhost:3001/api/clases/${id}/alumnos`, { id_alumno }, {
        headers: { Authorization: `Bearer ${usuario.token}` }
      });
      cargarAlumnos();
      setResultadosBusqueda([]);
      setTerminoBusqueda('');
    } catch (err) {
      alert('Este alumno ya está registrado o hubo un error.');
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

  const publicarAviso = async (e) => {
    e.preventDefault();
    if (!nuevoAviso.trim()) return alert('El texto del aviso es obligatorio.');

    const formData = new FormData();
    formData.append('id_clase', id);
    formData.append('texto', nuevoAviso);
    for (let i = 0; i < adjuntos.length; i++) {
      formData.append('archivos', adjuntos[i]);
    }

    try {
      await axios.post('http://localhost:3001/api/avisos', formData, {
        headers: {
          Authorization: `Bearer ${usuario.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNuevoAviso('');
      setAdjuntos([]);
      setMostrarFormularioAviso(false);
      cargarAvisos();
    } catch (err) {
      console.error('Error al publicar aviso:', err);
    }
  };

  const eliminarAviso = async (idAviso) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este aviso?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/avisos/${idAviso}`, {
        headers: {
          Authorization: `Bearer ${usuario.token}`
        }
      });
      cargarAvisos();
    } catch (err) {
      console.error('Error al eliminar aviso:', err);
      alert('No se pudo eliminar el aviso.');
    }
  };

  const editarAviso = async (idAviso) => {
    try {
      await axios.put(`http://localhost:3001/api/avisos/${idAviso}`, {
        texto: textoEditado
      }, {
        headers: { Authorization: `Bearer ${usuario.token}` }
      });

      setEditandoId(null);
      setTextoEditado('');
      cargarAvisos();
    } catch (err) {
      console.error('Error al editar aviso:', err);
      alert('No se pudo actualizar el aviso.');
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
          <div className="boton-mas-contenedor">
            <button onClick={() => setMostrarFormularioAviso(prev => !prev)} className="boton-mas">＋</button>
            {mostrarFormularioAviso && (
              <div className="menu-mas">
                <button onClick={() => setMostrarFormularioAviso('aviso')}>📢 Publicar aviso</button>
              </div>
            )}
          </div>

          {mostrarFormularioAviso === 'aviso' && (
            <form onSubmit={publicarAviso} className="form-aviso">
              <textarea
                value={nuevoAviso}
                onChange={(e) => setNuevoAviso(e.target.value)}
                placeholder="Escribe un aviso para tus alumnos"
              ></textarea>
                <input
                  type="file"
                  multiple
                  onChange = {(e) => setAdjuntos(Array.from(e.target.files))}
                  accept=".pdf,image/*"
                />
              <button type="submit">Publicar aviso</button>
            </form>
          )}

          <ul className="avisos-lista">
            {avisos.map(aviso => (
              <li key={aviso.id} className="aviso-item">
                <div className="aviso-header">
                  <strong>{new Date(aviso.fecha).toLocaleString()}</strong>
                  <div className="menu-opciones">
                    <button onClick={() => setMenuAvisoActivo(aviso.id)}>⋮</button>
                    {menuAvisoActivo === aviso.id && (
                      <div className="menu-aviso">
                        <button onClick={() => {
                          setEditandoId(aviso.id);
                          setTextoEditado(aviso.texto);
                          setMenuAvisoActivo(null);
                        }}>✏️ Editar aviso</button>
                        <button onClick={() => eliminarAviso(aviso.id)}>🗑 Eliminar aviso</button>
                      </div>
                    )}
                  </div>
                </div>
                {editandoId === aviso.id ? (
                  <>
                    <textarea
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      rows={3}
                      style={{ width: '100%' }}
                    />
                    <button onClick={() => editarAviso(aviso.id)}>💾 Guardar</button>
                    <button onClick={() => setEditandoId(null)}>❌ Cancelar</button>
                  </>
                ) : (
                  <p>{aviso.texto}</p>
                )}
{aviso.archivos && aviso.archivos.length > 0 && (
  <div className="adjuntos-grid">
    {aviso.archivos.map((archivo, index) => {
      const isImage = archivo.match(/\.(jpg|jpeg|png|gif|png)$/i);
      const isPDF = archivo.match(/\.pdf$/i);
      return (
        <div key={index} className="adjunto-card">
          {isImage ? (
            <img
              src={`http://localhost:3001/storage/${archivo}`}
              alt={`Archivo ${index}`}
              className="imagen-miniatura"
            />
          ) : isPDF ? (
            <iframe
              src={`http://localhost:3001/storage/${archivo}#toolbar=0&navpanes=0&scrollbar=0&page=1`}
              type="application/pdf"
              className="pdf-miniatura"
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
              </li>
            ))}
          </ul>
        </div>
      )}

      {seccion === 'alumnos' && (
        <div>
          <h3>Buscar y agregar alumnos</h3>
          <form onSubmit={handleBuscar} className="form-busqueda">
            <input
              type="text"
              placeholder="Buscar por nombre o matrícula"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
            />
            <button type="submit">Buscar</button>
          </form>

          <ul>
            {resultadosBusqueda.map((alumno) => (
              <li key={alumno.id}>
                {alumno.nombre} ({alumno.matricula}) - {alumno.correo}
                <button onClick={() => agregarAlumno(alumno.id)}>Agregar</button>
              </li>
            ))}
          </ul>

          <h4>Alumnos registrados en la clase</h4>
          <ul>
          {alumnos.map((alumno) => (
              <li key={alumno.id}>
                {alumno.nombre} - {alumno.matricula} - {alumno.correo}
                <button onClick={() => eliminarAlumno(alumno.id)} style={{ marginLeft: '1rem' }}>
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClaseDetalleMaestro;
