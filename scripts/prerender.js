var utils = require('./prerenderUtils');
var requirejs = require('requirejs');
var path = require('path');

//- Root path of project, everything is relative to this, in this example, the script
//- is located one directory beneath the root in a scripts folder
var basepath = path.join(__dirname, '../');

var config = {
  //- Root path of all modules, will need to create a dependency tree starting from here
  moduleRoot: path.join(basepath, 'build/js'),
  //- Path to build profile, need this for requirejs baseUrl and paths configuration
  //- Comment this out and use requirejsConfig below if you do not have a build profile for r.js optimizer
  // buildProfile: path.join(basepath, 'home.build.js'),
  //- Path to the html file, it reads this and appends the prerenderd component into it
  //- and writes back to the same destination
  html: path.join(basepath, 'build/index.html'),
  //- Path to component to prerender
  componentPath: 'js/components/App',
  //- Dom node the component mounts to
  componentMountNodeId: 'root',
  //- This is a module with no external dependencies, sometimes you need to remap cdn modules
  //- to a local module so requirejs does not throw module not found errors
  remapModule: 'js/config',
  //- Modules to have requirejs essentially ignore, it will map them to the above module
  ignoreModules: ['dojo', 'esri', 'dijit']
};

//- Use if there is no build profile present
var requirejsConfig = {
  baseUrl: 'build',
  paths: {
    'js': 'js',
    'vendor': 'vendor',
    'utils': 'js/utils',
    'stores': 'js/stores',
    'actions': 'js/actions',
    'components': 'js/components',
    'alt': 'vendor/alt/dist/alt.min',
    'react': 'vendor/react/react.min',
    'react-dom': 'vendor/react/react-dom.min'
  }
};

//- Read in the build profile and convert to JSON, we will need baseUrl and paths
var buildConfig = config.buildProfile ? utils.getRequireConfig(config.buildProfile) : requirejsConfig;

//- Remap cdn or non-local modules to a local module with no dependencies
//-  to prevent requirejs from trying to load them and breaking
var remap = utils.generateRemap(config.moduleRoot, config.remapModule, config.ignoreModules);

//- Setup so we can require all the files using the applications requirejs config
requirejs.config({
  baseUrl: path.join(basepath, buildConfig.baseUrl),
  paths: buildConfig.paths,
  map: { '*': remap },
  nodeRequire: require
});

//- Get Components and render them to static markup
//- NOTE: If using ES6, if your component is a default export, then below works fine
//- however, if it is not a default export, babel exports it as an object and you need to
//- grab that component from the requirejs call like so: requirejs('components/map').Map or
//- whatever the exports name is, babel > 6 will need .default added for default exports
var appComponent = requirejs(config.componentPath).default;
var appMarkup = utils.generateMarkup(appComponent);

//- Render comopnents into the file
utils.renderToFile(config.html, appMarkup, config.componentMountNodeId);
