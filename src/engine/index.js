import alfy from "alfy";

import GoogleTranslation, {GoogleTranslationAPI} from "./GoogleTranslation.js";
import UrbanDictionary from "./UrbanDictionary.js";
import Linguee from "./Linguee.js";

export const supportedEngine = {
    'googl': 'Google Translation',
    'urban': 'Urban Dictionary',
    'linguee': 'Linguee Dictionary(restricted)',
    'googlapi': ' Google Cloud Translation API',
}
export default async(q, to, from, options) => {
    const engine = alfy.config.get('engine')?.value || 'googl';
    switch (engine) {
        case 'urban':
            return new UrbanDictionary(q).fetch();
        case 'linguee':
            return new Linguee(q).fetch()
        case 'googlapi':
            return new GoogleTranslationAPI(q, to).fetch()
        default:
            return new GoogleTranslation(q, to, from, options).fetch();
    }
}
