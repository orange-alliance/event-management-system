# FTC Event Management System
The FTC Event Management System is a suite of programs and applications that work together
to provide a comprehensive event experience for it's staff, volunteers, and audience members.

## Project List
FTC EMS consists of 7 different programs:
1. [ems-core](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-core) (Core desktop application)
2. [ems-api](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-api) (REST API for communication with local database)
3. [ems-web](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-web) (Web server for routing applications)
4. [ems-socket](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-socket) (Real-time connection interfacing)
5. [audience-display](https://github.com/orange-alliance/FTC-EMS/tree/master/audience-display) (Web application to display scoring and match results)
6. [pit-display](https://github.com/orange-alliance/FTC-EMS/tree/master/pit-display) (Web application to display rankings)
7. [ref-tablet](https://github.com/orange-alliance/FTC-EMS/tree/master/audience-display) (Web application for referee scoring)

Details on each program can be found within their prospective sub-folders within this
repository.  

# Project Setup
Once cloned, the proper module dependencies must be installed. Each sub-folder is treated as it's own project/repository.
In order to cope with this, an `npm install` must be ran in each separate program before you run them.

## Using various build tools with EMS
Before running any staging or production builds, run an `npm install` at the root directory of EMS. This will install gulp.js and 
various other dependencies for the build process. However, it is recommended that you do a global install of the following modules:
1. `npm install -g pm2`
2. `npm install -g gulp-cli`

## Using gulp.js with EMS
After globally installing the `gulp-cli`, the following are some of the tasks associated with the EMS build process:
* `gulp update-env[:prod]` - Updates environment variables for all sub-projects based upon the `ecosystem.config.js` module.
This file can also be used with pm2, but that's later. An `update-env:prod` will create a config for environment variables, while a 
`update-env` will update environment variables for development.
* `gulp prebuild[:prod]` - Executes the prebuild process. Right now, this is equivalent to `gulp update-env[:prod]`
* `gulp postbuild` - Executes the postbuild process which moves all `build/` folders to the root EMS `build/ems` folder for packaging.
This should also create an `app.asar` file for deployment with electron.

## Using the complete, automated build process
In conjunction with gulp.js, the build process is completely automated through the use of npm. To run the full build process,
execute `npm run build` from within the root directory of EMS.

# Program Shortcuts
All programs within the EMS suite can be accessed or started through their 
prospective package.json scripts, or by an abbreviated version in this project's
root. The following are the programs and their shortcuts:

## [ems-core](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-core)
1. To start the entire application use ```npm run ems```

*Note: Only one instance of either of the commands can be running. Concurrently
will kill the other process. If you would like to reload an instance, use pm2.*

## [ems-api](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-api)
1. To start the api server use ```npm run api```

## [ems-web](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-web)
1. To start the web server use ```npm run web```

## [ems-socket](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-socket)
1. To start the socket service use ```npm run socket```

## [audience-display](https://github.com/orange-alliance/FTC-EMS/tree/master/audience-display)
1. To start the audience display use ```npm run audience```

## [pit-display](https://github.com/orange-alliance/FTC-EMS/tree/master/pit-display)
Not yet implemented.

## [ref-tablet](https://github.com/orange-alliance/FTC-EMS/tree/master/ref-tablet)
1. To start the ref-tablet use ```npm run ref```

# Using pm2 With EMS
In addition to the program shortcuts listed above, pm2 is a module that is designed for production-level process management.
The process manager can only be fully utilized by installing it globally via ```npm install -g pm2```.

FTC-EMS already comes with a process configuration that is pm2-friendly. To use the prebuilt
configuration, use ```pm2 start ecosystem.config.js``` from the project root. 

This will spawn the [ems-socket](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-socket), [ems-api](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-api),
and [ems-web](https://github.com/orange-alliance/FTC-EMS/tree/master/ems-web).
web server. For production environment variables, use `pm2 start ecosystem.config.js --env production`. Use ```pm2 help``` for a list of commands and options.