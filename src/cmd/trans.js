import translate from "../engine/index.js";
import alfy from "alfy";

const cmd = async (input, to) => {
    const configTo = alfy.config.get('primary-language')?.value
    const output = await translate(input, to || configTo, )

    const translateUrl = `https://translate.google.com/#auto/${to}/${input}`
    // output.push({
    //     title: res.text,
    //     subtitle: messages.join(' | '),
    //     valid: true,
    //     arg: res.text,
    //     variables: {
    //         action: 'copy'
    //     },
    //     quicklookurl: translateUrl,
    //     mods: {
    //         cmd: {
    //             subtitle: messages
    //                 .slice(0, messages.length - 1)
    //                 .concat('Activate this item to open in Google Translate')
    //                 .join(' | '),
    //             arg: translateUrl,
    //             variables: {
    //                 action: 'url'
    //             }
    //         }
    //     }
    // })
    //
    // if (res.from.text.didYouMean) {
    //     output.push({
    //         title: `Did you mean: '${corrected}'`,
    //         autocomplete:
    //             (from ? `from ${from} ` : '') +
    //             (to ? `to ${to} ` : '') +
    //             corrected,
    //         valid: false
    //     })
    // }

    return output
}

export default {
    func: cmd,
    id: '',
    usage: '',
    help: 'language auto detected.',
    autocomplete: ''
}