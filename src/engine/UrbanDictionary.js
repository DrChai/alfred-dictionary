import got from 'got';
import { parse } from 'node-html-parser';

import DictionaryEngine from "./DictionaryEngine.js";
class UrbanDictionary extends DictionaryEngine{
    baseUrl = 'https://www.urbandictionary.com/define.php'
    engineName = 'Urban Dictionary'
    constructor(q, to=undefined, from='auto', options) {
        super(q, to, from, options);
    }

    requestUrl = () => {
        const term = this.q.replace(/ /g, '+')
        return `${this.baseUrl}?term=${term}`
    }
    parseResp = (res) => {
        // https://github.com/taoqf/node-html-parser
        const root = parse(res)
        const definitions = root.querySelectorAll('.container div.definition')
        const webUrl = this.requestUrl()
        if (!definitions.length) return []
        const topDef = parse(definitions[0])
        const title = topDef.querySelector('h1')?.text
        const translateRow = {
            title: title,
            valid: true,
        }
        const firstRow = {...this.attachModsVars(title, '', webUrl), ...translateRow}
        const definitionRows = this.parseDefinitions(definitions.slice(0,6), this.parseHTMLDefinitions)
        return [firstRow, ...definitionRows]
    }
    parseHTMLDefinitions = (defHTML) => {
        const defParse = parse(defHTML)
        const def = defParse.querySelector('div.meaning')?.text
        const example = defParse.querySelector('div.example')?.text
        return {def, example}
    }
    fetch = async () => {
        const fetchOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) ' +
                    'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15',
                'Accept-Encoding': 'br, gzip, deflate',
                'Referer': 'https://www.google.com/'
            },
        }
        try {
            const res = await got.get(this.requestUrl(), fetchOptions);
            return this.parseResp(res.body)

        } catch (error) {
            return this.errorHandler(error);
        }
    }
}
export default UrbanDictionary;
// testing
// const gt = new UrbanDictionary('ankle sharking',)
// const res = gt.fetch()