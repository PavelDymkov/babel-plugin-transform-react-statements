import {
    getChildren,
    wrapElement,
    appendExpressions
} from "./common-lib.js";

const t = require("babel-types");

const errors = {
    ATTRIBUTES_LENGTH: "statement must have only one attribute",
    INVALID_ATTRIBUTE_NAME: "incorrect attribute name",
    INVALID_ATTRIBUTE_VALUE: "incorrect attribute value",
    CHILD_MUST_BE_JSX_ELEMENT: "child must be as JSX Element"
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

    if (expressions.length == 1 && !path.parentPath.isJSXElement()) {
        let {right: element} = expressions[0];

        if (!t.isJSXElement(element)) {
            let wrapper = options.wrapper || "<span />";

            if (wrapper.trim()[0] == "<") {
                expressions = [t.logicalExpression("&&", conditionExpression, wrapElement(element, wrapper))];
            }
        }
    }

    appendExpressions(expressions, path, options);
}

function toExpression(node) {
    let conditionExpression = this;

    if (t.isJSXElement(node)) {
        return t.logicalExpression("&&", conditionExpression, node);
    }

    if (t.isJSXExpressionContainer(node)) {
        return t.logicalExpression("&&", conditionExpression, node.expression);
    }

    if (t.isJSXEmptyExpression(node)) {
        return t.logicalExpression("&&", this, t.nullLiteral());
    }

    if (t.isJSXText(node)) {
        return t.logicalExpression("&&", conditionExpression, t.stringLiteral(node.value));
    }
}
