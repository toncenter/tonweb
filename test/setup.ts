
import { jest } from '@jest/globals';


/**
 * This is executed before each test file.
 */
(async function testsSetup() {

    // Setting global date to the beginning of unix epoch
    // to make all date-related tests deterministic
    (jest.useFakeTimers()
        .setSystemTime(0)
    );

})();
