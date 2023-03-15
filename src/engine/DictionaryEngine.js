export default class DictionaryEngine {
    baseUrl = undefined
    engineName = undefined
    knownPos = {
        'n': 'noun',
        'adj': 'adjective',
        'v': 'verb',
        'adv': 'adverb',
        'perp': 'preposition',
        'conj': 'conjunction',
    }
    constructor(q, to, from='auto', options) {
        this.from = from;
        this.to = to;
        this.q = q
        this.options = options || {
            wEx: true,
            wDef: true
        }
    }
    shortPos = (posAbbr, pos) => {
        const abbr = Object.keys(this.knownPos).find( abbr => pos.startsWith(abbr))
        return posAbbr?`${posAbbr}.` : pos
    }
    parseIcon = (posAbbr, index) => {
        if(posAbbr) return {
            path: `media/${posAbbr}.png`
        }
        return {
            path: `media/idx${index}.png`
        }
    }
    parseDefinitions = (defs, parserDef, parserPos) => {
        return defs.map((defItem, index) => {
            const pos = parserPos&&parserPos(defItem) || ''
            const posAbbr = Object.keys(this.knownPos).find( abbr => pos.startsWith(abbr))
            const {def, example} = parserDef(defItem)
            return  {
                // title: (pos&&`${this.shortPos(posAbbr, pos)} - `||'') + `${def}`,
                title: `${def}`,
                subtitle: example,
                valid: false,
                icon: this.parseIcon(posAbbr, index + 1)
            }
        })
    }
    attachModsVars = (trans, subtitle, webUrl, ttsOut) => {
        const variables = {
            action: 'copy'
        }
        const [ttsSrc, ttsTrans] = ttsOut || []
        const mods = {
            cmd: {
                subtitle: subtitle + ' | ⌘ cmd + ↵ enter: view in browser',
                arg: webUrl,
                variables: {
                    action: 'url'
                },
                icon: {
                    path: `media/display.png`
                }
            },
            ...(ttsSrc&&{
                shift: {
                    subtitle: subtitle + ` | ⇧ shift + ↵ enter: listen "${subtitle}"`,
                    arg: ttsSrc,
                    variables: {
                        action: 'tts'
                    },
                    icon: {
                        path: `media/wave.png`
                    }
                }
            }),
            ...(ttsTrans&&{
                option: {
                    subtitle: subtitle + ` | ⌥ option + ↵ enter: listen "${trans}"`,
                    arg: ttsTrans,
                    variables: {
                        action: 'tts'
                    },
                    icon: {
                        path: `media/wave.png`
                    }
                }
            }),
        }

        const icon = {
            path: `media/clipboard.png`
        }
        return {
            arg: trans,
            valid: true,
            subtitle:  subtitle + ' | ↵: copy to clipboard | ⌘: view in browser | ⇧/⌥: tts',
            variables, mods, icon}
    }
    errorHandler = (error) => {
        const code = error.response?.statusCode
        let title, subtitle
        if(error.code === 'ENOTFOUND' || error.code === 'BAD_NETWORK'){
            title = `You're offline.`
            subtitle =  'check your network.'
        }
        else {
            switch (code) {
                case 403:
                    title= `Failed to authenticate on ${this.engineName}`
                    subtitle = 'api key is invalid or unset.'
                    break
                case 404:
                    title= `No Result on ${this.engineName}`
                    subtitle = 'try to switch to one of other engines by: -set engine'
                    break
                case 503:
                case 429:
                    title= `Reached max limits on ${this.engineName}`
                    subtitle = 'the reset may take up to 24 hours.'
                    break
                default:
                    throw error
            }
        }
        return [{
            title,
            subtitle,
            icon: {
                path: 'media/warning.png'
            }
        }]
    }
}