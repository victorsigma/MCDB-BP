# Sistema de Gestión de Bases de Datos en Minecraft
Este proyecto consiste en un sistema de gestión de bases de datos desarrollado para ser utilizado en el entorno del juego Minecraft. El sistema permite a los jugadores crear, modificar y consultar bases de datos y tablas dentro del juego.

## Estructura del Proyecto
El proyecto está estructurado en varios módulos que proporcionan diferentes funcionalidades. A continuación se describen los módulos principales:

### 1. databaseUtils
Este módulo contiene utilidades para manejar consultas y operaciones relacionadas con bases de datos y tablas, incluyendo la creación, modificación y eliminación de las mismas.

### 2. queryFormatter
El módulo queryFormatter proporciona funciones para formatear consultas y mensajes de registro antes de ser mostrados en la interfaz del juego.

### 3. configManager
En este módulo se gestiona la configuración del sistema, incluyendo la configuración para mostrar consultas.

### 4. commonResponses
Contiene definiciones de respuestas comunes utilizadas en el sistema, como mensajes de error y ayuda para consultas.

### 5. backupManager
El módulo backupManager proporciona funcionalidades para exportar información de las tablas en diferentes formatos como CSV, JSON y XML.

### 6. shell
Este módulo exporta una instancia de la clase BedrockSystem, que proporciona métodos para registrar mensajes de log, advertencias y errores.

## Uso
El sistema se integra con el juego Minecraft y se utiliza a través de comandos dentro del juego. Se proporciona una serie de comandos para realizar diferentes operaciones, como crear bases de datos y tablas, insertar, actualizar y eliminar datos, y consultar información de las tablas.

A continuación se muestran los comandos principales y sus opciones de ayuda:

### Comandos DDL (Data Definition Language):

- **Crear Base de Datos:** `&create database <database_name>`
- **Crear Tabla:** `&create table <database_owner_name> <table_name> [properties]`
- **Modificar Tabla:** `&alter <database_owner_name> <table_name> [properties]`
- **Eliminar Base de Datos:** `&drop database <database_name>`
- **Eliminar Tabla:** `&drop table <database_owner_name> <table_name>`

Ayuda: `&ddl`

### Comandos DQL (Data Query Language):

- **Seleccionar Datos:** `&select <database_owner_name> <table_name> {conditions} {projection} {sort}`
- **Unir Tablas:** `&join <database_owner_name> <table_name1> <table_name2> <union> {conditions} {projection} {sort}`

`union = {
    "type": "left" | "right" | "inner",
    "properties": "property" | ["property1", "property2", ...] | "on": ["propiedadTabla1", "propiedadTabla2"]
}`

Ayuda: `&dql`

### Comandos DML (Data Manipulation Language):

- **Insertar Datos:** `&insert <database_owner_name> <table_name> <value>`
- **Actualizar Datos:** `&update <database_owner_name> <table_name> <conditions> <new_values>`
- **Eliminar Datos:** `&delete <database_owner_name> <table_name> <conditions>`

Ayuda: `&dml`

### Comandos DUL (Data Utility Language):

- **Listar Bases de Datos:** `&databases`
- **Listar Tablas:** `&tables <database_owner_name>`

Ayuda: `&dul`

## Contribución
Si deseas contribuir al proyecto, siéntete libre de hacerlo enviando solicitudes de extracción. Asegúrate de seguir las pautas de contribución y proporcionar una descripción clara de los cambios propuestos.
