import alfy from 'alfy';
import cmd from './src/cmd/index.js'

const out = await cmd(alfy.input)
alfy.output(out);
