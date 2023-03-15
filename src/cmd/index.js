import config from './config.js';
import alfy from "alfy";
import trans from "./trans.js";
const commands = [
    config,
]
const greetingOutput = () => {

    if(!!alfy.config.size) {
        const currentConfig = {
            lang: alfy.config.get('primary-language')?.name,
            engine: alfy.config.get('engine')?.name
        }
        return [{
            title: `Translate [any word] to ${currentConfig.lang}`,
            subtitle: `type \'-\' to view available options | engine: ${currentConfig.engine} `,
            autocomplete: '',
            valid: false
        }]
    }
    return [{
        title: `using -set to configure language first`,
        subtitle: 'type \'-\' to view available options',
        autocomplete: ' -set',
        valid: false
    }]
}
export default async input => {
    const normalized = input.normalize('NFC')
    const allwords = normalized.match(/\p{L}+/gu)
    const isWord = allwords && allwords[0] === normalized.split(' ')[0]
    if (!input) return greetingOutput()
    if(isWord) {
        return await trans.func(normalized)
    }
    const command = commands.find(cmd => input.startsWith(cmd.id))
    if(command) return command.func(input)
    return commands.map(command => ({
        title: command.id,
        subtitle: `${command.help} | Usage: ${command.usage}`,
        autocomplete: command.autocomplete,
        valid: false
    }))
}