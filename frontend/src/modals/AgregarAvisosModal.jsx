// AgregarAvisosModal.jsx
import React from 'react';

const AgregarAvisosModal = ({ avisos, busqueda, setBusqueda, onAgregar, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Agregar tareas o materiales</h3>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar aviso..."
        />
        <ul className="resultados-agregar">
          {avisos.map(aviso => (
            <li key={aviso.id}>
              <span>{aviso.es_tarea ? '📝' : aviso.es_material ? '📚' : '📢'} {aviso.texto}</span>
              <button onClick={() => onAgregar(aviso.id)}>Agregar</button>
            </li>
          ))}
        </ul>
        <div className="modal-actions">
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default AgregarAvisosModal;
