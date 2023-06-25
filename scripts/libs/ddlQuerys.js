import { INVALID_QUERY, INVALID_DB, DB, TABLE } from './commonResponses'

export const create = (query, player) => {
    const querySplit = query.split(" ");

    if (querySplit[1] === DB) {
        if (querySplit.length === 3) {
            const dbName = querySplit[2];
            // Comprueba si el jugador ya tiene la etiqueta de la base de datos
            if (player.hasTag(`db:${dbName}`)) {
                return "§4Existing database";
            } else {
                // Agrega la etiqueta al jugador
                player.addTag(`db:${dbName}`);
                return "§aDatabase created";
            }
        } else {
            return INVALID_QUERY;
        }
    } else if (querySplit[1] === TABLE) {
        if (querySplit.length >= 3) {
            const dbName = querySplit[2];
            const tableName = querySplit[3];
            const properties = querySplit[4] ? querySplit[4] : "";
            // Comprueba si el jugador ya tiene la etiqueta de la base de datos
            if (player.hasTag(`db:${dbName}`)) {
                return createTable(dbName, tableName, properties, player);
            } else {
                return INVALID_DB;
            }
        } else {
            return INVALID_QUERY;
        }
    } else {
        return INVALID_QUERY;
    }
};

const createTable = (dbName, tableName, properties, player) => {
    if (tableExists(dbName, tableName, player)) {
        return "§cTable already exists";
    }

    // Validación de propiedades
    if (!isValidProperties(properties)) {
        return "§4Invalid properties";
    }

    if (properties === "") {
        const table = `db:${dbName}-tbl:${tableName}`
        player.addTag(table);
    } else {
        const table = `db:${dbName}-tbl:${tableName}-properties:${properties}`
        player.addTag(table);
    }

    return "§aTable created";
};

const alterTable = (dbName, tableName, properties, player, tbl) => {
    // Validación de propiedades
    if (!isValidProperties(properties)) {
        return "§4Invalid properties";
    }

    player.removeTag(tbl[0]);
    if (properties === "") {
        const table = `db:${dbName}-tbl:${tableName}`
        player.addTag(table);
    } else {
        const table = `db:${dbName}-tbl:${tableName}-properties:${properties}`
        player.addTag(table);
    }

    return "§aTable altered";
};

export const tableExists = (dbName, tableName, player) => {
    const existingTables = player.getTags().filter((tag) => {
        const tagSplit = tag.split("-");
        return (
            tagSplit.length >= 2 &&
            tagSplit[0] === `db:${dbName}` &&
            tagSplit[1] === `tbl:${tableName}`
        );
    });

    return existingTables.length > 0;
};

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
                    return false;
                }
            }

            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

export const alter = (query, player) => {
    const querySplit = query.split(" ");
    if (querySplit.length >= 3) {
        const dbName = querySplit[1];
        const tableName = querySplit[2];
        const properties = querySplit[3] ? querySplit[3] : "";
        if (player.hasTag(`db:${dbName}`)) {
            const tbl = player.getTags().filter((tag) => {
                const tagSplit = tag.split("-");
                return (
                    tagSplit.length >= 2 &&
                    tagSplit[0] === `db:${dbName}` &&
                    tagSplit[1] === `tbl:${tableName}`
                );
            });
            const table = tbl.length ? tbl[0].split("-")[1] : "";
            if (table.startsWith(`tbl:${tableName}`)) {
                if (tbl.length === 1) {
                    return alterTable(dbName, tableName, properties, player, tbl);
                } else if (tbl.length < 1) {
                    return "§cThe table does not exist";
                } else {
                    return "§6The table already has data";
                }
            } else {
                return "§cThe table does not exist";
            }
        } else {
            return INVALID_DB;
        }
    } else {
        return INVALID_QUERY;
    }
};

export const drop = (query, player) => {
    const querySplit = query.split(" ");
    if (querySplit[1] === DB) {
        if (querySplit.length === 3) {
            const dbName = querySplit[2];
            // Comprueba si el jugador ya tiene la etiqueta de la base de datos
            if (player.hasTag(`db:${dbName}`)) {
                const db = player.getTags().filter((tag) => {
                    const db = tag.split("-");
                    return db[0] === `db:${dbName}`
                });
                for (let i = 0; i < db.length; i++) {
                    player.removeTag(db[i]);
                }
                return "§aDrop database";
            } else {
                return INVALID_DB;
            }
        } else {
            return INVALID_QUERY;
        }
    } else if (querySplit[1] === TABLE) {
        if (querySplit.length === 4) {
            const dbName = querySplit[2];
            const tableName = querySplit[3];
            if (player.hasTag(`db:${dbName}`)) {
                const tbl = player.getTags().filter((tag) => {
                    const tagSplit = tag.split("-");
                    return (
                        tagSplit.length >= 2 &&
                        tagSplit[0] === `db:${dbName}` &&
                        tagSplit[1] === `tbl:${tableName}`
                    );
                });
                const table = tbl.length ? tbl[0].split("-")[1] : "";
                if (table === `tbl:${tableName}`) {
                    for (let i = 0; i < tbl.length; i++) {
                        player.removeTag(tbl[i]);
                    }
                    return "§aDrop table";
                } else {
                    return "§cThe table does not exist";
                }
            } else {
                return INVALID_DB;
            }
        } else {
            return INVALID_QUERY;
        }
    } else {
        return INVALID_QUERY;
    }
};