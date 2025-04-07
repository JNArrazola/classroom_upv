import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MaestroClases from './pages/MaestroClases';
import CrearClase from './pages/CrearClase';
import ClaseDetalleMaestro from './pages/ClaseDetalleMaestro';
import ClaseDetalleAlumno from './pages/ClaseDetalleAlumno';
import AlumnoClases from './pages/AlumnoClases'; 
import TareaDetalleMaestro from './pages/TareaDetalleMaestro';
import TareaDetalleAlumno from './pages/TareaDetalleAlumno';
import MaterialDetalleMaestro from './pages/MaterialDetalleMaestro';
import MaterialDetalleAlumno from './pages/MaterialDetalleAlumno';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/maestro/clases" element={<MaestroClases />} />
      <Route path="/maestro/crear-clase" element={<CrearClase />} />
      <Route path="/maestro/clase/:id" element={<ClaseDetalleMaestro />} />
      <Route path="/alumno/clases" element={<AlumnoClases />} /> {}
      <Route path="/alumno/clase/:id" element={<ClaseDetalleAlumno />} />
      <Route path="/maestro/clase/:idClase/tarea/:idTarea" element={<TareaDetalleMaestro />} />
      <Route path="/alumno/clase/:idClase/tarea/:idTarea" element={<TareaDetalleAlumno />} />
      <Route path="/maestro/clase/:id/material/:idMaterial" element={<MaterialDetalleMaestro />} />
      <Route path="/alumno/clase/:idClase/material/:idMaterial" element={<MaterialDetalleAlumno />} />
      </Routes>
  );
};

export default App;
