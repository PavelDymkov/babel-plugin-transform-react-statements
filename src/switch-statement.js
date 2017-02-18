import {
    getAttribute,
    getAttributes,
    getAttributeName,
    getTagName,
    appendStatements
} from "./helper.js";


const errors = {
    NO_SWITCH_VALUE: "NO_SWITCH_VALUE",
    NO_CASE_VALUE: "NO_CASE_VALUE"
};


export default function (t, path, options) {
    let switchValue = getAttribute("value", t, path);

    if (!switchValue)
        throw new Error(errors.NO_SWITCH_VALUE);

    let switchBody = { cases: [], defaultStatement: null };

    path.get("children").forEach(getCases);

    let argsNames = getArgsNames(t, switchBody.cases.length);
    let args = getArgs(t, switchBody.cases);

    let cases = switchBody.cases.map(toSwitchCase);
    let switchStatement = t.switchStatement(argsNames[0], cases);
    let statements = [switchStatement];

    if (switchBody.defaultStatement) {
        statements.push(switchBody.defaultStatement);
    }

    let body = t.blockStatement(statements);
    let fn = t.functionExpression(null, argsNames, body);
    let memberExpression = t.memberExpression(fn, t.identifier("call"));
    let callExpression = t.callExpression(memberExpression, args);

    if (t.isJSXElement(path.parentPath)) {
        let expressionContainer = t.jSXExpressionContainer(callExpression);

        path.replaceWith(expressionContainer);
    } else {
        path.replaceWith(callExpression);
    }
    


    function getCases(childPath) {
        let tagName = getTagName(t, childPath);

        if (!tagName) return;

        if (tagName == "Case") {
            let valueAttribute = getAttribute("value", t, childPath);

            if (!valueAttribute)
                throw new Error(errors.NO_CASE_VALUE);

            let valueSource = valueAttribute.get("value");

            let value =
                t.isJSXExpressionContainer(valueSource) ?
                valueSource.get("expression").node :
                valueSource;

            let childNode = childPath.get("children").reduce(getJSXElement, null);
            let statement = [t.returnStatement(childNode)];

            switchBody.cases.push({ value, statement });
        } else if (tagName == "Default") {
            let childNode = childPath.get("children").reduce(getJSXElement, null);

            switchBody.defaultStatement = t.returnStatement(childNode);
        }
    }

    function getJSXElement(element, current) {
        if (element) return element;

        return t.isJSXElement(current) || t.isJSXExpressionContainer(current) ? current.node : null;
    }

    function toSwitchCase({statement}, index) {
        return t.switchCase(argsNames[index + 1], statement);
    }
};


function getArgsNames(t, count) {
    let args = [t.identifier("value")];

    for (let i = 1; i <= count; i++)
        args.push(t.identifier("case" + i));

    return args;
}

function getArgs(t, cases) {
    return cases.reduce(toArgs, [t.thisExpression()]);
}

function toArgs(args, {value}) {
    args.push(value);

    return args;
}

function log(...args) {
    console.log(">>>>>>>>>>>>>>>>>>>>>");
    console.log(...args);
}
