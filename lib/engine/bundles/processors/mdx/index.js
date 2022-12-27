module.exports = {
    name: "mdx",
    Dependencies: require("./dependencies"),
    sources: {
        extname: ".mdx",
    },
    packager: {
        compiler: () => require("./compiler"),
        Js: require("./js"),
    },
};
