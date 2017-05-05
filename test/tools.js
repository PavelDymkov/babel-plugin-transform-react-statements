const babel = require("babel-core");


const babelOptions = {
    plugins: [["transform-react-statements",]]
};
const spaces = /\s+/g;
const defaultOptions = {};

module.exports = function isEquil(input, expected, options) {
    babelOptions.plugins[0][1] = options || defaultOptions;

    let output = babel.transform(input, babelOptions).code;

    return output.replace(spaces, "") == expected.replace(spaces, "");
};
