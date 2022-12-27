module.exports = {
    name: "page",
    extname: [".js", ".css"],
    bundle: {
        Bundle: require("./bundle"),
        processors: ["less", "scss", "ts", "jsx", "js", "mdx"],
    },
    start: {
        Start: require("./start"),
    },
    template: true,
};
