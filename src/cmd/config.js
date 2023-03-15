import supportLang from "../utils/index.js";
import  {supportedEngine} from  '../engine/index.js'
import alfy from "alfy";

const configs = {
    'primary-language': {
        title: 'Default language',
        defaultOptName: 'English',
        default: 'en',
    },
    'fallback-language': {
        title: 'Fallback language',
        description: 'using when detected input is same language as your default language',
        defaultOptName: undefined,
        default: undefined,
    },
    'engine': {
        title: 'Dictionary Engine',
        defaultOptName: 'Google Translation',
        default: 'googl',
    },
    'linguee': {
        title: 'Linguee.com Url',
        defaultOptName: undefined,
        default: undefined
    }
}
const getConfigKey = (input, supportDict) => {
    for (const [key, name] of Object.entries(supportDict)) {
        if (name.toLowerCase() === input.toLowerCase() ||
            key.toLowerCase() === input.toLowerCase()
        ) {
            return key;
        }
    }
    return null;
}

const optionParser = (args, availOptionsDict) => {
    const [key, ...value] = args
    const query = value.join(' ')
    const optionVal = Object.keys(availOptionsDict).length? getConfigKey(query, availOptionsDict):query
    const availOptionsDictArray = Object.entries(availOptionsDict)
    const out = alfy.matches(query, availOptionsDictArray,
        (item, input) => {
            const key = item[0].toLowerCase().normalize();
            const name = item[1].toLowerCase().normalize();
            return name.includes(input) || key.includes(input)
        })
        .map(item => ({
            title: item[1],
            subtitle: `Set ${key} to ${item[0]}[${item[1]}]`,
            autocomplete: `-set ${key} ${item[0]}`,
            valid: false,
        }))
    if(!!optionVal) {
        const optionName = availOptionsDict[optionVal]
        const serializedValue = JSON.stringify({...alfy.config.get(key), name: optionName, value: optionVal})
        return [{
            title: `Set ${key} to ${optionVal}[${optionName}]`,
            subtitle: `Current: ${alfy.config.get(key)?.value}[${alfy.config.get(key)?.name}]` +
               (configs[key].description&&` | ${configs[key].description}`||''),
            valid: true,
            arg: JSON.stringify({
                alfredworkflow: {
                    arg: [configs[key].title, `${optionVal}[${optionName}]`],
                    variables: {
                        action: 'config',
                        configKey: key,
                        configValue: serializedValue
                    }
                }
            })
        }]
    }
    else if(!Object.keys(availOptionsDict).length){
        return [{
            title: `${key} options are not available.`,
            subtitle: `See the documentations`,
            // autocomplete: `-set ${key} ${item[0]}`,
            valid: false,
        }]
    }
    return out
}
const argsParser = args => {
    const [key, ...value] = args
    const validKeys = Object.keys(configs)
    const mapper = key => ({
        title: key,
        subtitle: 'Current: ' + `${alfy.config.get(key)?.name}[${alfy.config.get(key)?.value}]` +
            (configs[key].description&&` | ${configs[key].description}`||''),
        valid: false,
        autocomplete: `-set ${key} `
    })
    const availConfigOut = validKeys.map(mapper)
    const out = alfy.matches(key, availConfigOut, 'title')
    if (out.length === 1 && !!value.length) {
        const closedKey = out[0].title
        switch (closedKey){
            case 'primary-language':
            case 'fallback-language':
                return optionParser([closedKey, ...value], supportLang)
            case 'engine':
                return optionParser([closedKey, ...value], supportedEngine)
            case 'linguee':
                return optionParser([closedKey, ...value], {})
        }
    }
    return out.length? out : availConfigOut
}

const cmd = input => {
    const args = input.split(' ').slice(1) // remove first arg:'-set'
    return argsParser(args)
}
export default {
    func: cmd,
    id: '-set ',
    usage: '-set [key] [value]',
    help: 'Update Config with key and value.',
    autocomplete: '-set '
}
