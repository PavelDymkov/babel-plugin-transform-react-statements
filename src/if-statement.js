const t = require("babel-types");
import {
    getAttributes,
    appendExpressions,
    getChildren
} from "./common-lib.js";


const errors = {
    ATTRIBUTES_LENGTH: "IF__ATTRIBUTES_LENGTH",
    INVALID_ATTRIBUTE_NAME: "IF__INVALID_ATTRIBUTE_NAME",
    INVALID_ATTRIBUTE_VALUE: "IF__INVALID_ATTRIBUTE_VALUE",
    CHILD_MUST_BE_JSX_ELEMENT: "IF__CHILD_MUST_BE_JSX_ELEMENT"
};


export default function (path, options) {
    let attributes = getAttributes(path);

    if (attributes.length != 1)
        throw new Error(errors.ATTRIBUTES_LENGTH);

    let [attribute] = attributes;
    let type = attribute.get("name").node.name;

    if (type != "true" && type != "false")
        throw new Error(errors.INVALID_ATTRIBUTE_NAME);

    let expressionContainer = attribute.get("value");

    if (!t.isJSXExpressionContainer(expressionContainer))
        throw new Error(errors.INVALID_ATTRIBUTE_VALUE);

    let conditionExpression = expressionContainer.get("expression").node;

    if (type == "false") {
        conditionExpression = t.unaryExpression("!", conditionExpression);
    }

    let expressions = getChildren(path).map(toExpression, conditionExpression);

    appendExpressions(expressions, path, options);

}

function toExpression(path) {
    if (path.isJSXElement()) {
        return t.logicalExpression("&&", this, path.node);
    }

    if (path.isJSXExpressionContainer()) {
        return t.logicalExpression("&&", this, path.get("expression").node);
    }

    throw new Error(path.type);
}

function log(...args) {
    console.log(">>>>>>>>>>>>>>>>>>>>>");
    console.log(...args);
}
