<div align="center">

![BeyondJS The universal meta-framework](https://beyondjs.com/images/beyond-logo.png)

<h3>The meta-framework for universal packages</h3>
</div>
<dl>
  <dt>&nbsp;</dt>
</dl>
<p>
  <a aria-label="License MIT" href="https://opensource.org/licenses/MIT">
    <img  src="https://img.shields.io/static/v1?style=for-the-badge&label=License&message=MIT&color=red">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/beyond">
    <img alt="" src="https://img.shields.io/static/v1?style=for-the-badge&label=Version&message=1.0.11&color=#dcdcdc">
  </a>
  
  <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
  [![All Contributors](https://img.shields.io/badge/all_contributors-13-orange.svg?style=for-the-badge)](#contributors)
  <!-- ALL-CONTRIBUTORS-BADGE:END -->

</p>
<dl>
  <dt>&nbsp;</dt>
</dl>

# Getting started

## Global instalation

```shell
npm i --location=global beyond
```

## Install and create specific project type

```shell
npx @beyond-js/create-project --name [@my-scope/name] [--type type] [--container folderName]
```

### Parameters

-   **--name**: Package name, follows the [NPM standard](https://docs.npmjs.com/cli/v9/using-npm/scope) and can contain a @scope.
-   **--type**: Accept the next values:
    -   `web`: Ready to start a web project that can be distributed on the internet or as a mobile application.
    -   `node`: Ready to distribute as a project to run in a node environment.
    -   `Backend`: Node project that makes available interfaces that could be consumed in real-time with web socket from another node project or a client project.
    -   `Library`: Ideal for creating projects intended to be distributed as NPM packages.
    -   `web-backend`: Generates a web project with a backend distribution.
-   **--container**: you can use it if you want to create your project in a new folder

For more, please follow our documentation at [beyondjs.com](https://beyondjs.com/docs/quick-start).

# Colaborate with us

We are looking for developers who want to help us test the project in all environments. If you work in a javascript environment and you like the idea of using universal javascript like we do, feel free to download it, try it and contact us.

# Semver

BeyondJS is following [Semantic Versioning 2.0](https://semver.org/)

# Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
