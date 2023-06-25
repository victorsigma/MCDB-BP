export const INVALID_QUERY = "§4Invalid query"
export const INVALID_DB = "§cDatabase does not exist"
export const DB = "database"
export const TABLE = "table"
export const NO_MATCH= "§6No matching values found"

//Help outs
export const DDL = `§gDDL Syntax:
§b&create §5database §cdatabase_name
§b&create §5table §edatabase_owner_name §ctable_name properties?
§b&alter §edatabase_owner_name §ctable_name properties?
§b&drop §5database §cdatabase_name
§b&drop §5table §edatabase_owner_name §ctable_name`;
export const DQL =`§gDQL Syntax:
§b&select §edatabase_owner_name §ctable_name §cconditions? §eprojection? §csort?`;
export const DML = `§gDML Syntax:
§b&insert §edatabase_owner_name §ctable_name §evalue
§b&update §edatabase_owner_name §ctable_name §cconditions §enew_values
§b&delete §edatabase_owner_name §ctable_name §cconditions`;
export const DUL = `§gDUL Syntax:
§b&databases
§b&tables §edatabase_owner_name`;