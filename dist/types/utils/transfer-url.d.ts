export interface ParsedTransferUrl {
    address: string;
    amount?: string;
    text?: string;
}
/**
 * Parses the specified TON-transfer URL into its individual
 * parts, throws error if URL format is invalid.
 */
export declare function parseTransferUrl(url: string): ParsedTransferUrl;
/**
 * Formats TON transfer URL from the specified individual parts.
 *
 * @todo: pass all the parts as a single argument of `ParsedTransferUrl` type
 */
export declare function formatTransferUrl(address: string, amount?: string, text?: string): string;
