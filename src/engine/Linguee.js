import got from 'got';
import iconv from 'iconv-lite';
import { parse } from 'node-html-parser';
import DictionaryEngine from "./DictionaryEngine.js";
import alfy from "alfy";
iconv.skipDecodeWarning = true;
class Linguee extends DictionaryEngine {
    baseUrl = 'https://www.linguee.com'
    engineName = 'Linguee Dictionary'

    constructor(q, to=undefined, from = 'auto', options) {
        super(q, to, from, options);
    }

    requestUrl = () => {
        const query = this.q.replace(/ /g, '+')
        const subUrl = alfy.config.get('linguee')?.value || 'english-french'
        // return `${this.baseUrl}#auto/${this.to}/${query}`
        return `${this.baseUrl}/${subUrl}/search?source=auto&query=${query}`
    }
    parserHTMLPos = (defHTML) => {
        const defRoot = defHTML.closest('div.lemma')
        const defPos = defRoot?.querySelector('h2>span span.tag_wordtype')?.text || ''
        const [pos, ...restPos] = defPos.split(',')
        return pos
    }
    parseHTMLDefinitions = (defHTML) => {
        // const defParse = parse(defHTML)
        const trans_word = defHTML.querySelector('h3 span.tag_trans a')?.text
        const exampleEl = defHTML.querySelector('.example.line')
        const trans_t = exampleEl?.querySelector('.tag_t')?.text
        const example = exampleEl?.querySelector('.tag_s')?.text
        return { def:`${trans_word}` + (trans_t&&` - ${trans_t}`||''), example}
    }
    parseResp = (res) => {
        // https://github.com/taoqf/node-html-parser
        const root = parse(res)
        const definitions = root.querySelectorAll('div#dictionary div.isMainTerm .translation_lines>div.translation')
        const webUrl = this.requestUrl()
        if (!definitions.length) return []
        const topDef = parse(definitions[0])
        const trans_word = topDef.querySelector('h3 span.tag_trans a')?.text
        const translateRow = {
            title: trans_word,
            valid: true,
        }
        const firstRow = {...this.attachModsVars(trans_word, '', webUrl), ...translateRow}
        const definitionRows = this.parseDefinitions(definitions.slice(0,6), this.parseHTMLDefinitions, this.parserHTMLPos)
        return [firstRow, ...definitionRows]
    }

    fetch = async () => {
        const fetchOptions = {
            headers: {
                'Accept': '*/*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36',
                'Accept-Encoding': 'br, gzip, deflate',
                'Referer': 'https://www.google.com/'
            },
        }
        try {
            const res = await got.get(this.requestUrl(), fetchOptions);
            const contentType = res.headers['content-type'];
            const charsetMatch = contentType.match(/charset="(.*)"/);
            const charset = charsetMatch ? charsetMatch[1].toLowerCase() : 'utf-8'
            let decodedBody = res.body
            if(charset !== 'utf-8') decodedBody = iconv.decode(res.body, charset)
            return this.parseResp(decodedBody)

        } catch (error) {
            return this.errorHandler(error);
        }
    }
}

export default Linguee;
// testing
// const gt = new Linguee('address', 'fr')
// const res = gt.fetch()

