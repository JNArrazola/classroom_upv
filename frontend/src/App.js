import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MaestroClases from './pages/MaestroClases';
import CrearClase from './pages/CrearClase';
import ClaseDetalleMaestro from './pages/ClaseDetalleMaestro';
import ClaseDetalleAlumno from './pages/ClaseDetalleAlumno';
import AlumnoClases from './pages/AlumnoClases'; // 👈 nuevo import

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/maestro/clases" element={<MaestroClases />} />
      <Route path="/maestro/crear-clase" element={<CrearClase />} />
      <Route path="/maestro/clase/:id" element={<ClaseDetalleMaestro />} />
      <Route path="/alumno/clases" element={<AlumnoClases />} /> {/* 👈 reemplazado */}
      <Route path="/alumno/clase/:id" element={<ClaseDetalleAlumno />} />
    </Routes>
  );
};

export default App;
