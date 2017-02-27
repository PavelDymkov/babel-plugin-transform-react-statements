import {
    getAttribute,
    getAttributeName,
    getTagName,
    combineElements,
    appendExpressions,
    getChildren,
    getChildNodes
} from "./common-lib.js";

const t = require("babel-types");

const errors = {
    NO_SWITCH_VALUE: "NO_SWITCH_VALUE",
    VALUE_NOT_EXPRESSION: "VALUE_NOT_EXPRESSION",
    NO_CASE_VALUE: "NO_CASE_VALUE",
    INVALID_CHILD_NODE: "INVALID_CHILD_NODE"
};


export default function (path, options) {
    let valueExpression = getValueExpression(path);
    let switchBody = { cases: [], defaultStatement: null };

    getChildren(path).forEach(getCases, {switchBody, options});

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

function getValueExpression(path) {
    let valueAttribute = getAttribute(path, "value");

    if (!valueAttribute)
        throw new Error(errors.NO_SWITCH_VALUE);

    let valueExpression = valueAttribute.get("value");

    if (!valueExpression.isJSXExpressionContainer())
        throw new Error(errors.VALUE_NOT_EXPRESSION);

    return valueExpression.get("expression").node;
}

function getCases(childPath) {
    let {switchBody, options} = this;
    let tagName = getTagName(childPath);

    if (tagName == "Case") {
        let valueAttribute = getAttribute(childPath, "value");

        if (!valueAttribute)
            throw new Error(errors.NO_CASE_VALUE);

        let valueSource = valueAttribute.get("value");

        let value =
            valueSource.isJSXExpressionContainer() ?
            valueSource.get("expression").node :
            valueSource;

        let children = getChildNodes(childPath);
        let childNode = combineElements(children);
        let statement = [t.returnStatement(childNode)];

        switchBody.cases.push({ value, statement });
    }
    else
    if (tagName == "Default") {
        let childNode = combineElements(getChildNodes(childPath), options);

        switchBody.defaultStatement = t.returnStatement(childNode);
    }
    else {
        throw new Error(errors.INVALID_CHILD_NODE);
    }
}

function getJSXElement(element, current) {
    if (element) return element;

    let isCorrectType = current.isJSXElement() || current.isJSXExpressionContainer();

    return isCorrectType ? current.node : null;
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
