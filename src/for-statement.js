import {
    getAttributeName,
    getAttributes,
    appendStatements,
    notNull
} from "./helper.js";


const errors = {
    IN_ATTR_MISSING: "IN_ATTR_MISSING",
    CHILD_MUST_BE_AN_ELEMENT: "CHILD_MUST_BE_AN_ELEMENT"
};


export default function (t, path, options) {
    let parameters = {
        itemName: null,
        iterable: null
    };
    let attributes = getAttributes(t, path);

    attributes.reduce(setParameters, parameters);

    if (!parameters.iterable)
        throw new Error(errors.IN_ATTR_MISSING);

    let forStatements = path.get("children")
        .map(toForStatement)
        .filter(notNull);

    appendStatements(t, path, forStatements);



    function toForStatement(path) {
        if (!t.isJSXElement(path))
            return null;

        let argName = t.identifier(parameters.itemName || "value");
        let args = [argName];

        if (!parameters.itemName) {
            if (!t.isJSXElement(path))
                throw new Error(errors.CHILD_MUST_BE_AN_ELEMENT);

            let openingElement = path.get("openingElement");
            let attributes = openingElement.get("attributes");
            let spreadIsAlreadyExists = attributes.some(isAlreadyExists, argName);

            if (!spreadIsAlreadyExists) {
                let name = openingElement.node.name;
                let spread = t.jSXSpreadAttribute(argName);

                attributes.push(spread);

                let selfClosing = openingElement.node.selfClosing;

                openingElement.replaceWith(t.jSXOpeningElement(name, attributes, selfClosing)); 
            }
        }

        let returnStatement = t.returnStatement(path.node);
        let body = t.blockStatement([returnStatement]);
        let fn = t.functionExpression(null, args, body);
        let expression = createArrayMapCallExpression(fn);

        return t.jSXExpressionContainer(expression);


        function isAlreadyExists(attribute) {
            if (!t.isJSXSpreadAttribute(attribute))
                return false;

            let identifier = attribute.get("argument");

            if (!t.isIdentifier(identifier))
                return false;

            return identifier.node.name == this.name;
        }
    }

    function createArrayMapCallExpression(fn) {
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
};


function setParameters(parameters, attribute) {
    let attributeName = getAttributeName(attribute);

    switch (attributeName) {
        case "each":
            parameters.itemName = getItemName(attribute);
            break;

        case "in":
            parameters.iterable = getIterable(attribute);
            break;
    }

    return parameters;
}

function getItemName(attribute) {
    return attribute.get("value").node.value;
}

function getIterable(attribute) {
    return attribute.get("value").node.expression;
}

function log(...args) {
    console.log(">>>>>>>>>>>>>>>>>>>>>");
    console.log(...args);
}
