# `bundle-loader`

The purpose of this package is to load a bundle from the module `@beyond-js/playground/test`. This module may throw an
exception, and the main goal of using this package is to trace the error path and validate the associated sourcemaps.

## How to use the bundle-loader package

Follow these steps to run the use case:

### Step 1: Start the development server

-   Open the terminal. Navigate to the `./package` folder.
-   Run the following command: beyond run.

### Step 2: Run the use case

-   Open another terminal, making sure you are at the project's root. Go to the `./package` folder.
-   Execute the following command: node --enable-source-maps ../index.js.

With these steps, the bundle-loader package will handle loading the bundle from the @beyond-js/playground/test module,
and if any exception occurs, you will be able to trace the error origin and validate the sourcemaps to facilitate
debugging.
