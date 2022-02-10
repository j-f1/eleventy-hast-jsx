# v0.2.1

Features:

- Components can now be invoked from any template language (using the `component` shortcode)!

# v0.2.0

Potentially breaking changes:

- The `exports` field has been added to package.json, meaning you can no longer import individual files under `eleventy-hast-jsx/*` (importing `eleventy-hast-jsx` will still work). This gives me the ability to re-arrange source files in the future without it being a breaking change.
- The current file name will no longer be added to error messages produced during rendering a template, since Eleventy does that already.

Features:

- Dynamic permalinks are now correctly supported. I forgot about the [caveat](https://www.11ty.dev/docs/data-computed/) that computed data can’t change the permalink of a page. Instead of putting the `permalink` key in computed data as an earlier version of the README suggested, you can pass a function as the value for a top-level `permalink` key on your template’s exported `data` object. This function otherwise behaves just like `eleventyComputed` values.

# v0.1.0

First version! 🎉
