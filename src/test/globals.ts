
import { describe } from '@jest/globals';
import { Global } from '@jest/types';
import { BlockFn, BlockName } from '@jest/types/build/Global';

import { isPackageTest } from './utils';


//==========//
// DESCRIBE //
//==========//

type $Describe = Global.GlobalAdditions['describe'] & {
    skipForPackage: (blockName: BlockName, blockFn: BlockFn) => void;
};

// @ts-ignore
export const $describe: $Describe = (
    (...args) => describe(...args)
);

Object.assign($describe, { ...describe });

$describe.skipForPackage = (blockName: BlockName, blockFn: BlockFn) => (
    (isPackageTest() ? describe.skip : describe)(
        blockName,
        blockFn
    )
);


//====//
// IT //
//====//

type $It = Global.GlobalAdditions['it'] & {
    skipForPackage: (blockName: BlockName, blockFn: BlockFn) => void;
};

// @ts-ignore
export const $it: $It = (
    (...args) => it(...args)
);

Object.assign($it, { ...it });

$it.skipForPackage = (blockName: BlockName, blockFn: BlockFn) => (
    (isPackageTest() ? it.skip : it)(
        blockName,
        blockFn
    )
);
