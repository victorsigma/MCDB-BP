import { querySplits } from './databaseUtils'

export const showQuerys = (query, player) => {
    const querySplit = querySplits(query);
    if(querySplit.length >= 2) {
        if(querySplit[1] == "true") {
            const configTag = 'config:showquery:true'
            const configTagRemove = 'config:showquery:false'
            player.removeTag(configTagRemove);
            player.addTag(configTag)
        } else if (querySplit[1] == "false") {
            const configTag = 'config:showquery:false'
            const configTagRemove = 'config:showquery:true'
            player.removeTag(configTagRemove);
            player.addTag(configTag)
        } else {
            const configTag = 'config:showquery:true'
            const configTagRemove = 'config:showquery:false'
            player.removeTag(configTagRemove);
            player.addTag(configTag)
        }
        const result = player.getTags().filter(filter => filter.startsWith('config:showquery:'))
        return `§eShow Query ${result[0].replace('config:showquery:', '')}`
    } else {
        const result = player.getTags().filter(filter => filter.startsWith('config:showquery:'))
        if(result.length) {
            return `§eShow Query ${result[0].replace('config:showquery:', '')}`
        }
        return `§eShow Query true`
    }
}