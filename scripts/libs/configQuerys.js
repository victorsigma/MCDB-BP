// Importación de la función querySplits desde databaseUtils
import { querySplits } from './databaseUtils'

// Función para manejar la configuración de mostrar consultas
export const showQuerys = (query, player) => {
    // Dividir la consulta en partes
    const querySplit = querySplits(query);
    
    // Verificar si la consulta se dividió correctamente y tiene al menos dos partes
    if(querySplit.length >= 2) {
        // Verificar si el segundo fragmento es "true"
        if(querySplit[1] == "true") {
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
        if(result.length) {
            return `§eShow Query ${result[0].replace('config:showquery:', '')}`
        }
        // Si no hay etiquetas de configuración de mostrar consultas, devolver el estado predeterminado (true)
        return `§eShow Query true`
    }
}

// Función para verificar si una cadena es un JSON válido
export const isJSON = (output) => {
    try {
        JSON.parse(output);
        return true; // La cadena es un JSON válido
    } catch (error) {
        return false; // La cadena no es un JSON válido
    }
}