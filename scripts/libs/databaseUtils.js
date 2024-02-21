// Importación de respuestas comunes
import { INVALID_DB, NO_MATCH } from "./commonResponses";

// Función para obtener las bases de datos existentes del jugador
export const getDatabases = (player) => {
    // Obtener todas las etiquetas del jugador que comienzan con 'db:'
    const databaseTags = player.getTags().filter((tag) => tag.startsWith("db:"));
    // Utilizar un conjunto para eliminar duplicados y obtener nombres de bases de datos únicos
    const databasesSet = new Set(databaseTags.map((tag) => tag.split("-tbl:")[0].substring(3)));
    const databases = [...databasesSet]; // Convertir el conjunto de bases de datos a una matriz
    return `§aDatabases: \n§d${databases.join("\n")}`; // Devolver una cadena formateada con nombres de bases de datos
};

// Función para obtener las tablas de una base de datos específica
export const getTables = (query, player) => {
    // Dividir la consulta en partes
    const querySplit = query.split(" ");
    const dbName = querySplit[1]; // Obtener el nombre de la base de datos de la consulta
    // Verificar si el jugador tiene la etiqueta de la base de datos especificada
    if (player.hasTag(`db:${dbName}`)) {
        // Filtrar las etiquetas del jugador para obtener las relacionadas con tablas de la base de datos especificada
        const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:`) && !tag.includes("-value:"));
        // Utilizar un conjunto para eliminar duplicados y obtener nombres de tablas únicos
        const tablesSet = new Set(tableTags.map((tag) => tag.split("-tbl:")[1]));
        const tables = [...tablesSet]; // Convertir el conjunto de tablas a una matriz
        // Verificar si se encontraron tablas y devolverlas formateadas si es así, de lo contrario, devolver un mensaje de no coincidencia
        if (tables.length > 0) {
            return `§aTables: \n§d${tables.join("\n")}`;
        } else {
            return NO_MATCH; // Mensaje de no coincidencia si no se encontraron tablas
        }
    } else {
        return INVALID_DB; // Mensaje de base de datos no válida si el jugador no tiene la etiqueta de la base de datos especificada
    }
};

// Función interna para extraer JSON de una consulta y reemplazarlos con un marcador
const extractJsons = (query) => {
    const jsonRegex = /({[^{}]+})/g; // Expresión regular para encontrar JSON
    const jsons = query.match(jsonRegex); // Encontrar todos los JSON en la consulta
    const modifiedQuery = query.replace(jsonRegex, '###'); // Reemplazar los JSON con un marcador ###

    return {
        modifiedQuery,
        jsons
    };
};

// Función para dividir una consulta teniendo en cuenta los JSON
export const querySplits = (query) => {
    const { modifiedQuery, jsons } = extractJsons(query); // Extraer JSON de la consulta y reemplazarlos con un marcador
    const split = modifiedQuery.split(' '); // Dividir la consulta modificada en partes por espacios

    // Restaurar los JSON reemplazados en la lista dividida
    const finalSplit = split.map((item) => (item === '###' ? jsons.shift() : item));

    return finalSplit; // Devolver la lista dividida final
};