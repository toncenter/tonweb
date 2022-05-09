
# Contributing Guide

## Compatibility

The following platforms must be supported:

- `node.js` >= 15
- `browsers` (ES6)
- `web-workers`/`service-workers` (ES6)

In order to support web-workers, `self` keyword should
be used instead of `window` everywhere.


## Tests

### Multi-package testing

All the tests are written to import testable symbols
from the `__tonweb__` virtual package:

```typescript
import TonWeb from '__tonweb__';
```

This effectively allows us to execute current tests for
arbitrary version of the library. By default, the tests are
executed for the code located in the current working directory.
However, you can easily run tests for e.g. vanilla version
of the library.

To do this, just install the version of the library
you would like to test:

```shell
npm i -D tonweb@<version>
```

Then run `npm run test:package` or `npm run test:package:coverage`.

We also have an overridden implementation of the Jest's
`describe` and `it` utilities called `$describe` and `$it`
respectively. You can use these augmented utilities to
skip test suite or individual test execution when running in
the `package` test mode:

```typescript
$describe.skipForPackage('my-test-suite', () => {
  // …
});

$it.skipForPackage('my-test', () => {
  // …
});
```

Such skipped tests will still be displayed in the "skipped"
section of the Jest test report.
