import {
    getChildren,
    combineElements,
    appendExpressions
} from "./common-lib.js";

const t = require("babel-types");


export default function (path, options) {
    let {node} = path;

    let propsIdentifier = node.openingElement.attributes.reduce(toPropsIdentifier, t.identifier("props"));

    let params = [propsIdentifier];
    let body = combineElements(getChildren(node), options);

    let arrayFunction = t.arrowFunctionExpression(params, body);

    appendExpressions([arrayFunction], path, options);
}


function toPropsIdentifier(initial, attribute) {
    if (attribute.name.name == "props" && t.isStringLiteral(attribute.value)) {
        return t.identifier(attribute.value.value);
    }

    return initial;
}
