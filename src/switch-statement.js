import {
    getChildren,
    combineElements,
    appendExpressions
} from "./common-lib.js";

const t = require("babel-types");

const errors = {
    NO_SWITCH_VALUE: "NO_SWITCH_VALUE",
    VALUE_NOT_EXPRESSION: "VALUE_NOT_EXPRESSION",
    NO_CASE_VALUE: "NO_CASE_VALUE",
    INVALID_CHILD_NODE: "INVALID_CHILD_NODE"
};


export default function (path, options) {
    let {node} = path;
    let valueExpression = getValueExpression(node);
    let switchBody = { cases: [], defaultStatement: null };

    getChildren(node).forEach(getCases, {switchBody, options});

    let argsNames = getArgsNames(switchBody.cases.length);
    let args = getArgs(valueExpression, switchBody.cases);

    let cases = switchBody.cases.map(toSwitchCase, argsNames);
    let switchStatement = t.switchStatement(argsNames[0], cases);
    let statements = [switchStatement];

    if (switchBody.defaultStatement) {
        statements.push(switchBody.defaultStatement);
    }

    let body = t.blockStatement(statements);
    let fn = t.functionExpression(null, argsNames, body);
    let memberExpression = t.memberExpression(fn, t.identifier("call"));
    let callExpression = t.callExpression(memberExpression, args);

    return appendExpressions([callExpression], path, options);
}

function getValueExpression(node) {
    let attribute = getValueAttribute(node);

    if (!attribute)
        throw new Error(errors.NO_SWITCH_VALUE);

    let {value: valueExpression} = attribute;

    if (!t.isJSXExpressionContainer(valueExpression))
        throw new Error(errors.VALUE_NOT_EXPRESSION);

    return valueExpression.expression;
}

function getCases(childNode) {
    if (!t.isJSXElement(childNode))
        throw new Error(errors.INVALID_CHILD_NODE);

    let {switchBody, options} = this;

    let {name: tagName} = childNode.openingElement.name;

    if (tagName == "Case") {
        let valueAttribute = getValueAttribute(childNode);

        if (!valueAttribute)
            throw new Error(errors.NO_CASE_VALUE);

        let {value: valueSource} = valueAttribute;

        let value =
            t.isJSXExpressionContainer(valueSource) ?
                valueSource.expression : valueSource;

        let children = getChildren(childNode);
        let element = combineElements(children, options);
        let statement = [t.returnStatement(toCorrectExpression(element))];

        switchBody.cases.push({ value, statement });
    }
    else
    if (tagName == "Default") {
        let children = getChildren(childNode);
        let element = combineElements(children, options);

        switchBody.defaultStatement =
            t.returnStatement(toCorrectExpression(element));
    }
    else throw new Error(errors.INVALID_CHILD_NODE);
}

function getValueAttribute(jsxNode) {
    let {attributes} = jsxNode.openingElement;

    for (let i = 0, lim = attributes.length; i < lim; i++) {
        let attribute = attributes[i];

        if (attribute.name.name == "value")
            return attribute;
    }

    return null;
}

function toCorrectExpression(value) {
    if (t.isJSXElement(value))
        return value;

    if (t.isJSXExpressionContainer(value)) {
        return value.expression;
    }

    if (t.isJSXEmptyExpression(value)) {
        return t.nullLiteral();
    }

    if (t.isJSXText(value)) {
        return t.stringLiteral(value.value);
    }

    return value;
}

function toSwitchCase({statement}, index) {
    let argsNames = this;

    return t.switchCase(argsNames[index + 1], statement);
}


function getArgsNames(count) {
    let args = [t.identifier("value")];

    for (let i = 1; i <= count; i++)
        args.push(t.identifier("case" + i));

    return args;
}

function getArgs(valueArgument, cases) {
    return cases.reduce(toArgs, [t.thisExpression(), valueArgument]);
}

function toArgs(args, {value}) {
    args.push(value);

    return args;
}
