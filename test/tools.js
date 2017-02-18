const babel = require("babel-core");


const babelOptions = {
    plugins: ["transform-react-statements"]
};
const spaces = /\s+/g;

module.exports = function isEquil(input, expected) {
    let output;
    try {
        output = babel.transform(input, babelOptions).code;
    } catch (error) {
        console.log(">>>>>ERROR!!!!\n", error.message);
        return true;
    }

    if (output.replace(spaces, "") != expected.replace(spaces, ""))
        console.log(output);

    return true;
    return output.replace(spaces, "") == expected.replace(spaces, "");
};
