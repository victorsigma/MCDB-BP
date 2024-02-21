// Importación de respuestas comunes y función utilitaria
import { INVALID_QUERY, INVALID_DB, DB, TABLE } from './commonResponses'
import { querySplits } from './databaseUtils';

// Función para crear bases de datos y tablas
export const create = (query, player) => {
    // Dividir la consulta en partes
    const querySplit = querySplits(query);

    // Comprobar si la consulta es para crear una base de datos
    if (querySplit[1] === DB) {
        if (querySplit.length === 3) {
            const dbName = querySplit[2];
            // Comprobar si el jugador ya tiene la etiqueta de la base de datos
            if (player.hasTag(`db:${dbName}`)) {
                return "§4Existing database"; // Devolver mensaje si la base de datos ya existe
            } else {
                // Agregar la etiqueta al jugador para crear la base de datos
                player.addTag(`db:${dbName}`);
                return "§aDatabase created"; // Devolver mensaje de base de datos creada
            }
        } else {
            return INVALID_QUERY; // Devolver mensaje de consulta no válida si la longitud de la consulta no es válida
        }
    }
    // Comprobar si la consulta es para crear una tabla
    else if (querySplit[1] === TABLE) {
        if (querySplit.length >= 3) {
            const dbName = querySplit[2];
            const tableName = querySplit[3];
            const properties = querySplit[4] ? querySplit[4] : "";
            // Comprobar si el jugador ya tiene la etiqueta de la base de datos
            if (player.hasTag(`db:${dbName}`)) {
                return createTable(dbName, tableName, properties, player); // Llamar a la función para crear la tabla
            } else {
                return INVALID_DB; // Devolver mensaje de base de datos no válida si no existe la base de datos especificada
            }
        } else {
            return INVALID_QUERY; // Devolver mensaje de consulta no válida si la longitud de la consulta no es válida
        }
    } else {
        return INVALID_QUERY; // Devolver mensaje de consulta no válida si la consulta no coincide con 'DB' ni 'TABLE'
    }
};


// Función para crear una tabla
const createTable = (dbName, tableName, properties, player) => {
    // Comprobar si la tabla ya existe
    if (tableExists(dbName, tableName, player)) {
        return "§cTable already exists"; // Devolver mensaje si la tabla ya existe
    }

    // Validación de propiedades
    if (!isValidProperties(properties)) {
        return "§4Invalid properties"; // Devolver mensaje si las propiedades no son válidas
    }

    // Agregar etiqueta al jugador para crear la tabla
    if (properties === "") {
        const table = `db:${dbName}-tbl:${tableName}`
        player.addTag(table);
    } else {
        const table = `db:${dbName}-tbl:${tableName}-properties:${properties}`
        player.addTag(table);
    }

    return "§aTable created"; // Devolver mensaje de tabla creada
};

