
import { Cell } from '../boc/cell/cell';
import { Address } from './address';
import { expectCell } from './type-guards';


/**
 * Parses address from the specified cell.
 *
 * @param cell - A cell to parse address from.
 *
 * @throws Error
 * Throws error if specified argument is not a cell or
 * when parsing fails.
 */
export function parseAddressFromCell(
    cell: any

): (Address | null) {

    expectCell(cell);

    return ((cell as Cell).parse()
        .loadAddress()
    );

}
