import { INVALID_QUERY, INVALID_DB, INVALID_TABLE, INVALID_JOIN } from './commonResponses'; // Importar respuestas de consulta no válidas
import { querySplits } from './databaseUtils'; // Importar función de división de consulta
import { tableExists } from "./ddlQuerys"; // Importar función de verificación de existencia de tabla en la base de datos
import { compareJSON } from './dmlQuerys'; // Importar función de comparación de objetos JSON

// Función para realizar una consulta SELECT en la base de datos
export const select = (query, player) => {
    // &select dbName tableName conditions projection sort
    // Dividir la consulta en partes
    const querySplit = querySplits(query)
    // Verificar si hay suficientes partes en la consulta
    if (querySplit.length >= 3) {
        try {
            // Obtener el nombre de la base de datos, el nombre de la tabla, las condiciones, la proyección y la clasificación de la consulta
            const dbName = querySplit[1];
            const tableName = querySplit[2];
            const conditions = querySplit.length >= 4 ? JSON.parse(querySplit[3]) : {};
            const projection = querySplit.length >= 5 ? JSON.parse(querySplit[4]) : {};
            const sort = querySplit.length >= 6 ? JSON.parse(querySplit[5]) : {};

            // Verificar si la tabla especificada existe en la base de datos
            if (tableExists(dbName, tableName, player)) {
                // Obtener las etiquetas de valores de la tabla
                const tableTags = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName}-value:`));

                const results = []; // Array para almacenar los resultados de la consulta

                // Iterar sobre las etiquetas de valores de la tabla
                tableTags.forEach((tableTag) => {
                    try {
                        // Obtener el valor de la etiqueta y analizarlo como JSON
                        const tableValue = tableTag.split("-value:")[1];
                        const json = JSON.parse(tableValue);
                        // Verificar si el valor cumple con las condiciones de la consulta y agregarlo a los resultados si es así
                        if (compareJSON(json, conditions)) {
                            results.push(json);
                        }
                    } catch (error) {
                        return INVALID_QUERY; // Devolver mensaje de consulta no válida si ocurre un error al analizar el valor
                    }
                });

                // Verificar si se encontraron resultados
                if (results.length > 0) {
                    // Ordenar los resultados si se proporciona una opción de clasificación (sort)


                    // Aplicar la proyección a los resultados
                    const projectedResults = results.map((result) => projectJSON(result, projection));

                    // Ordenar los resultados proyectados
                    sortJSON(projectedResults, sort);

                    // Devolver los resultados proyectados como una cadena JSON
                    return `${JSON.stringify(projectedResults)}`;
                } else {
                    return "§6No matching values found"; // Devolver mensaje si no se encontraron valores coincidentes
                }
            } else {
                return INVALID_DB; // Devolver mensaje si la base de datos no existe
            }
        } catch (error) {
            return INVALID_QUERY; // Devolver mensaje si ocurre un error al analizar la consulta
        }
    } else {
        return INVALID_QUERY; // Devolver mensaje si la consulta no tiene suficientes partes
    }
};

// Función para aplicar la proyección a un objeto JSON
export const projectJSON = (json, projection) => {
    // Verificar si se debe proyectar todo el objeto JSON
    if (!projection || projection.all || Object.keys(projection).length === 0) {
        return json; // Devolver el objeto JSON sin cambios si no se especifica una proyección o si se solicita toda la proyección
    } else {
        const projectedJson = {}; // Objeto para almacenar las propiedades proyectadas
        // Iterar sobre las propiedades de la proyección
        for (const prop in projection) {
            if (projection[prop]) {
                // Verificar si la propiedad existe en el objeto JSON original y agregarla al objeto proyectado si es así
                if (json.hasOwnProperty(prop)) {
                    projectedJson[prop] = json[prop];
                }
            }
        }
        return projectedJson; // Devolver el objeto proyectado
    }
};

// Función para ordenar un array de objetos JSON
export const sortJSON = (json, sort) => {
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

// Función para realizar una consulta JOIN en la base de datos
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

            // Verificar si las tablas especificadas existen en la base de datos
            if (tableExists(dbName, tableName1, player) && tableExists(dbName, tableName2, player)) {
                // Obtener las etiquetas de valores de ambas tablas
                const tableTags1 = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName1}-value:`));
                const tableTags2 = player.getTags().filter((tag) => tag.startsWith(`db:${dbName}-tbl:${tableName2}-value:`));

                let results = [];

                // Realizar la unión según el tipo especificado
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
                        return INVALID_JOIN; // Devolver mensaje si el tipo de unión es inválido
                }

                const conditionsResult = []; // Array para almacenar los resultados que cumplen las condiciones

                // Filtrar los resultados que cumplen las condiciones especificadas
                results.forEach((tableValue) => {
                    try {
                        const json = tableValue;
                        if (compareJSON(json, conditions)) {
                            conditionsResult.push(json);
                        }
                    } catch (error) {
                        console.warn("Conditions")
                        return INVALID_QUERY; // Devolver mensaje si hay un error al comparar las condiciones
                    }
                });

                // Verificar si se encontraron resultados que cumplen las condiciones
                if (results.length > 0) {
                    // Aplicar proyección a los resultados
                    const projectedResults = conditionsResult.map((result) => projectJSON(result, projection));

                    // Ordenar los resultados si se proporciona una opción de clasificación (sort)
                    sortJSON(projectedResults, sort);

                    // Devolver los resultados proyectados como una cadena JSON
                    return `${JSON.stringify(projectedResults)}`;
                } else {
                    return "§6No matching values found"; // Devolver mensaje si no se encontraron valores coincidentes
                }
            } else {
                return INVALID_TABLE; // Devolver mensaje si alguna de las tablas no existe en la base de datos
            }
        } catch (error) {
            console.warn("Global try")
            return INVALID_QUERY; // Devolver mensaje si ocurre un error al analizar la consulta
        }
    } else {
        console.warn("Length query")
        return INVALID_QUERY; // Devolver mensaje si la consulta no tiene suficientes partes
    }
}

