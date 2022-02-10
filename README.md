# [Eleventy](https://www.11ty.dev) + [HAST](https://github.com/syntax-tree/hast) + [JSX](https://github.com/facebook/jsx)

This package adds a `.jsx` template engine to Eleventy that lets you use JSX to construct HTML pages.

## Getting Started

If you aren’t familiar with Eleventy, check out [their getting started guide](https://www.11ty.dev/docs/getting-started/) and come back here once you’ve got a site going.

First, add `eleventy-hast-jsx` as a dependency:

```shellsession
$ npm install --save-dev eleventy-hast-jsx
```

Next, add its plugin to your `.eleventy.js` file:

```js
module.exports = (eleventyConfig) => {
  // ...
  eleventyConfig.addPlugin(require("eleventy-hast-jsx").plugin);
  // ...
};
```

Next, create a new page or layout with the `.jsx` extension:

```js
// hello-world.jsx

// this is required to use JSX syntax
const { createElement } = require("eleventy-hast-jsx");

exports.default = (data) => <h1>Hello, world!</h1>;
```

## API

### `plugin`

An Eleventy plugin function. Check out [Eleventy’s docs](https://www.11ty.dev/docs/plugins/#adding-a-plugin) for more information on adding a plugin. The plugin takes three optional options:

- `babelOptions`: Babel is used to transform your `.jsx` files when they are `require()`d. By default, only the JSX transform is enabled. Pass any additional Babel options you want!
  - By default, any `plugins` you pass will be run after the hardcoded JSX transform that this package does. Passing `overridePlugins: true` in `babelOptions` will replace the default plugin list with your custom plugins.
- `htmlOptions`: Options passed to [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html#api) to convert your JSX code into an HTML string. By default, this is just `allowDangerousHtml: true` (to allow the `Raw` tag described below to work).
- `componentsDir`: The directory the `component` shortcode (see docs below) should look for components in. Defaults to `_components`.

### `createElement`

This function has an identical signature to [`React.createElement`](https://reactjs.org/docs/react-api.html#createelement).

The following kinds of tags are supported:

- Passing a string as the tag name (such as by using a lowercase tag name in JSX like `<div />`) delegates to [`hastscript`](https://github.com/syntax-tree/hastscript)
- Passing a function as the tag name (such as by defining a function with a `PascalCase` name and using it like `<MyComponent />`) will call the function with the props object and return its result. Children are available as the `children` prop.
- Passing the special value `createElement.Fragment` returns an array of the children passed. You can also use the JSX syntax `<>...</>` to create a fragment.

You can use either HTML-style (e.g. `class`, `for`, ...) or DOM-style (`className`, `htmlFor`, ...) props on HTML elements. For custom components, props are passed as-is (except for the inclusion of the `children` array)

Children are processed to behave more like React JSX. The `children` prop will _always_ be an array (even if 1 or 0 children were passed). Sub-arrays will be flattened recursively (up to depth 20, please file an issue or re-evaluate your life choices if you need more). String and number values will be converted to a `text` node. Like React’s version, `createElement` [skips booleans, null, and undefined children](https://reactjs.org/docs/jsx-in-depth.html#booleans-null-and-undefined-are-ignored). All other values are passed through as-is. This processing is applied to all children, including HTML elements, fragments, and custom components.

Unlike `React.createElement`, which simply constructs a tree of plain objects to be processed by React later on, this `createElement` function will call your custom component immediately and return whatever it returns. Since the `createElement` function does not process component return values in any way, you don’t have to return a valid hast node from the component — you could even return a Promise to make an async component:

```jsx
const { createElement } = require("eleventy-hast-jsx");
const fetch = require("node-fetch");

async function FetchData(url) {
  const posts = await (await fetch(url)).json();
  return posts.map(({ title, url }) => <a href={url}>{title}</a>);
}

exports.default = async ({ dataSource }) => (
  <main>
    <h1>Data</h1>
    {await (<FetchData source={dataSource} />)}
  </main>
);
```

You _must_ manually import `createElement` to use JSX at this point, as support for the new JSX transform (which handles imports automatically) will have to wait until `@babel/register` and Eleventy fully support ES Modules.

### `Raw`

The `Raw` component allows you to inject raw HTML strings into the output. This is useful for layouts (which are always provided template content as a string), or if `hast` does not allow you the flexibility you require for some horrifying abuse of HTML syntax. Unlike React, there is no globally available `dangerouslySetInnerHTML` prop. (see the safety and security section below).

```jsx
const { createElement, Raw } = require("eleventy-hast-jsx");

<Raw html='<?php echo "Where did I go wrong?" ?>' />;
<Raw html={templateContent} />;
```

Of course, you could also just make the `raw` node yourself:

```jsx
<article>{{ type: "raw", content: "HTML goes here!" }}</article>
```

### `DOCTYPE`

The `DOCTYPE` component injects `<!DOCTYPE html>` into the output. This is useful for top-level layouts!

```jsx
const { createElement, Raw, DOCTYPE } = require("eleventy-hast-jsx");
module.exports = ({ templateContent }) => (
  <>
    <DOCTYPE />
    <html>
      <body>
        <Raw html={templateContent} />
      </body>
    </html>
  </>
);
```

### `Comment`

The `DOCTYPE` component produces an HTML comment (`<!-- like this -->`). Note that the leading and trailing spaces are not inserted by default (i.e. `<!--comment-->`) so you’ll need to include them in the child yourself if you want them.

```jsx
const { createElement, Comment } = require("eleventy-hast-jsx");

<Comment>This is a comment</Comment>;
```

### `component` Shortcode

If you want to integrate your components into one of the built-in template languages, use the `component` shortcode. (For the JSX language, import and use the component manually.) The shortcode produces a plain HTML string.

#### Nunjucks (preferred)

```nunjucks
{% component "Foo" name="name" age=42 %}
```

Of all the languages, the Nunjucks syntax lets us best represent the component. The first parameter is the path to the component, relative to `componentsDir`. Export your component from the component file by assigning it to either `module.exports` or `module.exports.default`.

The named parameters passed to the shortcode will be turned into props. You can make your component an `async` function, as its result will be awaited before being converted to an HTML string.

#### Liquid

```liquid
{% component "Foo" "name" 42 %}
```

The first parameter is the path to the component, relative to `componentsDir`. Export your component from the component file by assigning it to either `module.exports` or `module.exports.default`.

Liquid doesn’t support named parameters like Nunjucks, so the component will instead receive two props:

- `arg` will be the first parameter you pass (`"name"` in the example above)
- `args` will be an array containing all passed parameters (`["name", 42]` in the example above)
- In addition, if you pass only one value, and that value is an object, all of its keys will be available as props. (for example, doing `{% component "Example" page %}` will have the various keys of `page` (`date`, `fileSlug`, …) available as props inside of `Example`.)

You can make your component an `async` function, as its result will be awaited before being converted to an HTML string.

### Handlebars

```hbs
{{{component "Foo" "name" 42}}}
```

Make sure you use the triple-stache (`{{{` `}}}`) syntax so the HTML produced by the shortcode doesn’t get escaped.

The first parameter is the path to the component, relative to `componentsDir`. Export your component from the component file by assigning it to either `module.exports` or `module.exports.default`.

Handlebars doesn’t support named parameters like Nunjucks does, so the component will instead receive two props:

- `arg` will be the first parameter you pass (`"name"` in the example above)
- `args` will be an array containing all passed parameters (`["name", 42]` in the example above)
- In addition, if you pass only one value, and that value is an object, all of its keys will be available as props. (for example, doing `{% component "Example" page %}` will have the various keys of `page` (`date`, `fileSlug`, …) available as props inside of `Example`.)

You **must not** make your component an `async` function, since Handlebars doesn’t support async shortcodes.

### 11ty.js (JavaScript)

```js
await this.component("Foo", { name: "name", age: 42 });
```

The first parameter is the path to the component, relative to `componentsDir`. Export your component from the component file by assigning it to either `module.exports` or `module.exports.default`.

Pass a props object as the second parameter. You can make your component an `async` function, as its result will be awaited before being converted to an HTML string. The shortcode will always be async, regardless of whether or not the component is.

## Template files

Template files must be CommonJS modules, with either one or two exports:

### `default`

`exports.default` is required, and must be a function. It will be passed the merged data from the [data cascade](https://www.11ty.dev/docs/data-cascade/) as props, and should return a hast node (or an array of such nodes).

```jsx
const { createElement } = require("eleventy-hast-jsx");

exports.default = ({ name }) => <h1>Hello, {name}!</h1>;
```

The exported function can also be `async` or return a `Promise`, which greatly expands what you can do…

```jsx
const { createElement } = require("eleventy-hast-jsx");

exports.default = async ({ title, someMarkdown }) => {
  const remark = (await import("unified"))
    .unified()
    .use((await import("remark-parse")).default)
    .use((await import("remark-rehype")).default);

  return (
    <article>
      <h1>{title}</h1>
      {/* convert the markdown into hast using rehype, then embed it */}
      {(await remark.run(remark.parse(someMarkdown))).children}
    </article>
  );
};
```

### `data`

`exports.data` is optional, and provides data for the current page (just like [front matter](https://www.11ty.dev/docs/data-frontmatter/) does). Front matter is supported in `.jsx` files too, but `exports.data` is offered as an alternative because most editors will not understand a front matter block in a JavaScript file. It behaves just like a JS front matter block in any other template language.

`eleventy-hast-jsx` does not offer the feature where permalinks are run through the current template engine, since that doesn’t make much sense for JS-based code. Instead, pass a function as the value for `permalink` if you need a custom permalink. The function will be called with the merged data cascade (like [in the built-in JS template language](https://www.11ty.dev/docs/languages/javascript/#permalinks), but without support for filters/shortcodes at this point).

```jsx
exports.data = {
  layout: "page.jsx",
};
```

## Code reuse in templates

Code can be reused via Eleventy’s built-in layout mechanisms, or by creating components (which have a similar signature to React function components):

```jsx
// _components/Icon.jsx
const { createElement } = require("eleventy-hast-jsx");

function Icon({ name, size = 24 }) {
  return (
    <svg class="icon" width={size} height={size}>
      <use href={`/assets/icons.svg#${name}`} />
    </svg>
  );
}

module.exports = Icon;

// some-page.jsx
const { createElement } = require("eleventy-hast-jsx");
const Icon = require("../_components/Icon");

exports.default = () => <Icon name="star" />;
```

## Safety and Security

As long as all untrusted input is cast to a string, `eleventy-hast-jsx` should be safe. Strings will be escaped by `hast-util-to-html` (although, of course, `<Raw html={...} />` is exempt from this). However, `eleventy-hast-jsx` is intentionally designed to interpret _objects_ as HTML. This significantly increases the flexibility of components, since JSX expressions simply create hast nodes. However, if your untrusted user input could consist of arbitrary objects, you’ll need to ensure that it is serialized to a string before being passed into a JSX expression.

You could use a package from the excellent unified collective (such as [`hast-util-sanitize`](https://unifiedjs.com/explore/package/hast-util-sanitize/)) to process any user-supplied values before putting them in a component.

One feature that has not yet been implemented is null/undefined checking. While it would be possible to check for and throw when attempting to render `null` or `undefined` — which is exactly what an earlier version of this plugin did — I found that it makes JSX conditionals (i.e. `{x && <div />}`) very annoying to write since you must do `{x ? <div //> : ""}` or similar. If I find a solution that allows conditionals to work properly while checking against directly-provided values (such as `{foo}`) being null, I hope to implement that as an optional feature.
