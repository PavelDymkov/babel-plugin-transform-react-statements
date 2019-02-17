import { types as t } from "@babel/core";
import not from "not-value";
import manipulateOptions from "../helper/manipulate-options";
import getComponentName from "../helper/get-component-name";
import process from "../helper/statement-children-to-expression";
import replace from "../helper/replace-statement";
import throwIf from "../helper/throw-if";


const Error = {
    PROPS_COUNT: "If statement must have only one prop: true or false",
    INVALID_PROP_NAME: "incorrect prop name (must be named true or false)",
    INVALID_PROP_VALUE: "incorrect prop value (must be an expression, not a string)",
};


export default () => ({
    name: "transform-react-statement-if",
    manipulateOptions,

    visitor: {
        JSXElement(path, { opts: { statementName = "If" } }) {
            let { node } = path;

            if (getComponentName(node) != statementName) return;

            let { attributes } = node.openingElement;

            throwIf(attributes.length != 1, Error.PROPS_COUNT);

            let [attribute] = attributes;
            let { name: type } = attribute.name;

            throwIf(not(type == "true" || type == "false"), Error.INVALID_PROP_NAME);

            let { value: expressionContainer } = attribute;

            throwIf(not(t.isJSXExpressionContainer(expressionContainer)), Error.INVALID_PROP_VALUE);

            let { expression: conditionExpression } = expressionContainer;

            if (type == "false") {
                conditionExpression = t.unaryExpression("!", conditionExpression);
            }

            let replacement = t.logicalExpression("&&", conditionExpression, process(node.children));

            replace(path, replacement);
        },
    },
});
