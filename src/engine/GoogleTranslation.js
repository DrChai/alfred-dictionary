import got from 'got';
import DictionaryEngine from "./DictionaryEngine.js";
import * as fs from 'fs';
import os from 'os'
import alfy from "alfy";
class MixinGoogle extends DictionaryEngine{
    constructor(q, to, from='auto', options) {
        super(q, to, from, options);
    }
    parseSrc = (res) => {
        return res.src
    }

    reverseFetch = async (src) => {
        if(src === this.to && alfy.config.get('fallback-language')?.value) {
            this.to = alfy.config.get('fallback-language').value
            return got.post(this.requestUrl(), this.requestOpts()).json();
        }
        return null
    }
    requestUrl = () => {
        throw new Error('Subclasses should implement this!');
    }

    prepareOut = async (res) => {
        throw new Error('Subclasses should implement this!');
    }
    fetch = async () => {
        const fetchOptions = this.requestOpts()
        try {
            let res = await got.post(this.requestUrl(), fetchOptions).json();
            const src = this.parseSrc(res)
            res = await this.reverseFetch(src) || res
            return this.prepareOut(res)

        } catch (error) {
            return this.errorHandler(error)
        }
    }
}
class GoogleTranslation extends MixinGoogle{
    baseUrl = 'https://translate.google.com'
    engineName = 'Google Translation'
    constructor(q, to, from='auto', options) {
        super(q, to, from, options);
    }
    requestUrl = () => {
        const { wEx, wDef} = this.options
        return [
            `${this.baseUrl}/translate_a/single`,
            '?client=gtx',
            '&dt=rm', // transliteration of source and translated texts
            '&dj=1',  // resp in json
            '&dt=t',  // return sentences
            wDef&&'&dt=md', // definitions of source text, if it's one word
            wEx&&'&dt=ex', // example
        ].join('');
    }
    requestBody = to => {
        const data = {
            sl: this.from,
            tl: to || this.to,
            q: this.q,
        };
        return new URLSearchParams(data).toString();
    }
    parserPos = def => def['pos']
    parserDef = def => {
        const gloss =  def.entry?.[0]?.gloss
        const example =  def.entry?.[0]?.example
        return {
            def: gloss,
            example,
        }
    }
    prepareTTS = async res => {
        const { sentences:[trans,], src} = res
        const ttsParams = (tl, q) => {
          const urlParams = {
              client: 'gtx',
              idx: 0,
              total: 1,
              textlen: q.length,
              q,
              tl,
          }
          return new URLSearchParams(urlParams).toString()
        }
        const ttsSrc = await got(`${this.baseUrl}/translate_tts?${ttsParams(src, this.q)}`).buffer()
        await fs.promises.writeFile(os.tmpdir() + '/alfred-dictionary-source' + ".mp3", ttsSrc);
        const ttsTrans = await got(`${this.baseUrl}/translate_tts?${ttsParams(this.to, trans.trans)}`).buffer()
        await fs.promises.writeFile(os.tmpdir() + '/alfred-dictionary-trans' + ".mp3", ttsTrans);
        return [os.tmpdir() + '/alfred-dictionary-source' + ".mp3", os.tmpdir() + '/alfred-dictionary-trans' + ".mp3"]
    }
    parseResp = (res, ttsOut) => {
        const { sentences, examples: { example } = {}, definitions = []} = res
        const [trans, transLit] = sentences
        const webUrl = `https://translate.google.com/#${this.from}/${this.to}/${this.q}`
        const subtitle = `${trans.orig} ${transLit?.src_translit?' ['+transLit.src_translit+']':""}`
        const translateRow = {
            title: `${trans.trans} ${transLit?.translit?' ['+transLit.translit+']':""}`,
            valid: true,
        }
        const firstRow = {...this.attachModsVars(trans.trans, subtitle, webUrl, ttsOut), ...translateRow}
        const definitionRows = this.parseDefinitions(definitions, this.parserDef, this.parserPos)
        return [firstRow, ...definitionRows]
    }

    requestOpts = () => {
        return {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
            body: this.requestBody()
        }
    }
    prepareOut = async (res) => {
        const ttsOut = await this.prepareTTS(res)
        return this.parseResp(res, ttsOut)
    }
}


class GoogleTranslationAPI extends MixinGoogle {
    baseUrl = 'https://translation.googleapis.com'
    engineName = 'Google Translation API'
    constructor(q, to, from='auto', options) {
        super(q, to, from, options);
    }
    requestUrl = () => {
        return `${this.baseUrl}/language/translate/v2`
    }
    requestBody = to => {
        const data = {
            target: to || this.to,
            q: this.q,
        };
        return data;
    }
    requestOpts = () => {
        return {
            headers: {
                'X-goog-api-key': process.env.googleApiKey || '', // throw error if unset
            },
            json: this.requestBody()
        }
    }
    parseSrc = (res) => {
        return res.data?.translations?.[0].detectedSourceLanguage
    }
    parseResp = (res) => {
        const { data: { translations: [translation,] } = {}, definitions = []} = res
        const {translatedText,} = translation
        const webUrl = `https://translate.google.com/#${this.from}/${this.to}/${this.q}`
        const subtitle = `${this.q}`
        const translateRow = {
            title: `${translatedText}`,
            valid: true,
        }
        const firstRow = {...this.attachModsVars(translatedText, subtitle, webUrl,), ...translateRow}
        return [firstRow]
    }
    prepareOut = async (res) => {
        return this.parseResp(res)
    }

}
export {GoogleTranslationAPI}
export default GoogleTranslation;
// testing
// const gt = new GoogleTranslationAPI('stream', 'zh-CN')
// const res = gt.fetch()
