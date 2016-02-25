# @nxus/templater

## 

[![Build Status](https://travis-ci.org/nxus/templater.svg?branch=master)](https://travis-ci.org/nxus/templater)

Templates are markup (html, ejs, etc) that Nxus modules can use to render a UX.  The Templater module provides a common API for defining and accessing templates.  Specifically, you can use partials and templates defined by other modules, meaning you write less code for common components.

### Installation

    > npm install @nxus/templater --save

### Parsers

Templater supports EJS and HTML as default template types.  If you'd like to add in additional parsers, check out the @nxus/renderer documentation.

### Namespacing

All templates share a single namespace, so its a good idea to add a prefix to your template names to avoid conflicts.  For example `mymodule-mytemplate`.

### Usage

#### Register a Template

If you would like to register a single template, you can use the template provider and specify a file:

    app.get('templater').template('default', 'ejs', 'path/to/some/file')

You can also pass in a handler method instead of a file path. Templater expects that this handler returns a string with the template content, or a Promise that resolves to a string. The handler will be passed in the name of the template requested, as well as any render options specified.

    var handler = function(name, args) {
      return "<html>.....";
    }
    app.get('templater').template('default', 'ejs', handler)

#### Registering a Template Directory

Alternatively, you can register a directory. Templater will define a new template for every file in the directory with the specified type extension.

    app.get('templater').templateDir('ejs', 'path/to/some/dir')

For example, given the following directory structure:

    - /templates
      |- my-template.ejs

Templater will expose `my-template` as a new template.

Alternatively, you can supply a third argument that will be used to namespace the templates.

    app.get('templater').templateDir('ejs', 'path/to/some/dir', 'custom')

For example, given the following directory structure:

    - /templates
      |- my-template.ejs

Templater will expose `custom-my-template` as a new template.

#### Render content using a Template

    let opts = {content: "some content"}

    app.get('templater').render('default', opts).then((content) => {
      console.log('rendered content', content)
    })

#### Render a partial using a Template

If you've defined a partial you would like wrapped in another template, use the `renderPartial` request and specify a template in which the partial will be wrapped.

    app.get('templater').renderPartial('path/to/my/partial', 'wrapper-template', opts).then((content) => {
      console.log('rendered partial content', content)l
    })

Alternatively, you can specify a previously defined template as your partial:

    app.get('templater').renderPartial('partial-template', 'wrapper-template', opts).then((content) => {
      console.log('rendered partial content', content)l
    })

## API

* * *

## Templater

Templater provides a template layer, built on top of the Nxus Renderer

### getTemplate

Returns the specified template if it exists

**Parameters**

-   `name` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the template.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** A template object, with `type` and `handler` attributes.

### getTemplates

Returns all registered templates

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** An array of template object, with `type` and `handler` attributes.

### render

Renders a template

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the registered template to render
-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)=(default {})** The arguments to pass to the template

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** A promise for the rendered content

### renderPartial

Renders the specified template as a partial, rendering the content in a parent template.

**Parameters**

-   `partial` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Either a template name or a path to a partial file
-   `filePath`  
-   `baseName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The parent template to use to render the partial
-   `args` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)=(default {})** The arguments to pass to the partial and the template for rendering

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** A promise for the rendered content.

### template

Define a new template

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A name for the template
-   `type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Templating engine used with the template. Should map to an installed `@nxus/renderer` type.
-   `handler` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)\|[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function))** Either a filepath or a callback function which returns a promise that resolves to rendered content.

### templateDir

Convenience function to crawl a directory and register all matching files as a template.

**Parameters**

-   `type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** File extension of files to import as templates
-   `dir` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The directory to crawl
-   `namespace` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)=(default "")** An optional namespace to append to the front of the template name
