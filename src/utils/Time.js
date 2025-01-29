async function waitSome(ms = 2000) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { waitSome };
