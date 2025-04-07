-- Crear base de datos

CREATE DATABASE IF NOT EXISTS classroom;
USE classroom;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('alumno', 'maestro') NOT NULL,
    matricula VARCHAR(20), -- sólo si es alumno
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Catálogo de carreras
CREATE TABLE carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla de clases
CREATE TABLE clases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    codigo_grupo VARCHAR(50) NOT NULL,
    cuatrimestre INT NOT NULL,
    id_carrera INT,
    id_maestro INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_carrera) REFERENCES carreras(id),
    FOREIGN KEY (id_maestro) REFERENCES usuarios(id)
);

-- Relación clase-alumnos
CREATE TABLE clase_alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_clase INT,
    id_alumno INT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_clase) REFERENCES clases(id) ON DELETE CASCADE,
    FOREIGN KEY (id_alumno) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de avisos
CREATE TABLE avisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_clase INT,
    id_maestro INT,
    contenido TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_clase) REFERENCES clases(id) ON DELETE CASCADE,
    FOREIGN KEY (id_maestro) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Archivos anexos a los avisos
CREATE TABLE archivos_avisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_aviso INT,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    tipo_archivo ENUM('imagen', 'pdf') NOT NULL,
    FOREIGN KEY (id_aviso) REFERENCES avisos(id) ON DELETE CASCADE
);

INSERT INTO carreras (nombre) VALUES ("ITI"), ("IM"), ("IM"), ("LAYGE"), ("ISA")

--- SEGUNDA ENTREGA
ALTER TABLE avisos ADD COLUMN es_tarea BOOLEAN DEFAULT FALSE;
ALTER TABLE avisos ADD COLUMN fecha_entrega DATE;
