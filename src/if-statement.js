import {
    getAttributes,
    appendStatements,
    notNull
} from "./helper.js";


const errors = {
    ATTRIBUTES_LENGTH: "IF__ATTRIBUTES_LENGTH",
    INVALID_ATTRIBUTE_NAME: "IF__INVALID_ATTRIBUTE_NAME",
    INVALID_ATTRIBUTE_VALUE: "IF__INVALID_ATTRIBUTE_VALUE",
    CHILD_MUST_BE_JSX_ELEMENT: "IF__CHILD_MUST_BE_JSX_ELEMENT"
};


export default function (t, path, options) {
    let attributes = getAttributes(t, path);

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

    let ifStatements = path.get("children")
        .map(toIfStatement)
        .filter(notNull);

    appendStatements(t, path, ifStatements);



    function toIfStatement(path) {
        let rVal = null;

        if (t.isJSXElement(path)) {
            rVal = path.node;
        }
        else
        if (t.isJSXExpressionContainer(path)) {
            rVal = path.get("expression").node;
        }
        else return null;

        let logicalExpression = t.logicalExpression("&&", conditionExpression, rVal);

        return t.jSXExpressionContainer(logicalExpression);
    }
};

function log(...args) {
    console.log(">>>>>>>>>>>>>>>>>>>>>");
    console.log(...args);
}
