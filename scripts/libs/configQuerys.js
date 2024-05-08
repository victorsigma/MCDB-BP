import { User } from '../models/user';
import { HttpRequest, HttpHeader, HttpRequestMethod, http } from '@minecraft/server-net';
import { querySplits, tableExists } from './databaseUtils'
import { create } from './ddlQuerys';
import { insert } from './dmlQuerys';
import { shell } from './bedrockSystem';

// Función para manejar la configuración de mostrar consultas
export const showQuerys = (query, player) => {
    // Dividir la consulta en partes
    const querySplit = querySplits(query);

    // Verificar si la consulta se dividió correctamente y tiene al menos dos partes
    if (querySplit.length >= 2) {
        // Verificar si el segundo fragmento es "true"
        if (querySplit[1] == "true") {
            // Etiqueta de configuración para mostrar consultas verdaderas
            const configTag = 'config:showquery:true'
            // Etiqueta de configuración para eliminar la configuración de mostrar consultas falsas
            const configTagRemove = 'config:showquery:false'
            // Eliminar la etiqueta de configuración para mostrar consultas falsas (si existe)
            player.removeTag(configTagRemove);
            // Agregar la etiqueta de configuración para mostrar consultas verdaderas
            player.addTag(configTag)
        } else if (querySplit[1] == "false") {
            // Etiqueta de configuración para mostrar consultas falsas
            const configTag = 'config:showquery:false'
            // Etiqueta de configuración para eliminar la configuración de mostrar consultas verdaderas
            const configTagRemove = 'config:showquery:true'
            // Eliminar la etiqueta de configuración para mostrar consultas verdaderas (si existe)
            player.removeTag(configTagRemove);
            // Agregar la etiqueta de configuración para mostrar consultas falsas
            player.addTag(configTag)
        } else {
            // Si el segundo fragmento no es ni "true" ni "false", se establece como verdadero por defecto
            const configTag = 'config:showquery:true'
            const configTagRemove = 'config:showquery:false'
            player.removeTag(configTagRemove);
            player.addTag(configTag)
        }
        // Obtener las etiquetas del jugador y filtrar aquellas que comiencen con 'config:showquery:'
        const result = player.getTags().filter(filter => filter.startsWith('config:showquery:'))
        // Devolver un mensaje indicando la configuración actual de mostrar consultas
        return `§eShow Query ${result[0].replace('config:showquery:', '')}`
    } else {
        // Si la consulta no se dividió correctamente o no tiene al menos dos partes
        // Obtener las etiquetas del jugador y filtrar aquellas que comiencen con 'config:showquery:'
        const result = player.getTags().filter(filter => filter.startsWith('config:showquery:'))
        // Si hay etiquetas de configuración de mostrar consultas, devolver el estado actual
        if (result.length) {
            return `§eShow Query ${result[0].replace('config:showquery:', '')}`
        }
        // Si no hay etiquetas de configuración de mostrar consultas, devolver el estado predeterminado (true)
        return `§eShow Query true`
    }
}


export const enableSecurity = async (query, player) => {
    const querySplit = querySplits(query);
    if (querySplit.length > 1) {
        // Verificar si el segundo fragmento es "true"
        if (querySplit[1] == "true") {
            if (tableExists('security', 'user_authentication', player)) {
                // Etiqueta de configuración para mostrar consultas verdaderas
                const configTag = 'config:enablesecurity:true'
                // Etiqueta de configuración para eliminar la configuración de mostrar consultas falsas
                const configTagRemove = 'config:enablesecurity:false'
                // Eliminar la etiqueta de configuración para mostrar consultas falsas (si existe)
                player.removeTag(configTagRemove);
                // Agregar la etiqueta de configuración para mostrar consultas verdaderas
                player.addTag(configTag)
            } else {
                const root = await getRootUser();
                if(root.message != undefined) return `§4Configuration error`

                const queryUser = `&insert security user_authentication {"user": "${root.user}", "password": "${root.password}"}`

                if (!player.hasTag(`db:security`)) {
                    const queryDatabase = '&create database security';
                    create(queryDatabase, player);
                }
                const queryTable = '&create table security user_authentication {"user": "string", "password": "string"}';
                create(queryTable, player);



                insert(queryUser, player);

                // Etiqueta de configuración para mostrar consultas verdaderas
                const configTag = 'config:enablesecurity:true'
                // Etiqueta de configuración para eliminar la configuración de mostrar consultas falsas
                const configTagRemove = 'config:enablesecurity:false'
                // Eliminar la etiqueta de configuración para mostrar consultas falsas (si existe)
                player.removeTag(configTagRemove);
                // Agregar la etiqueta de configuración para mostrar consultas verdaderas
                player.addTag(configTag)
            }
        } else if (querySplit[1] == "false") {
            // Etiqueta de configuración para mostrar consultas falsas
            const configTag = 'config:enablesecurity:false'
            // Etiqueta de configuración para eliminar la configuración de mostrar consultas verdaderas
            const configTagRemove = 'config:enablesecurity:true'
            // Eliminar la etiqueta de configuración para mostrar consultas verdaderas (si existe)
            player.removeTag(configTagRemove);
            // Agregar la etiqueta de configuración para mostrar consultas falsas
            player.addTag(configTag)
        } else {
            // Si el segundo fragmento no es ni "true" ni "false", se establece como verdadero por defecto
            const result = player.getTags().filter(filter => filter.startsWith('config:enablesecurity:'));
            if (result.length) {
                return `§eEnable Security ${result[0].replace('config:enablesecurity:', '')}`
            } else {
                return `§eEnable Security false`
            }
        }
        // Obtener las etiquetas del jugador y filtrar aquellas que comiencen con 'config:enablesecurity:'
        const result = player.getTags().filter(filter => filter.startsWith('config:enablesecurity:'))
        // Devolver un mensaje indicando la configuración actual de mostrar consultas
        return `§eEnable Security ${result[0].replace('config:enablesecurity:', '')}`
    } else {
        const result = player.getTags().filter(filter => filter.startsWith('config:enablesecurity:'));
        if (result.length) {
            return `§eEnable Security ${result[0].replace('config:enablesecurity:', '')}`
        } else {
            return `§eEnable Security false`
        }
    }
}


/**
 * Obtiene la configuracion del primer usuario desde la configuracion del servidor de backups
 * @returns {Promise<User>}
 */
const getRootUser = async () => {
    const req = new HttpRequest('http://localhost:3000/api/security/config');

    req.method = HttpRequestMethod.Get;

    req.headers = [
        new HttpHeader('Content-Type', 'application/json'),
    ];

    const response = await http.request(req);

    shell.log(response.body);
    return JSON.parse(response.body);
}