// Función para alterar una tabla existente
const alterTable = (dbName, tableName, properties, player, tbl) => {
    // Validación de propiedades
    if (!isValidProperties(properties)) {
        return "§4Invalid properties"; // Devolver mensaje si las propiedades no son válidas
    }

    // Eliminar la etiqueta de la tabla existente
    player.removeTag(tbl[0]);
    // Agregar la etiqueta actualizada para la tabla
    if (properties === "") {
        const table = `db:${dbName}-tbl:${tableName}`
        player.addTag(table);
    } else {
        const table = `db:${dbName}-tbl:${tableName}-properties:${properties}`
        player.addTag(table);
    }

    return "§aTable altered"; // Devolver mensaje de tabla alterada
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

// Función para validar propiedades de una tabla
const isValidProperties = (properties) => {
    if (properties === "") {
        // La tabla no tiene propiedades, es válido
        return true;
    }
    try {
        const parsedProperties = JSON.parse(properties);

        if (typeof parsedProperties === "object" && parsedProperties !== null) {
            // Verificar cada propiedad
            for (const prop in parsedProperties) {
                const propType = parsedProperties[prop];

                // Validar los tipos de propiedad permitidos
                if (
                    propType !== "string" &&
                    propType !== "number" &&
                    propType !== "boolean"
                ) {
                    return false; // Devolver falso si se encuentra un tipo de propiedad no válido
                }
            }

            return true; // Devolver verdadero si todas las propiedades son válidas
        } else {
            return false; // Devolver falso si las propiedades no son un objeto JSON válido
        }
    } catch (error) {
        return false; // Devolver falso si hay un error al analizar las propiedades como JSON
    }
};


// Función para alterar tablas existentes
export const alter = (query, player) => {
    // Dividir la consulta en partes
    const querySplit = querySplits(query);
    if (querySplit.length >= 3) {
        const dbName = querySplit[1];
        const tableName = querySplit[2];
        const properties = querySplit[3] ? querySplit[3] : "";
        // Verificar si el jugador tiene la etiqueta de la base de datos especificada
        if (player.hasTag(`db:${dbName}`)) {
            // Filtrar las etiquetas del jugador para encontrar la tabla especificada
            const tbl = player.getTags().filter((tag) => {
                const tagSplit = tag.split("-");
                return (
                    tagSplit.length >= 2 &&
                    tagSplit[0] === `db:${dbName}` &&
                    tagSplit[1] === `tbl:${tableName}`
                );
            });
            // Extraer el nombre de la tabla de las etiquetas encontradas
            const table = tbl.length ? tbl[0].split("-")[1] : "";
            if (table.startsWith(`tbl:${tableName}`)) {
                if (tbl.length === 1) {
                    return alterTable(dbName, tableName, properties, player, tbl); // Llamar a la función para alterar la tabla
                } else if (tbl.length < 1) {
                    return "§cThe table does not exist"; // Devolver mensaje si la tabla no existe
                } else {
                    return "§6The table already has data"; // Devolver mensaje si la tabla ya tiene datos
                }
            } else {
                return "§cThe table does not exist"; // Devolver mensaje si la tabla no existe
            }
        } else {
            return INVALID_DB; // Devolver mensaje si la base de datos no es válida
        }
    } else {
        return INVALID_QUERY; // Devolver mensaje si la consulta no es válida
    }
};

// Función para eliminar bases de datos o tablas
export const drop = (query, player) => {
    const querySplit = querySplits(query);
    // Comprobar si la consulta es para eliminar una base de datos
    if (querySplit[1] === DB) {
        if (querySplit.length === 3) {
            const dbName = querySplit[2];
            // Verificar si el jugador tiene la etiqueta de la base de datos especificada
            if (player.hasTag(`db:${dbName}`)) {
                // Filtrar las etiquetas del jugador para encontrar las correspondientes a la base de datos especificada
                const db = player.getTags().filter((tag) => {
                    const db = tag.split("-");
                    return db[0] === `db:${dbName}`
                });
                // Eliminar todas las etiquetas relacionadas con la base de datos especificada
                for (let i = 0; i < db.length; i++) {
                    player.removeTag(db[i]);
                }
                return "§aDrop database"; // Devolver mensaje de base de datos eliminada
            } else {
                return INVALID_DB; // Devolver mensaje si la base de datos no existe
            }
        } else {
            return INVALID_QUERY; // Devolver mensaje si la consulta no es válida
        }
    }
    // Comprobar si la consulta es para eliminar una tabla
    else if (querySplit[1] === TABLE) {
        if (querySplit.length === 4) {
            const dbName = querySplit[2];
            const tableName = querySplit[3];
            // Verificar si el jugador tiene la etiqueta de la base de datos especificada
            if (player.hasTag(`db:${dbName}`)) {
                // Filtrar las etiquetas del jugador para encontrar la tabla especificada
                const tbl = player.getTags().filter((tag) => {
                    const tagSplit = tag.split("-");
                    return (
                        tagSplit.length >= 2 &&
                        tagSplit[0] === `db:${dbName}` &&
                        tagSplit[1] === `tbl:${tableName}`
                    );
                });
                // Extraer el nombre de la tabla de las etiquetas encontradas
                const table = tbl.length ? tbl[0].split("-")[1] : "";
                if (table === `tbl:${tableName}`) {
                    // Eliminar todas las etiquetas relacionadas con la tabla especificada
                    for (let i = 0; i < tbl.length; i++) {
                        player.removeTag(tbl[i]);
                    }
                    return "§aDrop table"; // Devolver mensaje de tabla eliminada
                } else {
                    return "§cThe table does not exist"; // Devolver mensaje si la tabla no existe
                }
            } else {
                return INVALID_DB; // Devolver mensaje si la base de datos no es válida
            }
        } else {
            return INVALID_QUERY; // Devolver mensaje si la consulta no es válida
        }
    } else {
        return INVALID_QUERY; // Devolver mensaje si la consulta no coincide con 'DB' ni 'TABLE'
    }
};