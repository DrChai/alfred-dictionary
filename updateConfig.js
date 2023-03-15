import alfy from 'alfy';
import process from 'node:process'
// alfy.config.set(env.configKey, JSON.parse(env.configValue))
alfy.config.set(process.env.configKey, JSON.parse(process.env.configValue))