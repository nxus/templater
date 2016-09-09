# nxus-templater

## 

## Templater Module

[![Build Status](https://travis-ci.org/nxus/templater.svg?branch=master)](https://travis-ci.org/nxus/templater)

Templates are markup (html, ejs, etc) that Nxus modules can use to render a UX.  The Templater module provides a common API for defining and accessing templates.  Specifically, you can use partials and templates defined by other modules, meaning you write less code for common components.

### Installation

    > npm install nxus-templater --save

### Parsers

Templater supports EJS and HTML as default template types.  If you'd like to add in additional parsers, check out the renderer documentation.

### Namespacing

All templates share a single namespace, so its a good idea to add a prefix to your template names to avoid conflicts.  For example `mymodule-mytemplate.ejs`.

### Usage

    import {templater} from 'nxus-templater'

#### Register a Template

There are three types of templates you can register.

##### Template File

If you would like to register a single template, you can use the template provider and specify a file:

    templater.template('path/to/some/file.ejs')

Based on the filename, the template will be given the name `file` and rendered using the EJS renderer.

Optionally, you can specify another template to wrap the output (for partial style templates).

    templater.template('path/to/some/file.ejs', 'page')

##### Template Directory

Alternatively, if you have a folder with all your templates, you can add them all using `templateDir`.

For example, given the following directory structure:

    - /templates
      |- my-template.ejs

Templater will expose `my-template` as a new template.

     templater.templateDir('path/to/some/dir/')

Each template will be processed using the `template` function above.  You can also specify a wrapper template.

     templater.templateDir('path/to/some/dir/', 'page')

Alt you can specify a glob pattern to only register certain files:

     templater.templateDir('path/to/some/dir/myname-*.ejs', 'page')

##### Function

You can also pass in a handler method instead of a file path. Templater expects that this handler returns a string with the rendered content, or a Promise that resolves to a string. 

The handler will be passed in the name of the template requested, as well as any render options specified.

    var handler = function(args, name) {
      return "<html>.....";
    }
    templater.templateFunction('default', handler)

#### Render content using a Template

    let opts = {content: "some content"}

    templater.render('default', opts).then((content) => {
      console.log('rendered content', content)
    })

#### Override the template wrapper

If you want to specify a different wrapper template than was originally set, you can add a `template` key to the opts object.

    opts.template = 'new-template'
    templater.render('partial-template', opts).then((content) => {
      console.log('rendered complete content', content)l
    })

#### Render a partial from within a template

In place of EJS' `include` function for rendering sub-templates, you can use the `render` function to use a templater-registered template name within a template:

   &lt;%- render('app-nav\`) %>

or with specific options

   &lt;%- render('app-nav', navItems) %>

#### Provide additional context opts for rendering (scripts, etc)

Modules can provide additional context options to be available to templates. :

    templater.on('renderContext', () => {return {username: 'Steve'}})

The event handler is passed the original template name and args, so if `req` or other is provided it is available to you, or if you want to only provide context for some templates, but you do not need to return the whole modified args:

    templater.on('renderContext', (args, name) => {return {username: args.req ? args.req.user : '' }})

Templater will also fire a template specific event

    templater.on('renderContext.my-template', () => {return {username: 'Steve'}}) 

Values that are arrays are concated rather than overwritten, so that for instance `scripts` can collect script URLs from many modules:

    templater.on('renderContext', () => {return {scripts: ['/url/script.js']}})
    templater.on('renderContext', () => {return {scripts: ['/url/other.js']}})

Will result in `scripts` containing an array with both these values. The list will be filtered to only have unique values, so you can specify scripts in dependency order and not worry if other modules are asking for the same common js files repeatedly. The default set of templates provided by this module include rendering of this `scripts` variable already.

## Templater API

* * *

## Templater

**Extends NxusModule**

Templater provides template registering and rendering, built on top of the renderer

### template

Registers the specified template. By default, the template name will match the file name, and the renderer 
used will be determined by the file extension. For example: `./templates/my-template.ejs` will be registered as 
`my-template` using the EJS rendering engine.

**Parameters**

-   `filename` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the path of the template file to register.
-   `wrapper` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Optionally, the name of another template to use as a wrapper
-   `name` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)](default null)** Optional. Specify a different name to use to register the template file.

### templateDir

Registers all templates in the specified directory.

**Parameters**

-   `dirname` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Either a path or a glob of files to register
-   `wrapper` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Optionally, the name of another template to use as a wrapper
-   `type` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)](default "\*")** Optionally, the specific type of file to register. Defaults to all.

### templateFunction

Register a handler function as a template. The registered function should return either a string or a Promise
that resolves to string containing the template.

**Parameters**

-   `name` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the template.
-   `wrapper` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Optionally, the name of another template to use as a wrapper
-   `handler` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** The handler function to use.

### getTemplate

Returns the specified template if it exists

**Parameters**

-   `name` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the template.

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** A template object, with `type` and `handler` attributes.

### getTemplates

Returns all registered templates

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** An array of template object, with `type` and `handler` attributes.

### render

Render a registered template with arguments

**Parameters**

-   `name` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the template.
-   `args` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)](default {})** Variables to make available to the template

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** The rendered content as a string

## 

## Renderer Module

The rendering framework for Nxus applications.

### Usage

    import {renderer} from 'nxus-templater/modules/renderer'

#### Defining a renderer

    renderer.renderer(type, handler);

Where `type` is usually the filename extension and `handler` returns the rendered text when called with contents to render and an optional `opts` object.

#### Rendering a string

    renderer.render(type, text).then((renderedText) => {console.log(renderedText)});

You can pass an optional arugment `opts` for options to pass to the renderer.

    renderer.render(type, text, {title: 'My Title'}).then((renderedText) => {console.log(renderedText)});

#### Rendering a file

    renderer.renderFile(type, filename).then((renderedText) => {});

You can pass an optional arugment `opts` for options to pass to the renderer.

## Renderer API

* * *

## Renderer

**Extends NxusModule**

Renderer renders different files and content using common rendering engines, like EJS and MarkDown.

### renderer

Provide a renderer for a particular type (file extension)

**Parameters**

-   `type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The type (e.g. 'html') this renderer should handle
-   `handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** Function to receive (content, options) and return rendered content

### render

Request rendered content based on type

**Parameters**

-   `type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The type (e.g. 'html') of the content
-   `content` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The contents to render
-   `opts` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)](default {})** Options for the renderer context

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** The rendered content

### renderFile

Provide a renderer for a particular type (file extension)

**Parameters**

-   `filename` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Path to content to render
-   `opts` **\[[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)](default {})** Options for the renderer context

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** The rendered content
