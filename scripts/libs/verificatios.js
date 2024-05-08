// Importación de módulos y dependencias necesarias
import { Player } from "@minecraft/server"
import { alter, create, drop } from "./ddlQuerys"; // Importación de funciones para consultas DDL
import { delet, insert, update } from "./dmlQuerys"; // Importación de funciones para consultas DML
import { DBL, DDL, DML, DQL, DUL } from "./commonResponses"; // Importación de respuestas comunes para cada tipo de consulta
import { select, join } from "./dqlQuerys"; // Importación de funciones para consultas DQL
import { getDatabases, getTables } from "./databaseUtils"; // Importación de utilidades para obtener información de la base de datos
import { enableSecurity, showQuerys } from "./configQuerys"; // Importación de funciones para mostrar consultas
import { backupDatabase, exportTable, importTableValues } from "./dblQuerys";
import { login } from "./securityQuerys";

// Definición de objetos que contienen funciones para diferentes tipos de consultas

// Objeto que contiene funciones para consultas DML (Data Manipulation Language) como insertar, actualizar o eliminar datos
const dmlCommandsQuerys = {
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&insert": (query, player) => { return insert(query, player) },
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&update": (query, player) => { return update(query, player) },
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&delete": (query, player) => { return delet(query, player) }
}
Object.freeze(dmlCommandsQuerys); // Congelación del objeto para evitar modificaciones

// Objeto que contiene funciones para consultas DQL (Data Query Language) como seleccionar y unir datos
const dqlCommandsQuerys = {
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&select": (query, player) => { return select(query, player) },
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&join": (query, player) => { return join(query, player) }
}
Object.freeze(dqlCommandsQuerys); // Congelación del objeto para evitar modificaciones

// Objeto que contiene funciones para consultas DDL (Data Definition Language) como crear, alterar o eliminar bases de datos y tablas
const ddlCommandsQuerys = {
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&create": (query, player) => { return create(query, player) },
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&alter": (query, player) => { return alter(query, player) },
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&drop": (query, player) => { return drop(query, player) }
}
Object.freeze(ddlCommandsQuerys); // Congelación del objeto para evitar modificaciones

// Objeto que contiene funciones para comandos de ayuda
const helpCommandsQuerys = {
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
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&tables": (query, player) => { return getTables(query, player) }
}
Object.freeze(helpCommandsQuerys); // Congelación del objeto para evitar modificaciones

// Objeto que contiene funciones para configurar consultas
const configCommandsQuerys = {
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&showquery": (query, player) => { return showQuerys(query, player) },
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&enablesecurity": (query, player) => { return enableSecurity(query, player) },
}

const dblCommandsQuerys = {
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&csv": (query, player) => { return exportTable(query, player) },
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&json": (query, player) => { return exportTable(query, player) },
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&xml": (query, player) => { return exportTable(query, player) },
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&import": async (query, player) => { return importTableValues(query, player) },
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&backup": async (query, player) => { return backupDatabase(query, player) }
}

const securityCommandsQuerys = {
    /**
     * @param {string} query 
     * @param {Player} player 
     */
    "&login": (query, player) => { return login(query, player) }
}




// Función que valida si una consulta comienza con el carácter '&' (indicador de consulta válida)
export const queryCommanValidation = (query) => {
    return query.startsWith('&')
}

/**
 * Función que determina el tipo de consulta y la ejecuta utilizando las funciones definidas anteriormente
 * @param {string} query 
 * @param {Player} player 
 * @returns 
 */
export const determineQuery = (query, player) => {
    const dmlCommands = ["&insert", "&update", "&delete"];
    const dqlCommands = ["&select", "&join"];
    const ddlCommands = ["&create", "&alter", "&drop"];
    const helpCommands = ["&dml", "&dql", "&ddl", "&dul", "&dbl"];
    const utilsCommands = ['&databases', "&tables"]
    const configCommands = ['&showquery', '&enablesecurity']
    const dblCommands = ['&csv', '&json', '&xml', '&import', '&backup']
    const securityCommands = ["&login"];

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
        return utilsCommandsQuerys[command](query, player);
    } else if (configCommands.includes(command)) {
        return configCommandsQuerys[command](query, player);
    } else if (dblCommands.includes(command)) {
        return dblCommandsQuerys[command](query, player);
    } else if (securityCommands.includes(command)) {
        return "§2You are already logged in";
    } else {
        return "§2Unknown query"; // Mensaje de error para consultas desconocidas
    }
}

/**
 * Función que determina el tipo de consulta y la ejecuta utilizando las funciones definidas anteriormente
 * @param {string} query 
 * @param {Player} player 
 * @returns 
 */
export const loginQuery = (query, player) => {
    const securityCommands = ["&login"];

    const command = query.split(" ")[0]; // Obtener el primer comando en el texto de la consulta

    // Determinar el tipo de consulta y ejecutarla utilizando las funciones correspondientes
    if (securityCommands.includes(command)) {
        return securityCommandsQuerys[command](query, player);
    } else {
        return "§2Unknown query"; // Mensaje de error para consultas desconocidas
    }
}