let avisos = [];
let contador = 1;

exports.getAvisosPorClase = (req, res) => {
  const id_clase = parseInt(req.params.id);
  const avisosFiltrados = avisos.filter(a => a.id_clase === id_clase);
  res.json(avisosFiltrados.reverse());
};

exports.crearAviso = (req, res) => {
  const { id_clase, texto } = req.body;
  const archivos = req.files ? req.files.map(file => file.filename) : [];

  const nuevoAviso = {
    id: contador++,
    id_clase: parseInt(id_clase),
    texto,
    fecha: new Date(),
    archivos
  };

  avisos.push(nuevoAviso);
  res.status(201).json({ mensaje: 'Aviso publicado', aviso: nuevoAviso });
};

exports.eliminarAviso = (req, res) => {
    const idAviso = parseInt(req.params.id);
    const index = avisos.findIndex(a => a.id === idAviso);
  
    if (index === -1) return res.status(404).json({ mensaje: 'Aviso no encontrado' });
  
    avisos.splice(index, 1);
    res.json({ mensaje: 'Aviso eliminado correctamente' });
  };

exports.editarAviso = (req, res) => {
  const idAviso = parseInt(req.params.id);
  const aviso = avisos.find(a => a.id === idAviso);

  if (!aviso) {
    return res.status(404).json({ mensaje: 'Aviso no encontrado' });
  }

  aviso.texto = req.body.texto;
  res.json({ mensaje: 'Aviso actualizado', aviso });
};
