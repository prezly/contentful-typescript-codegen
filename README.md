# contentful-typescript-codegen

Generate typings from your Contentful environment.

- Content Types become interfaces.
- Locales (and your default locale) become string types.
- Assets and Rich Text link to Contentful's types.

At Prezly, we use this in our [marketing site] to increase developer confidence and productivity,
ensure that breaking changes to our Content Types don't cause an outage, and because it's neat.

[marketing site]: https://www.prezly.com

## Usage

```sh
npm i -D @prezly/contentful-typescript-codegen
```

Then, add the following to your `package.json`:

```jsonc
{
  // ...
  "scripts": {
    "contentful-typescript-codegen": "contentful-typescript-codegen --output @types/generated/contentful.d.ts"
  }
}
```

Feel free to change the output path to whatever you like.

Next, the codegen will expect you to have created a file called `getContentfulEnvironment.js` in the
root of your project directory, and it should export a promise that resolves with your Contentful
environment.

The reason for this is that you can do whatever you like to set up your Contentful Management
Client. Here's an example:

```js
const contentfulManagement = require("contentful-management")

module.exports = function() {
  const contentfulClient = contentfulManagement.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_API_ACCESS_TOKEN,
  })

  return contentfulClient
    .getSpace(process.env.CONTENTFUL_SPACE_ID)
    .then(space => space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT))
}
```

Optionally, you can add a file called `getContentfulFieldOverrides.js` in the root of your project, which should export two functions:
1. `getImports` which should return an array of import declarations (as strings) required for your overriden types.
2. `getOverridenContentTypes` that returns an object of `OverridenContentTypes` type (see example), which will indicate which fields for which content types should be overriden with the type name you provided.

Example:
```js
function getImports() {
  return [
    "import { SomeLibraryType } from '@some-library';"
  ]
}

function getOverridenContentTypes() {
  return {
    'myContentTypeId': {
      'overridenField': 'SomeLibraryType'
    }
  }
}

module.exports = {
  getImports,
  getOverridenContentTypes,
}
```

### Command line options

```
Usage
  $ contentful-typescript-codegen --output <file> <options>

Options
  --output,      -o  Where to write to
  --poll,        -p  Continuously refresh types
  --interval N,  -i  The interval in seconds at which to poll (defaults to 15)
```

## Example output

Here's an idea of what the output will look like for a Content Type:

```ts
interface BlogPostFields {
  /** Title */
  title: string

  /** Body */
  body: Document

  /** Author link */
  author: Author

  /** Image */
  image: Asset

  /** Published? */
  published: boolean | null

  /** Tags */
  tags: string[]

  /** Blog CTA variant */
  ctaVariant: "new-cta" | "old-cta"
}

/**
 * A blog post.
 */
export interface BlogPost extends Entry<BlogPostFields> {}
```

You can see that a few things are handled for you:

- Documentation comments are automatically generated from Contentful descriptions.
- Links, like `author`, are resolved to other TypeScript interfaces.
- Assets are handled properly.
- Validations on symbols and text fields are expanded to unions.
- Non-required attributes automatically have `| null` appended to their type.
- The output is formatted using **your** Prettier config.
