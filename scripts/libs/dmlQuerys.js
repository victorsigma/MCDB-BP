import { Player } from '@minecraft/server';
import { INVALID_QUERY, INVALID_DB, NO_MATCH } from './commonResponses';
import { querySplits, tableExists, compareJSON } from './databaseUtils';

/**
 * Función para insertar valores en una tabla existente
 * @param {string} query 
 * @param {Player} player 
 */
export const insert = (query, player) => {
    //&insert dbName tableName value
    // Dividir la consulta en partes
    const querySplit = querySplits(query);
    if (querySplit.length > 3) {
        const dbName = querySplit[1];
        const tableName = querySplit[2];
        const rawValue = querySplit[3];
        const value = rawValue;

        // Verificar si la tabla especificada existe
        if (tableExists(dbName, tableName, player)) {
            // Obtener las propiedades de la tabla
            const tableProperties = getTableProperties(dbName, tableName, player);
            if (tableProperties) {
                // Validar el valor a insertar según las propiedades de la tabla
                if (validateValue(value, tableProperties)) {
                    // Insertar el valor en la tabla si es válido
                    const table = `db:${dbName}-tbl:${tableName}-value:${value}`;
                    if (player.hasTag(table)) return "§6Duplicate data"; // Devolver mensaje si los datos ya existen
                    player.addTag(table); // Agregar la etiqueta al jugador
                    return "§aValue inserted"; // Devolver mensaje de inserción exitosa
                } else {
                    return "§4Invalid value for table properties"; // Devolver mensaje si el valor no es válido
                }
            } else {
                return "§4Table properties not found"; // Devolver mensaje si no se encuentran las propiedades de la tabla
            }
        } else {
            return INVALID_DB; // Devolver mensaje si la base de datos no existe
        }
    } else {
        return INVALID_QUERY; // Devolver mensaje si la consulta no es válida
    }
}

// Función para obtener las propiedades de una tabla
const getTableProperties = (dbName, tableName, player) => {
    const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-properties:`));
    if (tableTags.length > 0) {
        const propertiesTag = tableTags[0];
        const propertiesStartIndex = propertiesTag.indexOf("-properties:") + 12;
        const propertiesJson = propertiesTag.substring(propertiesStartIndex);
        try {
            return JSON.parse(propertiesJson); // Devolver las propiedades de la tabla como objeto JSON
        } catch (error) {
            return null; // Devolver null si hay un error al parsear las propiedades JSON
        }
    }
    return null; // Devolver null si no se encuentran las etiquetas de propiedades de la tabla
}

// Función para validar el valor a insertar según las propiedades de la tabla
const validateValue = (value, tableProperties) => {
    try {
        const parsedValue = JSON.parse(value);
        for (const prop in parsedValue) {
            if (!(prop in tableProperties)) {
                return false; // Devuelve falso si alguna propiedad del valor no está presente en las propiedades de la tabla
            }
            const propType = tableProperties[prop];
            const valueType = typeof parsedValue[prop];
            if (valueType !== propType) {
                return false; // Devuelve falso si el tipo de valor no coincide con el tipo de propiedad en la tabla
            }
        }
        return true; // Devuelve verdadero si el valor es válido según las propiedades de la tabla
    } catch (error) {
        return false; // Devuelve falso si hay un error al parsear el valor JSON
    }
}

/**
 * Función para actualizar valores en una tabla existente
 * @param {string} query 
 * @param {Player} player 
 */
export const update = (query, player) => {
    // &update dbName tableName conditions newValues
    // Dividir la consulta en partes
    const querySplit = querySplits(query);
    if (querySplit.length > 4) {
        const dbName = querySplit[1];
        const tableName = querySplit[2];
        const conditions = JSON.parse(querySplit[3]); // Condiciones de actualización
        const newValues = JSON.parse(querySplit[4]); // Nuevos valores

        // Verificar si la tabla especificada existe
        if (tableExists(dbName, tableName, player)) {
            // Obtener las etiquetas de valores de la tabla
            const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-value:`));
            let updatedCount = 0;

            // Iterar sobre los valores de la tabla
            tableTags.forEach((tableTag) => {
                try {
                    const tableValue = tableTag.split("-value:")[1];
                    const json = JSON.parse(tableValue);
                    // Comparar si el valor actual cumple con las condiciones de actualización
                    if (compareJSON(json, conditions)) {
                        // Actualizar el valor según los nuevos valores proporcionados
                        const newJson = updateJSON(json, newValues);

                        if (newJson === INVALID_QUERY) {
                            return INVALID_QUERY;
                        }
                        // Reemplazar la etiqueta del valor actualizado en la tabla
                        player.removeTag(tableTag);
                        player.addTag(`db:${dbName}-tbl:${tableName}-value:${JSON.stringify(newJson)}`);
                        updatedCount++;
                    }
                } catch (error) {
                    return INVALID_QUERY;
                }
            });
            if (updatedCount > 0) {
                return `§a${updatedCount} value(s) updated`; // Devolver mensaje de actualización exitosa
            } else {
                return NO_MATCH; // Devolver mensaje si no se encontraron coincidencias para actualizar
            }
        } else {
            return INVALID_DB; // Devolver mensaje si la base de datos no existe
        }
    } else {
        return INVALID_QUERY; // Devolver mensaje si la consulta no es válida
    }
};


// Función para actualizar un objeto JSON con nuevos valores
const updateJSON = (json1, json2) => {
    const keys1 = Object.keys(json1);
    const keys2 = Object.keys(json2);

    // Verificar si el nuevo JSON tiene más propiedades
    if (keys2.length > keys1.length) {
        return "INVALID_QUERY"; // Devolver mensaje de consulta no válida si el nuevo JSON tiene más propiedades que el JSON original
    }

    // Actualizar las propiedades coincidentes del JSON original con el nuevo JSON
    for (const key of keys1) {
        if (key in json2) {
            json1[key] = json2[key];
        }
    }

    return json1; // Devolver el JSON actualizado
};

/**
 * Función para eliminar valores de una tabla
 * @param {string} query 
 * @param {Player} player 
 */
export const delet = (query, player) => {
    //&delete dbName tableName datos
    // Dividir la consulta en partes
    const querySplit = querySplits(query);
    if (querySplit.length > 3) {
        const dbName = querySplit[1];
        const tableName = querySplit[2];
        const rawValues = querySplit.slice(3);
        const values = rawValues.map((rawValue) => rawValue);

        // Verificar si la tabla especificada existe
        if (tableExists(dbName, tableName, player)) {
            let deletedCount = 0;
            // Obtener las etiquetas de valores de la tabla
            const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-value:`));
            values.forEach((value) => {
                tableTags.forEach((tableTag) => {
                    try {
                        const tableValue = tableTag.split("-value:")[1];
                        const json1 = JSON.parse(tableValue);
                        const json2 = JSON.parse(value)
                        // Comparar si los valores coinciden para eliminar
                        if (compareJSON(json1, json2)) {
                            player.removeTag(tableTag);
                            deletedCount++;
                        }
                    } catch (error) {
                        return INVALID_QUERY;
                    }
                });
            });

            // Devolver mensaje de cantidad de valores eliminados si se eliminaron algunos
            if (deletedCount > 0) {
                return `§a${deletedCount} value(s) deleted`;
            } else {
                return NO_MATCH; // Devolver mensaje si no se encontraron coincidencias para eliminar
            }
        } else {
            return INVALID_DB; // Devolver mensaje si la base de datos no existe
        }
    } else {
        return INVALID_QUERY; // Devolver mensaje si la consulta no es válida
    }
};