# Templater
The template manager for Nxus applications

## Usage

### Register a Template
If you would like to register a single template, you can use the template provider and specify a file:

```
app.get('templater').provide('template', 'default', 'ejs', 'path/to/some/file')
```

You can also pass in a handler method instead of a file path. Templater expects that this handler returns a string with the template content, or a Promise that resolves to a string. The handler will be passed in the name of the template requested, as well as any render options specified.

```
var handler = function(name, args) {
  return "<html>.....";
}
app.get('templater').provide('template', 'default', 'ejs', handler)
```

### Registering a Template Directory
Alternatively, you can register a directory. Templater will define a new template for every file in the directory with the specified type extension.

```
app.get('templater').provide('templateDir', 'ejs', 'path/to/some/dir')
```

For example, given the following directory structure:

```
- /templates
  |- my-template.ejs
```
Templater will expose `my-template` as a new template.

### Render content using a Template

```
let opts = {content: "some content"}

app.get('templater').request('render', 'default', opts).then((content) => {
  console.log('rendered content', content)
})
```

### Render a partial using a Template
If you've defined a partial you would like wrapped in another template, use the `renderPartial` request and specify a template in which the partial will be wrapped.

```
app.get('templater').request('renderPartial', 'path/to/my/partial', 'wrapper-template', opts).then((content) => {
  console.log('rendered partial content', content)l
})
```

Alternatively, you can specify a previously defined template as your partial:

```
app.get('templater').request('renderPartial', 'partial-template', 'wrapper-template', opts).then((content) => {
  console.log('rendered partial content', content)l
})
```


