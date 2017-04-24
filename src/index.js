import transformIfStatement from "./if-statement.js";
import transformForStatement from "./for-statement.js";
import transformSwitchStatement from "./switch-statement.js";

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
                        let tagName = getTagName(path);

                        switch (tagName) {
                            case "For":
                                transformForStatement(path, options);
                                break;

                            case "Switch":
                                transformSwitchStatement(path, options);
                                break;
                        }
                    },

                    exit(path) {
                        let tagName = getTagName(path);

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


function getTagName(path) {
    let identifier = path.get("openingElement").get("name");

    return identifier.isJSXIdentifier() && identifier.node ? identifier.node.name : null;
}

function checkTransformComplete(path) {
    if (path.getData(property))
        return true;

    let {parentPath} = path;

    return parentPath ? checkTransformComplete(parentPath) : false;
}
