// Definición de respuestas comunes para distintos escenarios

// Mensajes de error para consultas inválidas, bases de datos o tablas inexistentes, o tipos de unión no válidos
export const INVALID_QUERY = "§4Invalid query"
export const INVALID_DB = "§cDatabase does not exist"
export const INVALID_TABLE = "§cTable does not exist"
export const INVALID_JOIN = "§cThe type of union is not valid"

// Definición de nombres para referirse a bases de datos y tablas
export const DB = "database"
export const TABLE = "table"

// Mensaje indicando que no se encontraron valores coincidentes
export const NO_MATCH= "§6No matching values found"

// Mensajes de ayuda para los distintos tipos de consultas (DDL, DQL, DML, DUL)

// Ayuda para consultas DDL (Data Definition Language) como crear, alterar o eliminar bases de datos y tablas
export const DDL = `§gDDL Syntax:
§b&create §5database §cdatabase_name
§b&create §5table §edatabase_owner_name §ctable_name properties?
§b&alter §edatabase_owner_name §ctable_name properties?
§b&drop §5database §cdatabase_name
§b&drop §5table §edatabase_owner_name §ctable_name`;

// Ayuda para consultas DQL (Data Query Language) como seleccionar y unir datos de bases de datos y tablas
export const DQL = `§gDQL Syntax:
§b&select §edatabase_owner_name §ctable_name §cconditions? §eprojection? §csort?
§b&join §edatabase_owner_name §ctable_name1 §ctable_name2 §cunion §cconditions? §eprojection? §csort?
union = {
    "type": "left" | "right" | "inner",
    "properties": "property" | ["property1", "property2", ...]
    "on": ["propiedadTabla1", "propiedadTabla2"]
}`;

// Ayuda para consultas DML (Data Manipulation Language) como insertar, actualizar o eliminar datos en bases de datos y tablas
export const DML = `§gDML Syntax:
§b&insert §edatabase_owner_name §ctable_name §evalue
§b&update §edatabase_owner_name §ctable_name §cconditions §enew_values
§b&delete §edatabase_owner_name §ctable_name §cconditions`;

// Ayuda para consultas DUL (Data Utility Language) para obtener información sobre bases de datos y tablas
export const DUL = `§gDUL Syntax:
§b&databases
§b&tables §edatabase_owner_name`;

// Ayuda para consultas DBL (Data Backup Language) para exportar información de tablas
export const DBL = `§gDBL Syntax:
§b&csv §edatabase_owner_name §ctable_name §cconditions? §eprojection? §csort?
§b&json §edatabase_owner_name §ctable_name §cconditions? §eprojection? §csort?
§b&xml §edatabase_owner_name §ctable_name §cconditions? §eprojection? §csort?
§b&import §edatabase_owner_name §ctable_name §cfile §efiletype

example:
§b&import §edatabase_owner_name §ctable_name §cfile=file.csv §efiletype=csv
§bfiletype = csv | json | xml`;
