import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./ClaseDetalleMaestro.css";

const ClaseDetalleAlumno = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [clase, setClase] = useState(null);
  const [seccion, setSeccion] = useState("avisos");
  const [alumnos, setAlumnos] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [archivosEntrega, setArchivosEntrega] = useState({});
  const [entregasHechas, setEntregasHechas] = useState({});
  const [temas, setTemas] = useState([]);

  useEffect(() => {
    const fetchClase = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/clases/${id}/detalle`
        );
        setClase(res.data);
      } catch (error) {
        console.error("Error al cargar la clase:", error);
      }
    };

    fetchClase();
  }, [id]);

  const cargarTemas = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/temas/${id}`);
      setTemas(res.data);
    } catch (error) {
      console.error("Error al cargar temas:", error);
    }
  };

  const cargarAlumnos = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/clases/${id}/alumnos`
      );
      setAlumnos(res.data);
    } catch (err) {
      console.error("Error al cargar alumnos:", err);
    }
  };

  const cargarAvisos = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/avisos/clase/${id}`
      );
      setAvisos(res.data);

      const entregasRes = await axios.get(
        `http://localhost:3001/api/entregas/alumno/${usuario.id}/entregas`,
        {
          headers: { Authorization: `Bearer ${usuario.token}` },
        }
      );

      const entregasMap = {};
      entregasRes.data.forEach((ent) => {
        entregasMap[ent.id_tarea] = ent;
      });

      setEntregasHechas(entregasMap);
    } catch (err) {
      console.error("Error al cargar avisos o entregas:", err);
    }
  };

  const entregarTarea = async (idTarea) => {
    const formData = new FormData();
    formData.append("id_tarea", idTarea);
    formData.append("id_alumno", usuario.id);

    archivosEntrega[idTarea]?.forEach((file) => {
      formData.append("archivos", file);
    });

    try {
      await axios.post("http://localhost:3001/api/entregas", formData, {
        headers: {
          Authorization: `Bearer ${usuario.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Tarea entregada con éxito");
      cargarAvisos();
    } catch (err) {
      console.error("Error al entregar tarea:", err);
      alert("Error al entregar tarea");
    }
  };

  useEffect(() => {
    if (seccion === "alumnos") cargarAlumnos();
    if (seccion === "avisos") cargarAvisos();
    if (seccion === "trabajo") cargarTemas();
  }, [seccion]);

  if (!clase) return <p>Cargando...</p>;

  return (
    <div className="clase-contenedor">
      <h2>
        {clase.nombre} ({clase.codigo_grupo})
      </h2>
      <p>
        <strong>Carrera:</strong> {clase.carrera}
      </p>
      <p>
        <strong>Cuatrimestre:</strong> {clase.cuatrimestre}
      </p>

      <div className="clase-tabs">
        <button onClick={() => setSeccion("avisos")}>📢 Avisos / Tareas</button>
        <button onClick={() => setSeccion("trabajo")}>
          📂 Trabajo en Clase
        </button>
        <button onClick={() => setSeccion("alumnos")}>👥 Alumnos</button>
      </div>

      {seccion === "avisos" && (
        <div className="avisos-seccion">
          <ul className="avisos-lista">
            {avisos.map((aviso) => {
              const entrega = entregasHechas[aviso.id];
              const fechaEntrega = aviso.fecha_entrega
                ? new Date(aviso.fecha_entrega)
                : null;
              const entregadoTarde =
                entrega?.fecha_entrega &&
                fechaEntrega &&
                new Date(entrega.fecha_entrega) > fechaEntrega;

              return (
                <li key={aviso.id} className="aviso-item">
                  <div
                    className="aviso-header"
                    style={{
                      cursor:
                        aviso.es_tarea || aviso.es_material
                          ? "pointer"
                          : "default",
                    }}
                    onClick={() => {
                      if (aviso.es_tarea) {
                        navigate(`/alumno/clase/${id}/tarea/${aviso.id}`);
                      } else if (aviso.es_material) {
                        navigate(`/alumno/clase/${id}/material/${aviso.id}`);
                      }
                    }}
                  >
                    <strong>{new Date(aviso.fecha).toLocaleString()}</strong>
                    <span style={{ marginLeft: "10px", fontStyle: "italic" }}>
                      {aviso.es_tarea
                        ? "📝 Tarea"
                        : aviso.es_material
                        ? "📚 Material"
                        : "📢 Aviso"}
                    </span>
                    {aviso.es_tarea && aviso.fecha_entrega && (
                      <span style={{ marginLeft: "10px" }}>
                        📅 Entrega:{" "}
                        {new Date(aviso.fecha_entrega).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <p>{aviso.texto}</p>

                  {aviso.archivos?.length > 0 && (
                    <div className="adjuntos-grid">
                      {aviso.archivos.map((archivo, index) => {
                        const isImage = archivo.match(/\.(jpg|jpeg|png|gif)$/i);
                        const isPDF = archivo.match(/\.pdf$/i);
                        const ruta = `http://localhost:3001/storage/${archivo}`;
                        return (
                          <div key={index} className="adjunto-card">
                            {isImage ? (
                              <img
                                src={ruta}
                                alt={`Archivo ${index}`}
                                className="imagen-miniatura"
                              />
                            ) : isPDF ? (
                              <iframe
                                src={`${ruta}#toolbar=0`}
                                title={`Archivo ${index}`}
                                className="pdf-miniatura"
                              ></iframe>
                            ) : (
                              <p>Archivo {index + 1}</p>
                            )}
                            <a
                              href={ruta}
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

                  {aviso.es_tarea && (
                    <div className="tarea-entrega">
                      {entrega ? (
                        <>
                          <p>
                            <strong>Ya entregaste</strong> el{" "}
                            {new Date(entrega.fecha_entrega).toLocaleString()}{" "}
                            {entregadoTarde && (
                              <span style={{ color: "orange" }}>(tarde)</span>
                            )}
                          </p>
                          <p>
                            <strong>Calificación:</strong>{" "}
                            {entrega.calificacion ?? "Pendiente"}
                          </p>
                          <a
                            href={`/alumno/clase/${id}/tarea/${aviso.id}`}
                            rel="noreferrer"
                          >
                            Ver tu entrega
                          </a>
                        </>
                      ) : (
                        <>
                          <input
                            type="file"
                            multiple
                            onChange={(e) =>
                              setArchivosEntrega({
                                ...archivosEntrega,
                                [aviso.id]: Array.from(e.target.files),
                              })
                            }
                            accept=".pdf,image/*"
                          />
                          <button onClick={() => entregarTarea(aviso.id)}>
                            Entregar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {seccion === "alumnos" && (
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
      {seccion === "trabajo" && (
        <div className="trabajo-en-clase">
          {temas.length === 0 ? (
            <p>No hay temas registrados todavía.</p>
          ) : (
            temas.map((tema) => (
              <div key={tema.id} className="tema-bloque">
                <h3>📁 {tema.nombre}</h3>
                <ul>
                  {tema.avisos?.map((aviso) => (
                    <li
                      key={aviso.id}
                      onClick={() => {
                        if (aviso.es_tarea) {
                          navigate(`/alumno/clase/${id}/tarea/${aviso.id}`);
                        } else if (aviso.es_material) {
                          navigate(`/alumno/clase/${id}/material/${aviso.id}`);
                        }
                      }}
                      style={{ cursor: "pointer", padding: "0.5rem" }}
                    >
                      <span>
                        {aviso.es_tarea
                          ? "📝"
                          : aviso.es_material
                          ? "📚"
                          : "📢"}{" "}
                        {aviso.texto}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ClaseDetalleAlumno;
