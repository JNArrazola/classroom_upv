// EditarTemaModal.jsx
import React, { useState } from 'react';

const EditarTemaModal = ({ tema, onGuardar, onClose }) => {
  const [nombre, setNombre] = useState(tema.nombre);

  const handleGuardar = () => {
    if (nombre.trim()) onGuardar(tema.id, nombre);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar tema</h3>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre del tema"
        />
        <div className="modal-actions">
          <button onClick={handleGuardar}>💾 Guardar</button>
          <button onClick={onClose}>❌ Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default EditarTemaModal;
