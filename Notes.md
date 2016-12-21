# Notes

## Requirements

Riot compiler could compile and concatenate all tag files together

Could pass in the Store to the main tag, as an opts on mount. Could make use of a Riot mixin as well for Redux

Babel should definitely be in the stack. ES2015+ makes for great code

## Using Pod

Should try just using Pod, along with Uglify JS + and IIFE block around the whole thing. There could be a build script that puts everything together

index.html

```html
<html>
    <title>My application</title>
    <body>
        <main></main>
    </body>
    <!-- Minified external Libraries first (e.g. Riot, Pod), concatenated -->
    <script src="/js/libraries.min.js"></script> 
    <!-- Uglified app code -->
    <script src="/js/app.min.js"></script> 
</html>
```

The last file that's used for `js/app.min.js`

```js
p.define('main', () => {

})
```

## Using Browserify

Use riotify + browserify-incremental, to speed up the build process


## Using rollup.js

Could write things as ES2015 modules