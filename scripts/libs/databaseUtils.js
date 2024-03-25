// Importación de respuestas comunes
import { shell } from "./bedrockSystem";
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

// Función para verificar si una tabla existe
export const tableExists = (dbName, tableName, player) => {
    // Filtrar las etiquetas del jugador para encontrar las correspondientes a la tabla especificada
    const existingTables = player.getTags().filter((tag) => {
        const tagSplit = tag.split("-");
        return (
            tagSplit.length >= 2 &&
            tagSplit[0] === `db:${dbName}` &&
            tagSplit[1] === `tbl:${tableName}`
        );
    });

    return existingTables.length > 0; // Devolver verdadero si se encontraron etiquetas, falso de lo contrario
};

// Función para verificar si una base de datos existe
export const databaseExists = (dbName, player) => {
    // Filtrar las etiquetas del jugador para encontrar las correspondientes a la base de datos especificada
    const existingDatabase = player.getTags().filter((tag) => {
        const tagSplit = tag.split("-");
        return (
            tagSplit.length >= 2 &&
            tagSplit[0] === `db:${dbName}`
        );
    });

    return existingDatabase.length > 0; // Devolver verdadero si se encontraron etiquetas, falso de lo contrario
};


// Función para comparar dos objetos JSON
export const compareJSON = (json1, json2) => {
    const keys1 = Object.keys(json1);
    const keys2 = Object.keys(json2);

    let count = 0; // Contador de coincidencias

    // Iterar sobre las claves del primer JSON
    for (const key of keys1) {
        const value1 = json1[key];
        const value2 = json2[key];

        if (value1 === value2) {
            count++; // Incrementar el contador si los valores son iguales
        }
    }

    // Verificar si el contador es igual a la cantidad de propiedades en el segundo JSON
    return count === keys2.length; // Devolver true si son iguales, false de lo contrario
};

export const convertToBackup = (databaseData) => {
    const result = {
        database: "",
        tables: []
    };

    databaseData.forEach(item => {
        const [dbName, tableNameTag, tableData] = tagsSplits(item);
        const databaseName = dbName.split(':')[1];
        const tableName = tableNameTag.split(':')[1];

        const tableIndex = result.tables.findIndex(table => table.table === tableName);

        if (tableIndex === -1) {
            result.tables.push({
                table: tableName,
                properties: {},
                values: []
            });
        }

        const currentTable = result.tables[result.tables.length - 1];

        result.database = databaseName;

        if (tableData.includes('properties')) {
            const json = tableData.replace('properties:[', '').replace(']', '')
            const properties = JSON.parse(json);
            shell.log(properties);
            currentTable.properties = properties;
        } else if (tableData.includes('value')) {
            const json = tableData.replace('value:[', '').replace(']', '')
            const value = JSON.parse(json);
            currentTable.values.push(value);
        }
    });

    return result;
}

// Función para dividir tags teniendo en cuenta los JSON
export const tagsSplits = (tag) => {
    const { modifiedQuery, jsons } = extractJsons(tag); // Extraer JSON de la consulta y reemplazarlos con un marcador
    const split = modifiedQuery.split('-'); // Dividir la consulta modificada en partes por espacios

    // Restaurar los JSON reemplazados en la lista dividida
    const finalSplit = split.map((item) => (item.includes('###') ? item.replace('###', JSON.stringify(jsons)) : item));

    return finalSplit; // Devolver la lista dividida final
};