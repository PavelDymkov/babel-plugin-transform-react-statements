import transformIfStatement from "./if-statement.js";
import transformForStatement from "./for-statement.js";
import transformSwitchStatement from "./switch-statement.js";
import transformComponentStatement from "./component-statement.js";

const babel = require("babel-core");

const t = babel.types;
const property = "54e38893-8f41-499b-a023-36ecc34805cc";


function createPlugin(options) {
    return function plugin() {
        return {
            inherits: require("babel-plugin-syntax-jsx"),

            visitor: {
                JSXElement: {
                    enter(path) {
                        let tagName = getTagName(path, options);

                        switch (tagName) {
                            case "For":
                                transformForStatement(path, options);
                                break;

                            case "Switch":
                                transformSwitchStatement(path, options);
                                break;

                            case "Component":
                                transformComponentStatement(path, options);
                        }
                    },

                    exit(path) {
                        let tagName = getTagName(path, options);

                        switch (tagName) {
                            case "If":
                                transformIfStatement(path, options);
                                break;
                        }
                    }
                }
            }
        }
    };
}


export default function() {
    return {
        inherits: require("babel-plugin-syntax-jsx"),

        visitor: {
            JSXElement: function (path, state) {
                if (checkTransformComplete(path))
                    return;

                let source = path.getSource();
                let plugin = createPlugin(state.opts);
                let {ast} = babel.transform(source, { plugins: [plugin] });
                let [{expression: element}] = ast.program.body;

                path.replaceWith(element);
                path.setData(property, true);
            }
        }
    };
}


function getTagName({node: element}, {disabled, rename}) {
    let {name} = element.openingElement.name;

    if (Array.isArray(disabled) && disabled.some(item => item == name))
        return null;

    for (let originName in rename) {
        let alias = rename[originName];

        if (alias == name)
            return originName;
    }

    return name;
}

function checkTransformComplete(path) {
    if (path.getData(property))
        return true;

    let {parentPath} = path;

    return parentPath ? checkTransformComplete(parentPath) : false;
}
