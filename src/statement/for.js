import { types as t } from "@babel/core";
import not from "logical-not";
import manipulateOptions from "../helper/manipulate-options";
import getComponentName from "../helper/get-component-name";
import toExpression from "../helper/statement-children-to-expression";
import replace from "../helper/replace-statement";
import throwIf from "../helper/throw-if";


const Error = {
    IN_PROP_MISSING: "\"in\" prop is required",
    EACH_PROP_NOT_STRING: "\"each\" prop must be a string",
    IN_PROP_NOT_EXPRESSION: "\"in\" prop must be an expression",
    INDEX_NAME_PROP_NOT_STRING: "\"index\" prop must be a string",
};

export default () => ({
    name: "transform-react-statement-for",
    manipulateOptions,

    visitor: {
        JSXElement(path, { opts: { statementName = "For" } }) {
            let { node } = path;

            if (getComponentName(node) != statementName) return;

            let parameters = {
                itemIdentifier: null,
                itemIndexName: "index",
                iterableExpression: null,
            };

            let { attributes } = node.openingElement;

            attributes.forEach(setParameters, parameters);

            throwIf(not(parameters.iterableExpression), Error.IN_PROP_MISSING);

            let iterableItem = toExpression(node.children);
            let itemIdentifier = t.identifier(parameters.itemIdentifier || "item");
            let counterIdentifier = t.identifier(parameters.itemIndexName);
            let argNames = [itemIdentifier, counterIdentifier];
            let returnStatement = t.returnStatement(iterableItem);
            let body = t.blockStatement([returnStatement]);
            let fn = t.functionExpression(null, argNames, body);

            let statement = createArrayMapCallExpression(fn, parameters);

            replace(path, statement);
        },
    },
});


function setParameters(attribute) {
    let parameters = this;
    let { name: attributeName } = attribute.name;
    let valueNode = attribute.value;

    switch (attributeName) {
        case "each":
            throwIf(not(t.isStringLiteral(valueNode)), Error.EACH_PROP_NOT_STRING);

            parameters.itemIdentifier = valueNode.value;
            break;

        case "in":
            throwIf(not(t.isJSXExpressionContainer(valueNode)), Error.IN_PROP_NOT_EXPRESSION);

            parameters.iterableExpression = valueNode.expression;
            break;

        case "index":
            throwIf(not(t.isStringLiteral(valueNode)), Error.INDEX_NAME_PROP_NOT_STRING);

            parameters.itemIndexName = valueNode.value;
            break;
    }
}

function createArrayMapCallExpression(fn, parameters) {
    let callee = ["Array", "prototype", "map", "call"].map(toIdentifier).reduce(toMemberExpression);
    let args = [parameters.iterableExpression, fn, t.thisExpression()];

    return t.callExpression(callee, args);

}

function toIdentifier(stringItem) {
    return t.identifier(stringItem);
}

function toMemberExpression(expression, identifier) {
    return t.memberExpression(expression, identifier);
}
