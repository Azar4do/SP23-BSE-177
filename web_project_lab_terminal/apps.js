const methodOverride = require('method-override');
app.use(methodOverride('_method'));  // This will allow you to use DELETE requests in forms
