import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CrearClase.css';

const CrearClase = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    codigo_grupo: '',
    cuatrimestre: '',
    id_carrera: ''
  });

  const [carreras, setCarreras] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCarreras = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/carreras');
        setCarreras(res.data);
      } catch (err) {
        setError('No se pudieron cargar las carreras');
      }
    };

    fetchCarreras();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.codigo_grupo || !form.cuatrimestre || !form.id_carrera) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3001/api/clases', {
        ...form,
        id_maestro: usuario.id
      }, {
        headers: {
          Authorization: `Bearer ${usuario.token}`
        }
      });

      navigate(`/maestro/clase/${res.data.id}`);
    } catch (err) {
      setError('Error al crear la clase');
    }
  };

  return (
    <div className="crear-clase-container">
      <h2>Crear nueva clase</h2>
      <form onSubmit={handleSubmit} className="crear-clase-form">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la clase"
          value={form.nombre}
          onChange={handleChange}
          required
        />
  
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        ></textarea>
  
        <input
          type="text"
          name="codigo_grupo"
          placeholder="Código del grupo"
          value={form.codigo_grupo}
          onChange={handleChange}
          required
        />
  
        <input
          type="number"
          name="cuatrimestre"
          placeholder="Cuatrimestre"
          value={form.cuatrimestre}
          onChange={handleChange}
          required
        />
  
        <select
          name="id_carrera"
          value={form.id_carrera}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona una carrera</option>
          {carreras.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
  
        <button type="submit">Crear clase</button>
      </form>
  
      {error && <p className="error-text">{error}</p>}
    </div>
  );  
};

export default CrearClase;
