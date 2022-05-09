
export function isPackageTest() {
    return Boolean(process.env.TEST_PACKAGE);
}
