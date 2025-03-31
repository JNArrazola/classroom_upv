import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MaestroClases from './pages/MaestroClases';
import CrearClase from './pages/CrearClase';
import ClaseDetalleMaestro from './pages/ClaseDetalleMaestro';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/maestro/clases" element={<MaestroClases />} />
      <Route path="/maestro/crear-clase" element={<CrearClase />} />
      <Route path="/maestro/clase/:id" element={<ClaseDetalleMaestro />} />
      <Route path="/alumno/clases" element={<h1>Página de clases del alumno</h1>} />
    </Routes>
  );
};

export default App;
