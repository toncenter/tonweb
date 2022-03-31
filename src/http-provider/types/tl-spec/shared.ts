
export type Int32 = number;
export type Int53 = number;
export type Int64 = string;
export type Bytes = string;
export type Bool = boolean;
export type Ok = {}; // TODO: Check if it is right.
export type Hashtag = number;
export type Vector<T> = T[];

/**
 * Appends TL specification function or constructor name property.
 */
export interface WithType<T extends string> {
    '@type': T;
}
