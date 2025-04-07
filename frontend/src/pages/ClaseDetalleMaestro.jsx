import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './ClaseDetalleMaestro.css';

const ClaseDetalleMaestro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [valorMaximo, setValorMaximo] = useState('');
  const [clase, setClase] = useState(null);
  const [seccion, setSeccion] = useState('avisos');
  const [alumnos, setAlumnos] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [nuevoAviso, setNuevoAviso] = useState('');
  const [adjuntos, setAdjuntos] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [mostrarFormularioAviso, setMostrarFormularioAviso] = useState(false);
  const [tipoPublicacion, setTipoPublicacion] = useState('aviso');
  const [fechaEntrega, setFechaEntrega] = useState('');
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
    if (!nuevoAviso.trim()) return alert('El texto es obligatorio.');
    const formData = new FormData();
    formData.append('id_clase', id);
    formData.append('texto', nuevoAviso);
    formData.append('es_tarea', tipoPublicacion === 'tarea' ? '1' : '0');
    formData.append('es_material', tipoPublicacion === 'material' ? '1' : '0');

    if (tipoPublicacion === 'tarea') {
      formData.append('fecha_entrega', fechaEntrega);
      formData.append('valor_maximo', valorMaximo || 100);
    }

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
      setFechaEntrega('');
      setValorMaximo('');
      setTipoPublicacion('aviso');
      setMostrarFormularioAviso(false);
      cargarAvisos();
    } catch (err) {
      console.error('Error al publicar:', err);
    }
  };

  const eliminarAviso = async (idAviso) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/avisos/${idAviso}`, {
        headers: { Authorization: `Bearer ${usuario.token}` }
      });
      cargarAvisos();
    } catch (err) {
      alert('No se pudo eliminar la publicación.');
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
      alert('No se pudo actualizar.');
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
        <button onClick={() => setSeccion('avisos')}>📢 Avisos / Tareas</button>
        <button onClick={() => setSeccion('alumnos')}>👥 Alumnos</button>
      </div>

      {seccion === 'avisos' && (
        <div className="avisos-seccion">
          <div className="boton-mas-contenedor">
            <button onClick={() => setMostrarFormularioAviso(prev => !prev)} className="boton-mas">＋</button>
          </div>

          {mostrarFormularioAviso && (
            <form onSubmit={publicarAviso} className="form-aviso">
              <label>
                Tipo:
                <select value={tipoPublicacion} onChange={(e) => setTipoPublicacion(e.target.value)}>
                  <option value="aviso">📢 Aviso</option>
                  <option value="tarea">📝 Tarea</option>
                  <option value="material">📚 Material</option>
                </select>
              </label>
              {tipoPublicacion === 'tarea' && (
                <>
                  <label>
                    Fecha de entrega:
                    <input
                      type="date"
                      value={fechaEntrega}
                      onChange={(e) => setFechaEntrega(e.target.value)}
                    />
                  </label>
                  <label>
                    Valor máximo:
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={valorMaximo}
                      onChange={(e) => setValorMaximo(e.target.value)}
                      placeholder="Ej. 100"
                    />
                  </label>
                </>
              )}
              <textarea
                value={nuevoAviso}
                onChange={(e) => setNuevoAviso(e.target.value)}
                placeholder="Escribe el contenido"
              ></textarea>
              <input
                type="file"
                multiple
                onChange={(e) => setAdjuntos(Array.from(e.target.files))}
                accept=".pdf,image/*"
              />
              <button type="submit">Publicar</button>
            </form>
          )}

          <ul className="avisos-lista">
            {avisos.map(aviso => (
              <li key={aviso.id} className="aviso-item">
                <div
                  className="aviso-header"
                  style={{ cursor: aviso.es_tarea || aviso.es_material ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (aviso.es_tarea) {
                      navigate(`/maestro/clase/${id}/tarea/${aviso.id}`);
                    } else if (aviso.es_material) {
                      navigate(`/maestro/clase/${id}/material/${aviso.id}`);
                    }
                  }}
                >
                  <strong>{new Date(aviso.fecha).toLocaleString()}</strong>
                  <span style={{ marginLeft: '10px', fontStyle: 'italic' }}>
                    {aviso.es_tarea ? '📝 Tarea' : aviso.es_material ? '📚 Material' : '📢 Aviso'}
                  </span>
                  {aviso.es_tarea && aviso.fecha_entrega && (
                    <span style={{ marginLeft: '10px' }}>
                      📅 Entrega: {new Date(aviso.fecha_entrega).toLocaleDateString()}
                    </span>
                  )}
                  <div className="menu-opciones" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setMenuAvisoActivo(aviso.id)}>⋮</button>
                    {menuAvisoActivo === aviso.id && (
                      <div className="menu-aviso">
                        <button onClick={() => {
                          setEditandoId(aviso.id);
                          setTextoEditado(aviso.texto);
                          setMenuAvisoActivo(null);
                        }}>✏️ Editar</button>
                        <button onClick={() => eliminarAviso(aviso.id)}>🗑 Eliminar</button>
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
                      const isImage = archivo.match(/\.(jpg|jpeg|png|gif)$/i);
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
                              src={`http://localhost:3001/storage/${archivo}#toolbar=0`}
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