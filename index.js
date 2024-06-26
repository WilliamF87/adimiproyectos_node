import express from "express";
import dotenv from "dotenv";
import conectarBD from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";
import cors from "cors";

const app = express();
app.use(express.json());

dotenv.config();

conectarBD();

// Configuración del CORS
const whiteList = [process.env.FRONTED_URL];

const corsOptions = {
    origin: function(origin, callback) {
        if(whiteList.includes(origin)) {
            // Puede consultar la API
            callback(null, true);
            // Le damos el acceso con el true
        } else {
            // No está permitido
            callback(new Error("Error de Cors"));
        }
    }
};

app.use(cors(corsOptions));

// Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

import { Server } from "socket.io";

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTED_URL,
    }
});

io.on("connection", (socket) => {

    // Definir los eventos de socket io
    socket.on("abrir proyecto", (proyecto) => {
        socket.join(proyecto);
    });
    
    socket.on("nueva tarea", tarea => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit("tarea agregada", tarea);
    });

    socket.on("eliminar tarea", tarea => {
        const proyecto = tarea.proyecto;
        socket.to(proyecto).emit("tarea eliminada", tarea);
    });

    socket.on("actualizar tarea", tarea => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit("tarea actualizada", tarea);
    });

    socket.on("cambiar estado", tarea => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit("nuevo estado", tarea);
    });
});

