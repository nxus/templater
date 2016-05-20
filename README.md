# nxus-templater

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

There are three types of templates you can register.

##### Template File

If you would like to register a single template, you can use the template provider and specify a file:

    app.get('templater').template('path/to/some/file.ejs')

Based on the filename, the template will be given the name `file` and rendered using the EJS renderer.

Optionally, you can specify another template to wrap the output (for partial style templates).

    app.get('templater').template('path/to/some/file.ejs', 'page')

##### Template Directory

Alternatively, if you have a folder with all your templates, you can add them all using `templateDir`.

For example, given the following directory structure:

    - /templates
      |- my-template.ejs

Templater will expose `my-template` as a new template.

     app.get('templater').template('path/to/some/dir/')

Each template will be processed using the `template` function above.  You can also specify a wrapper template.

     app.get('templater').template('path/to/some/dir/', 'page')

##### Function

You can also pass in a handler method instead of a file path. Templater expects that this handler returns a string with the rendered content, or a Promise that resolves to a string. 

The handler will be passed in the name of the template requested, as well as any render options specified.

    var handler = function(args, name) {
      return "<html>.....";
    }
    app.get('templater').template('default', handler)

#### Render content using a Template

    let opts = {content: "some content"}

    app.get('templater').render('default', opts).then((content) => {
      console.log('rendered content', content)
    })

#### Override the template wrapper

If you want to specify a different wrapper template than was originally set, you can add a `template` key to the opts object.

    opts.template = 'new-template'
    app.get('templater').render('partial-template', opts).then((content) => {
      console.log('rendered complete content', content)l
    })

#### Render a partial from within a template

In place of EJS' `include` function for rendering sub-templates, you can use the `render` function to use a templater-registered template name within a template:

   &lt;%- render('app-nav\`) %>

or with specific options

   &lt;%- render('app-nav', navItems) %>

#### Provide additional context opts for rendering (scripts, etc)

Modules can provide additional context options to be available to templates. :

    app.get('templater').on('renderContext', () => {return {username: 'Steve'}})

The event handler is passed the original template name and args, so if `req` or other is provided it is available to you, or if you want to only provide context for some templates, but you do not need to return the whole modified args:

    app.get('templater').on('templateContext', (args, name) => {return {username: args.req ? args.req.user : '' }})

Templater will also fire a template specific event

    app.get('templater').on('renderContext.my-template', () => {return {username: 'Steve'}}) 

Values that are arrays are concated rather than overwritten, so that for instance `scripts` can collect script URLs from many modules:

    app.get('templater').on('renderContext', () => {return {scripts: ['/url/script.js']}})
    app.get('templater').on('renderContext', () => {return {scripts: ['/url/other.js']}})

Will result in `scripts` containing an array with both these values. The list will be filtered to only have unique values, so you can specify scripts in dependency order and not worry if other modules are asking for the same common js files repeatedly. The default set of templates provided by this module include rendering of this `scripts` variable automatically.

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
