import {
    appendExpressions,
    getChildren
} from "./common-lib.js";

const t = require("babel-types");

const errors = {
    ATTRIBUTES_LENGTH: "IF__ATTRIBUTES_LENGTH",
    INVALID_ATTRIBUTE_NAME: "IF__INVALID_ATTRIBUTE_NAME",
    INVALID_ATTRIBUTE_VALUE: "IF__INVALID_ATTRIBUTE_VALUE",
    CHILD_MUST_BE_JSX_ELEMENT: "IF__CHILD_MUST_BE_JSX_ELEMENT"
};


export default function (path, options) {
    let {node} = path;
    let {attributes} = node.openingElement;

    if (attributes.length != 1)
        throw new Error(errors.ATTRIBUTES_LENGTH);

    let [attribute] = attributes;
    let {name: type} = attribute.name;

    if (type != "true" && type != "false")
        throw new Error(errors.INVALID_ATTRIBUTE_NAME);

    let {value: expressionContainer} = attribute;

    if (!t.isJSXExpressionContainer(expressionContainer))
        throw new Error(errors.INVALID_ATTRIBUTE_VALUE);

    let {expression: conditionExpression} = expressionContainer;

    if (type == "false") {
        conditionExpression = t.unaryExpression("!", conditionExpression);
    }

    let expressions = getChildren(node).map(toExpression, conditionExpression);

    appendExpressions(expressions, path, options);

}

function toExpression(node) {
    if (t.isJSXElement(node)) {
        return t.logicalExpression("&&", this, node);
    }

    if (t.isJSXExpressionContainer(node)) {
        return t.logicalExpression("&&", this, node.expression);
    }

    if (t.isJSXText(node)) {
        return t.logicalExpression("&&", this, t.stringLiteral(node.value));
    }
}
