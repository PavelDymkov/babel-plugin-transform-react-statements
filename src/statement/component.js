import { types as t } from "@babel/core";
import manipulateOptions from "../helper/manipulate-options";
import getComponentName from "../helper/get-component-name";
import statementChildrenToExpression from "../helper/statement-children-to-expression";
import replace from "../helper/replace-statement";
import throwIf from "../helper/throw-if";
import not from "../helper/not";


const Error = {
    PROPS_COUNT: "Component statement must have only one prop: props",
    INVALID_PROP_NAME: "incorrect prop name (must be named props)",
    INVALID_PROP_VALUE: "incorrect prop value (must be a string)",
};


export default () => ({
    name: "transform-react-statement-component",
    manipulateOptions,

    visitor: {
        JSXElement(path, { opts: { statementName = "Component" } }) {
            let { node } = path;

            if (getComponentName(node) != statementName) return;

            let { attributes } = node.openingElement;

            throwIf(attributes.length > 1, Error.PROPS_COUNT);

            let propsIdentifier = getPropsIdentifier(attributes);

            let params = [propsIdentifier];
            let expression = statementChildrenToExpression(node.children);

            let arrayFunction = t.arrowFunctionExpression(params, expression);

            replace(path, arrayFunction);
        },
    },
});


function getPropsIdentifier([attribute]) {
    if (attribute) {
        throwIf(attribute.name.name != "props", Error.INVALID_PROP_NAME);
        throwIf(not(t.isStringLiteral(attribute.value)), Error.INVALID_PROP_VALUE);

        let { value: name } = attribute.value;

        return t.identifier(name);
    }

    return t.identifier("props");
}
