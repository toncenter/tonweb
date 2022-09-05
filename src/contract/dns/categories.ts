
import { Values } from '../../utils/types';


export const DnsCategories = {
    NextResolver: 'dns_next_resolver',
    Wallet: 'wallet',
    Site: 'site',

} as const;

export type DnsCategory = Values<typeof DnsCategories>;
