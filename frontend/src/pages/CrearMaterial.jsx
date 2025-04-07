import { useState } from "react";
import axios from "axios";

const CrearMaterial = ({ idClase, temas, token, onMaterialCreado }) => {
  const [texto, setTexto] = useState("");
  const [archivos, setArchivos] = useState([]);
  const [temasSeleccionados, setTemasSeleccionados] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id_clase", idClase);
    formData.append("texto", texto);
    temasSeleccionados.forEach((t) => formData.append("temas[]", t));
    archivos.forEach((file) => formData.append("archivos", file));

    try {
      await axios.post("http://localhost:3001/api/avisos/material", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Material publicado correctamente");
      setTexto("");
      setArchivos([]);
      setTemasSeleccionados([]);
      onMaterialCreado(); // refrescar lista
    } catch (err) {
      console.error("Error al crear material:", err);
      alert("No se pudo crear el material");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>📚 Publicar material</h3>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe aquí el contenido del material..."
        required
      />
      <input
        type="file"
        multiple
        onChange={(e) => setArchivos(Array.from(e.target.files))}
      />
      <div>
        <label>Temas:</label>
        <select
          multiple
          value={temasSeleccionados}
          onChange={(e) =>
            setTemasSeleccionados(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
        >
          {temas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">Publicar material</button>
    </form>
  );
};

export default CrearMaterial;
