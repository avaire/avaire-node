'use strict';
process.title = 'AvaIre';

/**
 * AvaIre - A multipurpose Discord bot made for fun
 *
 * @author  Alexis Tan <alexis@sen-dev.com>
 */

// Loads the bootstraping application and prepares it for
// use so the rest of the application can be bootstraped.
const app = require('./application');

// Loads in all of the dependencies that are required
// to run Ava and prepares them for use.
app.bootstrap();

// Registers and prepares the events, jobs and services that Ava uses.
app.register();

// Connects to Discord and make Ava available to everyone.
app.connect();
