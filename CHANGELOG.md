# v0.3.0

Breaking changes:

- The [`automatic` JSX runtime (“the new transform”)](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) is now used by default.
  - This means you no longer need to import `createElement` from `eleventy-hast-jsx` in your code to use JSX 🎉
  - There should be no other code changes required, unless you are importing a different `createElement` function. If you’re doing that, you will now need to call your alternate function directly instead of using JSX.
  - If the `automatic` transform doesn’t work for you, please [open an issue](https://github.com/j-f1/eleventy-hast-jsx/issues/new/choose).

New features:

- A new `jsxRuntime: "classic"` option has been added to allow you to switch back to the old behavior.
  - This option is deprecated and will be removed in a future breaking change release. Please migrate to the new transform as soon as possible.
- Eleventy v2.x is provisionally supported (although you will get a warning in your console for now)
  - Expect a patch release in the near future to add official support once Eleventy v2.0.0 stable is released.
  - As a side effect, this plugin now no longer directly imports anything from the `@11ty/eleventy` package!

Other changes:

- `@11ty/eleventy` is now no longer a peer dependency, as this is not the recommended approach for Eleventy plugins.
  - Instead, it calls Eleventy's `versionCheck` function to confirm compatibility.

# v0.2.2

Bug fixes:

- `{% component %}` now uses the same process for loading components that is used to load templates, ensuring that component files aren’t incorrectly cached.

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