// Función para realizar una unión LEFT JOIN
const left = (union, tableTags1, tableTags2) => {
    const propertiesJoin = union.properties; // Propiedades de unión especificadas en la consulta
    const results = []; // Array para almacenar los resultados del JOIN

    if (Array.isArray(propertiesJoin)) {
        // JOIN con múltiples propiedades
        tableTags1.forEach((tag1) => {
            const json1 = JSON.parse(tag1.split("-value:")[1]); // Convertir la etiqueta a JSON
            const joinResults = []; // Array para almacenar los resultados del JOIN

            tableTags2.forEach((tag2) => {
                const json2 = JSON.parse(tag2.split("-value:")[1]); // Convertir la etiqueta a JSON
                const joinedJson = Object.assign({}, json1, json2); // Combinar los JSON de ambas tablas

                // Verificar si las propiedades de unión coinciden
                let match = true;
                propertiesJoin.forEach((property) => {
                    if (json1[property] !== json2[property]) {
                        match = false;
                    }
                });

                if (match) {
                    joinResults.push(joinedJson); // Agregar el resultado del JOIN al array
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
                // Agregar los resultados del JOIN al array
                results.push(...joinResults);
            }
        });
    } else {
        // JOIN con una única propiedad
        const propertiesOn = union.hasOwnProperty('on') ? Array.isArray(union.on) ? union.on.length === 2 ? union.on : [] : [] : [];

        if (propertiesOn != []) {
            // Lógica para JOIN con propiedades 'on'
            tableTags1.forEach((tag1) => {
                const json1 = JSON.parse(tag1.split("-value:")[1]); // Convertir la etiqueta a JSON
                const joinResults = []; // Array para almacenar los resultados del JOIN

                tableTags2.forEach((tag2) => {
                    const json2 = JSON.parse(tag2.split("-value:")[1]); // Convertir la etiqueta a JSON
                    const joinedJson = Object.assign({}, json1, json2); // Combinar los JSON de ambas tablas

                    // Verificar si la propiedad de unión coincide
                    if (json1[propertiesOn[0]] === json2[propertiesOn[1]]) {
                        joinResults.push(joinedJson); // Agregar el resultado del JOIN al array
                    }
                });

                if (joinResults.length === 0) {
                    // Agregar resultados nulos para las filas sin coincidencias
                    const nullResult = Object.assign({}, json1);
                    nullResult[propertiesOn[0]] = null;
                    results.push(nullResult);
                } else {
                    // Agregar los resultados del JOIN al array
                    results.push(...joinResults);
                }
            });
        } else {
            // Lógica para JOIN con propiedad 'properties'
            const propertyJoin = propertiesJoin;

            tableTags1.forEach((tag1) => {
                const json1 = JSON.parse(tag1.split("-value:")[1]); // Convertir la etiqueta a JSON
                const joinResults = []; // Array para almacenar los resultados del JOIN

                tableTags2.forEach((tag2) => {
                    const json2 = JSON.parse(tag2.split("-value:")[1]); // Convertir la etiqueta a JSON
                    const joinedJson = Object.assign({}, json1, json2); // Combinar los JSON de ambas tablas

                    // Verificar si la propiedad de unión coincide
                    if (json1[propertyJoin] === json2[propertyJoin]) {
                        joinResults.push(joinedJson); // Agregar el resultado del JOIN al array
                    }
                });

                if (joinResults.length === 0) {
                    // Agregar resultados nulos para las filas sin coincidencias
                    const nullResult = Object.assign({}, json1);
                    nullResult[propertyJoin] = null;
                    results.push(nullResult);
                } else {
                    // Agregar los resultados del JOIN al array
                    results.push(...joinResults);
                }
            });
        }
    }
    return results; // Devolver los resultados del JOIN
};



// Función para realizar una unión RIGHT JOIN
const right = (union, tableTags1, tableTags2) => {
    const propertiesJoin = union.properties; // Propiedades de unión especificadas en la consulta
    const results = []; // Array para almacenar los resultados del JOIN

    if (Array.isArray(propertiesJoin)) {
        // JOIN con múltiples propiedades
        tableTags2.forEach((tag2) => {
            const json2 = JSON.parse(tag2.split("-value:")[1]); // Convertir la etiqueta a JSON
            const joinResults = []; // Array para almacenar los resultados del JOIN

            tableTags1.forEach((tag1) => {
                const json1 = JSON.parse(tag1.split("-value:")[1]); // Convertir la etiqueta a JSON
                const joinedJson = Object.assign({}, json2, json1); // Combinar los JSON de ambas tablas

                // Verificar si las propiedades de unión coinciden
                let match = true;
                propertiesJoin.forEach((property) => {
                    if (json2[property] !== json1[property]) {
                        match = false;
                    }
                });

                if (match) {
                    joinResults.push(joinedJson); // Agregar el resultado del JOIN al array
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
                // Agregar los resultados del JOIN al array
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
                const json2 = JSON.parse(tag2.split("-value:")[1]); // Convertir la etiqueta a JSON
                const joinResults = []; // Array para almacenar los resultados del JOIN

                tableTags1.forEach((tag1) => {
                    const json1 = JSON.parse(tag1.split("-value:")[1]); // Convertir la etiqueta a JSON
                    const joinedJson = Object.assign({}, json2, json1); // Combinar los JSON de ambas tablas

                    // Verificar si la propiedad de unión coincide
                    if (json2[propertiesOn[1]] === json1[propertiesOn[0]]) {
                        joinResults.push(joinedJson); // Agregar el resultado del JOIN al array
                    }
                });

                if (joinResults.length === 0) {
                    // Agregar resultados nulos para las filas sin coincidencias
                    const nullResult = Object.assign({}, json2);
                    nullResult[propertiesOn[1]] = null;
                    results.push(nullResult);
                } else {
                    // Agregar los resultados del JOIN al array
                    results.push(...joinResults);
                }
            });
        }
        else {
            // Lógica para JOIN con propiedad 'properties'
            const propertyJoin = propertiesJoin;

            tableTags2.forEach((tag2) => {
                const json2 = JSON.parse(tag2.split("-value:")[1]); // Convertir la etiqueta a JSON
                const joinResults = []; // Array para almacenar los resultados del JOIN

                tableTags1.forEach((tag1) => {
                    const json1 = JSON.parse(tag1.split("-value:")[1]); // Convertir la etiqueta a JSON
                    const joinedJson = Object.assign({}, json2, json1); // Combinar los JSON de ambas tablas

                    // Verificar si la propiedad de unión coincide
                    if (json2[propertyJoin] === json1[propertyJoin]) {
                        joinResults.push(joinedJson); // Agregar el resultado del JOIN al array
                    }
                });

                if (joinResults.length === 0) {
                    // Agregar resultados nulos para las filas sin coincidencias
                    const nullResult = Object.assign({}, json2);
                    nullResult[propertyJoin] = null;
                    results.push(nullResult);
                } else {
                    // Agregar los resultados del JOIN al array
                    results.push(...joinResults);
                }
            });
        }
    }
    return results; // Devolver los resultados del JOIN
};

// Función para realizar una unión INNER JOIN
const inner = (union, tableTags1, tableTags2) => {
    const propertiesJoin = union.properties; // Propiedades de unión especificadas en la consulta
    const results = new Set(); // Utilizamos un conjunto en lugar de un arreglo para evitar duplicados

    if (Array.isArray(propertiesJoin)) {
        // JOIN con múltiples propiedades
        tableTags1.forEach((tag1) => {
            const json1 = JSON.parse(tag1.split("-value:")[1]); // Convertir la etiqueta a JSON

            tableTags2.forEach((tag2) => {
                const json2 = JSON.parse(tag2.split("-value:")[1]); // Convertir la etiqueta a JSON
                const joinedJson = Object.assign({}, json1, json2); // Combinar los JSON de ambas tablas

                // Verificar si las propiedades de unión coinciden
                let match = true;
                propertiesJoin.forEach((property) => {
                    if (json1[property] !== json2[property]) {
                        match = false;
                    }
                });

                if (match) {
                    results.add(joinedJson); // Agregar el resultado al conjunto
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
                const json1 = JSON.parse(tag1.split("-value:")[1]); // Convertir la etiqueta a JSON

                tableTags2.forEach((tag2) => {
                    const json2 = JSON.parse(tag2.split("-value:")[1]); // Convertir la etiqueta a JSON
                    const joinedJson = Object.assign({}, json1, json2); // Combinar los JSON de ambas tablas

                    // Verificar si la propiedad de unión coincide
                    if (json1[propertiesOn[0]] === json2[propertiesOn[1]]) {
                        results.add(joinedJson); // Agregar el resultado al conjunto
                    }
                });
            });
        } else {
            // Lógica para JOIN con propiedad 'properties'
            const propertyJoin = propertiesJoin;

            tableTags1.forEach((tag1) => {
                const json1 = JSON.parse(tag1.split("-value:")[1]); // Convertir la etiqueta a JSON

                tableTags2.forEach((tag2) => {
                    const json2 = JSON.parse(tag2.split("-value:")[1]); // Convertir la etiqueta a JSON
                    const joinedJson = Object.assign({}, json1, json2); // Combinar los JSON de ambas tablas

                    // Verificar si la propiedad de unión coincide
                    if (json1[propertyJoin] === json2[propertyJoin]) {
                        results.add(joinedJson); // Agregar el resultado al conjunto
                    }
                });
            });
        }
    }

    return Array.from(results); // Convertimos el conjunto en un arreglo antes de devolverlo
};
