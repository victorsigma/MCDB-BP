import { INVALID_QUERY, INVALID_DB, INVALID_TABLE, INVALID_JOIN } from './commonResponses';
import { querySplits } from './databaseUtils';
import { tableExists } from "./ddlQuerys";
import { compareJSON } from './dmlQuerys';

export const select = (query, player) => {
    // &select dbName tableName conditions projection sort
    const querySplit = querySplits(query)
    if (querySplit.length >= 3) {
        try {
            const dbName = querySplit[1];
            const tableName = querySplit[2];
            const conditions = querySplit.length >= 4 ? JSON.parse(querySplit[3]) : {};
            const projection = querySplit.length >= 5 ? JSON.parse(querySplit[4]) : {};
            const sort = querySplit.length >= 6 ? JSON.parse(querySplit[5]) : {};

            if (tableExists(dbName, tableName, player)) {
                const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-value:`));

                const results = [];
                tableTags.forEach((tableTag) => {
                    try {
                        const tableValue = tableTag.split("-value:")[1];
                        const json = JSON.parse(tableValue);
                        if (compareJSON(json, conditions)) {
                            results.push(json);
                        }
                    } catch (error) {
                        return INVALID_QUERY;
                    }
                });

                if (results.length > 0) {
                    // Ordenar los resultados si se proporciona una opción de clasificación (sort)


                    // Aplicar la proyección a los resultados
                    const projectedResults = results.map((result) => projectJSON(result, projection));

                    sortJSON(projectedResults, sort);

                    return `${JSON.stringify(projectedResults)}`;
                } else {
                    return "§6No matching values found";
                }
            } else {
                return INVALID_DB;
            }
        } catch (error) {
            return INVALID_QUERY;
        }
    } else {
        return INVALID_QUERY;
    }
};


const projectJSON = (json, projection) => {
    if (!projection || projection.all || Object.keys(projection).length === 0) {
        return json;
    } else {
        const projectedJson = {};
        for (const prop in projection) {
            if (projection[prop]) {
                if (json.hasOwnProperty(prop)) {
                    projectedJson[prop] = json[prop];
                }
            }
        }
        return projectedJson;
    }
};


const sortJSON = (json, sort) => {
    if (Object.keys(sort).length > 0) {
        return json.sort((a, b) => {
            for (const prop in sort) {
                const sortOrder = sort[prop];
                if (a[prop] < b[prop]) {
                    return sortOrder === "asc" ? -1 : 1;
                }
                if (a[prop] > b[prop]) {
                    return sortOrder === "asc" ? 1 : -1;
                }
            }
            return 0;
        });
    }
}


export const join = (query, player) => {
    //  0      1        2         3         4        5          6        7
    //&join dbName tableName1 tableName2 union conditions? projection? sort?
    //union = {type=types,propertie:"namePropertie",on:["propiedadTabla1", "propiedadTabla2"]}
    //types = "left" | "right" | "inner"

    const querySplit = querySplits(query);
    if (querySplit.length >= 5) {
        try {
            const dbName = querySplit[1];
            const tableName1 = querySplit[2];
            const tableName2 = querySplit[3];
            const union = JSON.parse(querySplit[4]);
            const conditions = querySplit.length >= 6 ? JSON.parse(querySplit[5]) : {};
            const projection = querySplit.length >= 7 ? JSON.parse(querySplit[6]) : {};
            const sort = querySplit.length >= 8 ? JSON.parse(querySplit[7]) : {};

            if (tableExists(dbName, tableName1, player) && tableExists(dbName, tableName2, player)) {
                const tableTags1 = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName1}-value:`));
                const tableTags2 = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName2}-value:`));
                let results = []
                switch (union.type) {
                    case "left":
                        results = left(union, tableTags1, tableTags2);
                        break;
                    case "right":
                        results = right(union, tableTags1, tableTags2);
                        break;
                    case "inner":
                        results = inner(union, tableTags1, tableTags2);
                        break
                    default:
                        return INVALID_JOIN;
                }
                const conditionsResult = []
                results.forEach((tableValue) => {
                    try {
                        const json = tableValue;
                        if (compareJSON(json, conditions)) {
                            conditionsResult.push(json);
                        }
                    } catch (error) {
                        console.warn("Conditions")
                        return INVALID_QUERY;
                    }
                });

                if (results.length > 0) {
                    // Aplicar proyección a los resultados
                    const projectedResults = conditionsResult.map((result) => projectJSON(result, projection));

                    // Ordenar los resultados si se proporciona una opción de clasificación (sort)
                    sortJSON(projectedResults, sort);

                    return `${JSON.stringify(projectedResults)}`;
                } else {
                    return "§6No matching values found";
                }
            } else {
                return INVALID_TABLE;
            }
        } catch (error) {
            console.warn("Global try")
            return INVALID_QUERY;
        }
    } else {
        console.warn("Length query")
        return INVALID_QUERY;
    }
}


const left = (union, tableTags1, tableTags2) => {
    const propertiesJoin = union.properties;
    const results = [];

    if (Array.isArray(propertiesJoin)) {
        // JOIN con múltiples propiedades
        tableTags1.forEach((tag1) => {
            const json1 = JSON.parse(tag1.split("-value:")[1]);
            const joinResults = [];

            tableTags2.forEach((tag2) => {
                const json2 = JSON.parse(tag2.split("-value:")[1]);
                const joinedJson = Object.assign({}, json1, json2);

                // Verificar si las propiedades de unión coinciden
                let match = true;
                propertiesJoin.forEach((property) => {
                    if (json1[property] !== json2[property]) {
                        match = false;
                    }
                });

                if (match) {
                    joinResults.push(joinedJson);
                }
            });

            if (joinResults.length === 0) {
                // Agregar resultados nulos para las filas sin coincidencias
                const nullResult = Object.assign({}, json1);
                propertiesJoin.forEach((property) => {
                    nullResult[property] = null;
                });
                results.push(nullResult);
            } else {
                // Agregar los resultados del JOIN
                results.push(...joinResults);
            }
        });
    } else {
        // JOIN con una única propiedad
        const propertiesOn = union.hasOwnProperty('on') ? Array.isArray(union.on) ? union.on.length === 2 ? union.on : [] : [] : [];
        // Verificar si se especificaron propiedades 'on' para la comparación
        if (propertiesOn != []) {
            // Lógica para JOIN con propiedades 'on'
            tableTags1.forEach((tag1) => {
                const json1 = JSON.parse(tag1.split("-value:")[1]);
                const joinResults = [];

                tableTags2.forEach((tag2) => {
                    const json2 = JSON.parse(tag2.split("-value:")[1]);
                    const joinedJson = Object.assign({}, json1, json2);

                    // Verificar si la propiedad de unión coincide
                    if (json1[propertiesOn[0]] === json2[propertiesOn[1]]) {
                        joinResults.push(joinedJson);
                    }
                });

                if (joinResults.length === 0) {
                    // Agregar resultados nulos para las filas sin coincidencias
                    const nullResult = Object.assign({}, json1);
                    nullResult[propertiesOn[0]] = null;
                    results.push(nullResult);
                } else {
                    // Agregar los resultados del JOIN
                    results.push(...joinResults);
                }
            });
        } else {
            // Lógica para JOIN con propiedad 'properties'
            const propertyJoin = propertiesJoin;

            tableTags1.forEach((tag1) => {
                const json1 = JSON.parse(tag1.split("-value:")[1]);
                const joinResults = [];

                tableTags2.forEach((tag2) => {
                    const json2 = JSON.parse(tag2.split("-value:")[1]);
                    const joinedJson = Object.assign({}, json1, json2);

                    // Verificar si la propiedad de unión coincide
                    if (json1[propertyJoin] === json2[propertyJoin]) {
                        joinResults.push(joinedJson);
                    }
                });

                if (joinResults.length === 0) {
                    // Agregar resultados nulos para las filas sin coincidencias
                    const nullResult = Object.assign({}, json1);
                    nullResult[propertyJoin] = null;
                    results.push(nullResult);
                } else {
                    // Agregar los resultados del JOIN
                    results.push(...joinResults);
                }
            });
        }
    }
    return results;
};



const right = (union, tableTags1, tableTags2) => {
    const propertiesJoin = union.properties;
    const results = [];

    if (Array.isArray(propertiesJoin)) {
        // JOIN con múltiples propiedades
        tableTags2.forEach((tag2) => {
            const json2 = JSON.parse(tag2.split("-value:")[1]);
            const joinResults = [];

            tableTags1.forEach((tag1) => {
                const json1 = JSON.parse(tag1.split("-value:")[1]);
                const joinedJson = Object.assign({}, json2, json1);

                // Verificar si las propiedades de unión coinciden
                let match = true;
                propertiesJoin.forEach((property) => {
                    if (json2[property] !== json1[property]) {
                        match = false;
                    }
                });

                if (match) {
                    joinResults.push(joinedJson);
                }
            });

            if (joinResults.length === 0) {
                // Agregar resultados nulos para las filas sin coincidencias
                const nullResult = Object.assign({}, json2);
                propertiesJoin.forEach((property) => {
                    nullResult[property] = null;
                });
                results.push(nullResult);
            } else {
                // Agregar los resultados del JOIN
                results.push(...joinResults);
            }
        });
    } else {
        // JOIN con una única propiedad
        const propertiesOn = union.hasOwnProperty('on') ? Array.isArray(union.on) ? union.on.length === 2 ? union.on : [] : [] : [];
        // Verificar si se especificaron propiedades 'on' para la comparación
        if (propertiesOn != []) {
            // Lógica para JOIN con propiedades 'on'
            tableTags2.forEach((tag2) => {
                const json2 = JSON.parse(tag2.split("-value:")[1]);
                const joinResults = [];

                tableTags1.forEach((tag1) => {
                    const json1 = JSON.parse(tag1.split("-value:")[1]);
                    const joinedJson = Object.assign({}, json2, json1);

                    // Verificar si la propiedad de unión coincide
                    if (json2[propertiesOn[1]] === json1[propertiesOn[0]]) {
                        joinResults.push(joinedJson);
                    }
                });

                if (joinResults.length === 0) {
                    // Agregar resultados nulos para las filas sin coincidencias
                    const nullResult = Object.assign({}, json2);
                    nullResult[propertiesOn[1]] = null;
                    results.push(nullResult);
                } else {
                    // Agregar los resultados del JOIN
                    results.push(...joinResults);
                }
            });
        }
        else {
            // Lógica para JOIN con propiedad 'properties'
            const propertyJoin = propertiesJoin;

            tableTags2.forEach((tag2) => {
                const json2 = JSON.parse(tag2.split("-value:")[1]);
                const joinResults = [];

                tableTags1.forEach((tag1) => {
                    const json1 = JSON.parse(tag1.split("-value:")[1]);
                    const joinedJson = Object.assign({}, json2, json1);

                    // Verificar si la propiedad de unión coincide
                    if (json2[propertyJoin] === json1[propertyJoin]) {
                        joinResults.push(joinedJson);
                    }
                });

                if (joinResults.length === 0) {
                    // Agregar resultados nulos para las filas sin coincidencias
                    const nullResult = Object.assign({}, json2);
                    nullResult[propertyJoin] = null;
                    results.push(nullResult);
                } else {
                    // Agregar los resultados del JOIN
                    results.push(...joinResults);
                }
            });
        }
    }
    return results;
}

const inner = (union, tableTags1, tableTags2) => {
    const propertiesJoin = union.properties;
    const results = new Set(); // Utilizamos un conjunto en lugar de un arreglo

    if (Array.isArray(propertiesJoin)) {
        tableTags1.forEach((tag1) => {
            const json1 = JSON.parse(tag1.split("-value:")[1]);

            tableTags2.forEach((tag2) => {
                const json2 = JSON.parse(tag2.split("-value:")[1]);
                const joinedJson = Object.assign({}, json1, json2);

                // Verificar si las propiedades de unión coinciden
                let match = true;
                propertiesJoin.forEach((property) => {
                    if (json1[property] !== json2[property]) {
                        match = false;
                    }
                });

                if (match) {
                    results.add(joinedJson); // Agregamos el resultado al conjunto
                }
            });
        });
    } else {
        // JOIN con una única propiedad
        const propertiesOn = union.hasOwnProperty('on') ? Array.isArray(union.on) ? union.on.length === 2 ? union.on : [] : [] : [];
        // Verificar si se especificaron propiedades 'on' para la comparación
        if (propertiesOn.length >= 2) {
            // Lógica para JOIN con propiedades 'on'
            tableTags1.forEach((tag1) => {
                const json1 = JSON.parse(tag1.split("-value:")[1]);

                tableTags2.forEach((tag2) => {
                    const json2 = JSON.parse(tag2.split("-value:")[1]);
                    const joinedJson = Object.assign({}, json1, json2);

                    // Verificar si la propiedad de unión coincide
                    if (json1[propertiesOn[0]] === json2[propertiesOn[1]]) {
                        results.add(joinedJson); // Agregamos el resultado al conjunto
                    }
                });
            });
        } else {
            // Lógica para JOIN con propiedad 'properties'
            const propertyJoin = propertiesJoin;

            tableTags1.forEach((tag1) => {
                const json1 = JSON.parse(tag1.split("-value:")[1]);

                tableTags2.forEach((tag2) => {
                    const json2 = JSON.parse(tag2.split("-value:")[1]);
                    const joinedJson = Object.assign({}, json1, json2);

                    // Verificar si la propiedad de unión coincide
                    if (json1[propertyJoin] === json2[propertyJoin]) {
                        results.add(joinedJson); // Agregamos el resultado al conjunto
                    }
                });
            });
        }
    }

    return Array.from(results); // Convertimos el conjunto en un arreglo antes de devolverlo
};
