const t = require("babel-types");
import {
    getAttributeName,
    getAttributes,
    appendExpressions,
    getChildren,
    getTagName
} from "./common-lib.js";


const errors = {
    IN_ATTR_MISSING: "IN_ATTR_MISSING",
    CHILD_MUST_BE_AN_ELEMENT: "CHILD_MUST_BE_AN_ELEMENT"
};


export default function (path, options) {
    let parameters = {
        itemName: null,
        iterable: null,
        keyIs: null
    };
    let attributes = getAttributes(path);

    attributes.forEach(setParameters, parameters);

    if (!parameters.iterable)
        throw new Error(errors.IN_ATTR_MISSING);

    let expressions = getChildren(path).map(toExpression, parameters);

    appendExpressions(expressions, path, options);
}

function toExpression(path) {
    if (!path.isJSXElement())
        return null;

    let parameters = this;

    let argName = t.identifier(parameters.itemName || "value");
    let argNames = [argName];

    if (parameters.keyIs) {
        let name = t.jSXIdentifier("key");
        let value = t.memberExpression(argName, t.identifier(parameters.keyIs));
        let attribute = t.jSXAttribute(name, t.jSXExpressionContainer(value));

        addAttribute(path, attribute);
    }

    if (!parameters.itemName) {
        let attributes = getAttributes(path);

        if (!attributes.some(isAlreadyExists, argName)) {
            let spread = t.jSXSpreadAttribute(argName);

            addAttribute(path, spread);
        }
    }

    let returnStatement = t.returnStatement(path.node);
    let body = t.blockStatement([returnStatement]);
    let fn = t.functionExpression(null, argNames, body);

    return createArrayMapCallExpression(fn, parameters);
}

function addAttribute(path, attribute) {
    let openingElement = path.get("openingElement");
    let name = openingElement.node.name;
    let attributes = openingElement.get("attributes").map(path => path.node);
    let selfClosing = openingElement.node.selfClosing;

    attributes.push(attribute);

    openingElement.replaceWith(t.jSXOpeningElement(name, attributes, selfClosing)); 
}

function createArrayMapCallExpression(fn, parameters) {
    let callee = "Array.prototype.map.call"
        .split(".")
        .reduce(toMemberExpression);
    let args = [parameters.iterable, fn, t.thisExpression()];

    return t.callExpression(callee, args);

}

function toMemberExpression(expression, item) {
    if (typeof expression == "string") {
        return t.memberExpression(t.identifier(expression), t.identifier(item));
    }

    return t.memberExpression(expression, t.identifier(item));
}

function setParameters(attribute) {
    let attributeName = getAttributeName(attribute);

    switch (attributeName) {
        case "each":
            this.itemName = getItemName(attribute);
            break;

        case "in":
            this.iterable = getIterable(attribute);
            break;

        case "key-is":
            this.keyIs = getKeyValue(attribute);
    }
}

function getItemName(attribute) {
    return attribute.get("value").node.value;
}

function getIterable(attribute) {
    // if !expression???
    return attribute.get("value").node.expression;
}

function getKeyValue(attribute) {
    return attribute.get("value").node.value;
}

function isAlreadyExists(attribute) {
    if (!attribute.isJSXSpreadAttribute())
        return false;

    let identifier = attribute.get("argument");

    if (!identifier.isIdentifier())
        return false;

    return identifier.node.name == this.name;
}

function isLoop(path) {
    return getTagName(path) == "For";
}

function log(...args) {
    console.log(">>>>>>>>>>>>>>>>>>>>>");
    console.log(...args);
}
