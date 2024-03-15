// Importación de módulos y dependencias necesarias
import { Player } from "@minecraft/server"
import { alter, create, drop } from "./ddlQuerys"; // Importación de funciones para consultas DDL
import { delet, insert, update } from "./dmlQuerys"; // Importación de funciones para consultas DML
import { DBL, DDL, DML, DQL, DUL } from "./commonResponses"; // Importación de respuestas comunes para cada tipo de consulta
import { select, join } from "./dqlQuerys"; // Importación de funciones para consultas DQL
import { getDatabases, getTables } from "./databaseUtils"; // Importación de utilidades para obtener información de la base de datos
import { showQuerys } from "./configQuerys"; // Importación de funciones para mostrar consultas
import { exportTable } from "./exportQuerys";

// Definición de objetos que contienen funciones para diferentes tipos de consultas

// Objeto que contiene funciones para consultas DML (Data Manipulation Language) como insertar, actualizar o eliminar datos
const dmlCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&insert": (query, player) => { return insert(query, player) },
    "&update": (query, player) => { return update(query, player) },
    "&delete": (query, player) => { return delet(query, player) }
}
Object.freeze(dmlCommandsQuerys); // Congelación del objeto para evitar modificaciones

// Objeto que contiene funciones para consultas DQL (Data Query Language) como seleccionar y unir datos
const dqlCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&select": (query, player) => { return select(query, player) },
    "&join": (query, player) => { return join(query, player) }
}
Object.freeze(dqlCommandsQuerys); // Congelación del objeto para evitar modificaciones

// Objeto que contiene funciones para consultas DDL (Data Definition Language) como crear, alterar o eliminar bases de datos y tablas
const ddlCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&create": (query, player) => { return create(query, player) },
    "&alter": (query, player) => { return alter(query, player) },
    "&drop": (query, player) => { return drop(query, player) }
}
Object.freeze(ddlCommandsQuerys); // Congelación del objeto para evitar modificaciones

// Objeto que contiene funciones para comandos de ayuda
const helpCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&dml": () => { return DML },
    "&dql": () => { return DQL },
    "&ddl": () => { return DDL },
    "&dul": () => { return DUL },
    "&dbl": () => { return DBL }
}
Object.freeze(helpCommandsQuerys); // Congelación del objeto para evitar modificaciones

// Objeto que contiene funciones para utilidades de consulta (obtener bases de datos y tablas)
const utilsCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&databases": (_query, player) => { return getDatabases(player) },
    "&tables": (query, player) => { return getTables(query, player) }
}
Object.freeze(helpCommandsQuerys); // Congelación del objeto para evitar modificaciones

// Objeto que contiene funciones para configurar consultas
const configCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&showquery": (query, player) => { return showQuerys(query, player) },
}

const exportCommandsQuerys = {
    /**
     * 
     * @param {*} query 
     * @param {Player} player 
     */
    "&csv": (query, player) => { return exportTable(query, player) },
    "&json": (query, player) => { return exportTable(query, player) },
    "&xml": (query, player) => { return exportTable(query, player) },
}

// Función que valida si una consulta comienza con el carácter '&' (indicador de consulta válida)
export const queryCommanValidation = (query) => {
    return query.startsWith('&')
}

// Función que determina el tipo de consulta y la ejecuta utilizando las funciones definidas anteriormente
export const determineQuery = (query, player) => {
    const dmlCommands = ["&insert", "&update", "&delete"];
    const dqlCommands = ["&select", "&join"];
    const ddlCommands = ["&create", "&alter", "&drop"];
    const helpCommands = ["&dml", "&dql", "&ddl", "&dul", "&dbl"];
    const utilsCommands = ['&databases', "&tables"]
    const configCommands = ['&showquery']
    const exportCommands = ['&csv', '&json', '&xml']

    const command = query.split(" ")[0]; // Obtener el primer comando en el texto de la consulta

    // Determinar el tipo de consulta y ejecutarla utilizando las funciones correspondientes
    if (dmlCommands.includes(command)) {
        return dmlCommandsQuerys[command](query, player);
    } else if (dqlCommands.includes(command)) {
        return dqlCommandsQuerys[command](query, player);
    } else if (ddlCommands.includes(command)) {
        return ddlCommandsQuerys[command](query, player);
    } else if (helpCommands.includes(command)) {
        return helpCommandsQuerys[command]();
    } else if (utilsCommands.includes(command)) {
        return utilsCommandsQuerys[command](query, player)
    } else if (configCommands.includes(command)) {
        return configCommandsQuerys[command](query, player)
    } else if (exportCommands.includes(command)) {
        return exportCommandsQuerys[command](query, player)
    } else {
        return "§2Unknown query"; // Mensaje de error para consultas desconocidas
    }
}