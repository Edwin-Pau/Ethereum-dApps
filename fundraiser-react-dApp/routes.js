const routes = require('next-routes')()

// Add a wildcard URL to handle viewing existing fundraisers
// If the user goes to the first argument, show the second argument.
routes.add('/fundraisers/:address', '/fundraisers/display')

module.exports = routes;