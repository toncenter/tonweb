
import { Cell } from '../../../boc/cell/cell';


/**
 * Writes current timestamp to the specified signing message,
 * or the placeholder value if the specified `seqno` value
 * is equal to zero.
 */
export function writeTimestampToSigningMessage(
    message: Cell,
    seqno: number
) {

    if (seqno === 0) {
        // message.bits.writeInt(-1, 32);// todo: dont work
        for (let i = 0; i < 32; i++) {
            message.bits.writeBit(1);
        }

    } else {
        // Setting message expiration time to 60 seconds
        // @todo make this configurable
        const messageTtl = 60;
        const date = new Date();
        const timestamp = Math.floor(date.getTime() / 1e3);
        message.bits.writeUint(timestamp + messageTtl, 32);
    }

}
