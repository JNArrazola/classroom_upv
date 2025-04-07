// CrearTemaModal.jsx
import React, { useState } from 'react';

const CrearTemaModal = ({ onCrear, onClose }) => {
  const [nombre, setNombre] = useState('');

  const handleCrear = () => {
    if (nombre.trim()) onCrear(nombre);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Crear nuevo tema</h3>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre del tema"
        />
        <div className="modal-actions">
          <button onClick={handleCrear}>➕ Crear</button>
          <button onClick={onClose}>❌ Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default CrearTemaModal;
