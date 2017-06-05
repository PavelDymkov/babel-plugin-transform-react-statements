import {
    getChildren,
    combineElements,
    wrapElement,
    appendExpressions
} from "./common-lib.js";

const t = require("babel-types");

const errors = {
    IN_ATTR_MISSING: "\"in\" attribute is missing",
    CHILD_MUST_BE_AN_ELEMENT: "CHILD_MUST_BE_AN_ELEMENT",
    EACH_ATTR_NOT_STRING: "EACH_ATTR_NOT_STRING",
    IN_ATTR_NOT_EXPRESSION: "IN_ATTR_NOT_EXPRESSION",
    COUNTER_ATTR_NOT_STRING: "COUNTER_ATTR_NOT_STRING",
    KEY_ATTR_NOT_STRING: "KEY_ATTR_NOT_STRING"
};


export default function (path, options) {
    let parameters = {
        itemIdentifier: null,
        iterableExpression: null,
        counter: "index",
        keyIs: options.keyIs || null
    };

    let {node} = path;
    let {attributes} = node.openingElement;

    attributes.forEach(setParameters, parameters);

    if (!parameters.iterableExpression)
        throw new Error(errors.IN_ATTR_MISSING);

    let iterableElement = combineElements(getChildren(node), options);

    let itemIdentifier = t.identifier(parameters.itemIdentifier || "value");
    let argNames = [itemIdentifier, t.identifier(parameters.counter)];

    if (t.isJSXElement(iterableElement)) {
        if (parameters.keyIs && iterableElement.openingElement.attributes.every(hasNotKeyAttribure)) {
            let attributeName = t.jSXIdentifier("key");
            let attributeValue = t.memberExpression(itemIdentifier, t.identifier(parameters.keyIs));
            let attribute = t.jSXAttribute(attributeName, t.jSXExpressionContainer(attributeValue));

            iterableElement.openingElement.attributes.push(attribute);
        }

        if (!parameters.itemIdentifier) {
            let {attributes} = iterableElement.openingElement;

            if (!attributes.some(isAlreadyExists, itemIdentifier)) {
                let spread = t.jSXSpreadAttribute(itemIdentifier);

                iterableElement.openingElement.attributes.push(spread);
            }
        }
    }
    else
    if (t.isJSXExpressionContainer(iterableElement)) {
        iterableElement = iterableElement.expression;
    }
    else
    if (t.isJSXEmptyExpression(iterableElement)) {
        iterableElement = t.nullLiteral();
    }
    else
    if (t.isJSXText(iterableElement)) {
        iterableElement = t.stringLiteral(iterableElement.value);
    }

    let returnStatement = t.returnStatement(iterableElement);
    let body = t.blockStatement([returnStatement]);
    let fn = t.functionExpression(null, argNames, body);

    let expressions = [createArrayMapCallExpression(fn, parameters)];

    if (!path.parentPath.isJSXElement()) {
        let wrapper = options.wrapper || "<span />";

        if (wrapper.trim()[0] == "<") {
            let [expression] = expressions;

            expressions = [wrapElement(expression, wrapper)];
        }
    }

    appendExpressions(expressions, path, options);
};


function hasNotKeyAttribure(attribute) {
    return attribute.name.name != "key";
}

function createArrayMapCallExpression(fn, parameters) {
    let callee = "Array.prototype.map.call"
        .split(".")
        .reduce(toMemberExpression);
    let args = [parameters.iterableExpression, fn, t.thisExpression()];

    return t.callExpression(callee, args);

}

function toMemberExpression(expression, item) {
    if (typeof expression == "string") {
        return t.memberExpression(t.identifier(expression), t.identifier(item));
    }

    return t.memberExpression(expression, t.identifier(item));
}

function setParameters(attribute) {
    let {name: attributeName} = attribute.name;

    switch (attributeName) {
        case "each":
            this.itemIdentifier = getItemIdentifier(attribute);
            break;

        case "in":
            this.iterableExpression = getIterableExpression(attribute);
            break;

        case "counter":
            this.counter = getCounterValue(attribute);
            break;

        case "key-is":
            this.keyIs = getKeyValue(attribute);
            break;
    }
}

function getItemIdentifier({value: valueNode}) {
    if (!t.isStringLiteral(valueNode))
        throw new Error(errors.EACH_ATTR_NOT_STRING);

    return valueNode.value;
}

function getIterableExpression({value: valueNode}) {
    if (!t.isJSXExpressionContainer(valueNode))
        throw new Error(errors.IN_ATTR_NOT_EXPRESSION);

    return valueNode.expression;
}

function getCounterValue({value: valueNode}) {
    if (!t.isStringLiteral(valueNode))
        throw new Error(errors.COUNTER_ATTR_NOT_STRING);

    return valueNode.value;
}

function getKeyValue({value: valueNode}) {
    if (!t.isStringLiteral(valueNode))
        throw new Error(errors.KEY_ATTR_NOT_STRING);

    return valueNode.value;
}

function isAlreadyExists(attribute) {
    if (!t.isJSXSpreadAttribute(attribute))
        return false;

    let {argument: identifier} = attribute;

    if (!t.isIdentifier(identifier))
        return false;

    return identifier.name == this.name;
}
