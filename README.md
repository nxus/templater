# Templater
The template manager for Nxus applications

## Usage

### Register a Template

```
app.get('templater').provide('template', 'default', 'ejs', 'path/to/some/file')
```

### Render content using a Template

```
let opts = {content: "some content"}

app.get('templater').request('render', 'default', opts).then((content) => {
  console.log('rendered content', content)
})
```
