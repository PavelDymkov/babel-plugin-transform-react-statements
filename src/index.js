import transformIfStatement from "./if-statement.js";
import transformForStatement from "./for-statement.js";
import transformSwitchStatement from "./switch-statement.js";


export default function() {
    return {
        inherits: require("babel-plugin-syntax-jsx"),

        visitor: {
            JSXElement: {
                exit(path, state) {
                    let tagName = getTagName(path);

                    switch (tagName) {
                        case "If":
                            transformIfStatement(path, state.opts);
                            break;

                        case "For":
                            transformForStatement(path, state.opts);
                            break;

                        case "Switch":
                            transformSwitchStatement(path, state.opts);
                            break;
                    }
                }
            }
        }
    };
}

function getTagName(path) {
    let identifier = path.get("openingElement").get("name");

    return identifier.isJSXIdentifier() && identifier.node ? identifier.node.name : null;
}
