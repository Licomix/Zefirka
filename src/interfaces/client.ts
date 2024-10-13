import { Client } from 'discord.js';
import { Kazagumo } from 'kazagumo';


export interface CustomClient extends Client {
    kazagumo?: Kazagumo;
}