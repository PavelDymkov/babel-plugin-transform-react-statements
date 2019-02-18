import { types as t } from "@babel/core";
import not from "logical-not";
import manipulateOptions from "../helper/manipulate-options";
import getComponentName from "../helper/get-component-name";
import toExpression from "../helper/statement-children-to-expression";
import replace from "../helper/replace-statement";
import throwIf from "../helper/throw-if";


const Error = {
    NO_SWITCH_VALUE: "NO_SWITCH_VALUE",
    VALUE_NOT_EXPRESSION: "VALUE_NOT_EXPRESSION",
    NO_CASE_VALUE: "NO_CASE_VALUE",
    INVALID_CHILD_NODE: "INVALID_CHILD_NODE",
};


export default () => ({
    name: "transform-react-statement-component",
    manipulateOptions,

    visitor: {
        JSXElement(path, { opts: { statementName = "Switch", ...aliases } }) {
            let { node } = path;

            if (getComponentName(node) != statementName) return;

            let valueExpression = getValueExpression(node);
            let switchBody = { cases: [], defaultStatement: null };

            node.children.forEach(getCases, { switchBody, aliases });

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

            replace(path, callExpression);
        },
    },
});


function getValueExpression(node) {
    let attribute = getValueAttribute(node);

    throwIf(not(attribute), Error.NO_SWITCH_VALUE);

    let { value: valueExpression } = attribute;

    throwIf(not(t.isJSXExpressionContainer(valueExpression)), Error.VALUE_NOT_EXPRESSION);

    return valueExpression.expression;
}

function getCases(childNode) {
    if (t.isJSXText(childNode) && not(childNode.value.trim())) return;

    throwIf(not(t.isJSXElement(childNode)), Error.INVALID_CHILD_NODE);

    let { switchBody, aliases: { caseAlias = "Case", defaultCaseAlias = "Default" } } = this;

    let tagName = getComponentName(childNode);

    if (tagName == caseAlias) {
        let valueAttribute = getValueAttribute(childNode);

        throwIf(not(valueAttribute), Error.NO_CASE_VALUE);

        let { value: valueSource } = valueAttribute;

        let value = t.isJSXExpressionContainer(valueSource) ? valueSource.expression : valueSource;
        let statement = [t.returnStatement(toExpression(childNode.children))];

        switchBody.cases.push({ value, statement });
    }
    else
    if (tagName == defaultCaseAlias) {
        switchBody.defaultStatement = t.returnStatement(toExpression(childNode.children));
    }
    else throwIf(true, Error.INVALID_CHILD_NODE);
}

function getValueAttribute(jsxNode) {
    let { attributes } = jsxNode.openingElement;

    for (let i = 0, lim = attributes.length; i < lim; i++) {
        let attribute = attributes[i];

        if (attribute.name.name == "value") return attribute;
    }

    return null;
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
