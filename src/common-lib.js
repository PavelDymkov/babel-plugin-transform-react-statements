const babel = require("babel-core");
const t = require("babel-types");

const errors = {
    WRAPPER_PARSE_ERROR: "WRAPPER_PARSE_ERROR"
};


export function appendExpressions(expressions, path, options) {
    let parentPath = path.parentPath;

    if (parentPath.isJSXElement()) {
        let openingElement = parentPath.get("openingElement").node;
        let closingElement = parentPath.get("closingElement").node;
        let isSelfClosing = closingElement == null;

        let items = expressions.map(toJSXExpression);
        let children = parentPath.get("children").map(toNode);
        let index = children.indexOf(path.node);

        children.splice(index, 1, ...items);

        let newParentPath = t.jSXElement(openingElement, closingElement, children, isSelfClosing);

        parentPath.replaceWith(newParentPath);
    } else {
        if (expressions.length == 1) {
            let [expression] = expressions;

            path.replaceWith(t.expressionStatement(expression));
        } else {
            let jsxExpressions = expressions.map(toJSXExpression);
            let wrapper = combineElements(jsxExpressions, options);

            path.replaceWith(wrapper);
        }
    }
}

function toJSXExpression(expression) {
    return t.jSXExpressionContainer(expression);
}


function toNode(path) {
    return path.node;
}


export function combineElements(elements, options) {
    if (elements.length == 1) return elements[0];

    let wrapper = options.wrapper || "<div />";

    if (wrapper == "no-wrap") {
        return t.arrayExpression(elements.reduce(toJSExpression, []));
    }

    try {
        let {ast} = babel.transform(wrapper, { plugins: ["syntax-jsx"] });
        let [expressionStatement] = ast.program.body;

        if (!t.isExpressionStatement(expressionStatement))
            throw null;

        let wrapperASTSource = expressionStatement.expression;

        if (!t.isJSXElement(wrapperASTSource))
            throw null;

        let openingElementSource = wrapperASTSource.openingElement;
        let { name: tagIdentifier } = openingElementSource;

        let openingElement =
            t.jSXOpeningElement(tagIdentifier, openingElementSource.attributes);
        let closingElement = t.jSXClosingElement(tagIdentifier);

        return t.jSXElement(openingElement, closingElement, elements, false);
    } catch (error) {
        throw new Error(errors.WRAPPER_PARSE_ERROR);
    }
}

function toJSExpression(expressions, node) {
    if (t.isJSXExpressionContainer(node)) {
        expressions.push(node.expression);
    }
    else
    if (t.isJSXText(node)) {
        let text = node.value.trim();

        if (text) {
            expressions.push(t.stringLiteral(text));
        }
    }
    else {
        expressions.push(node);
    }

    return expressions;
}


export function getChildren(node) {
    return node.children.reduce(toValidChildNodes, []);
}

function toValidChildNodes(children, node) {
    if (t.isJSXEmptyExpression(node))
        return children;

    if (t.isJSXText(node)) {
        let value = node.value.trim();

        if (value) {
            let textNode = t.jSXText(value);

            children.push(textNode);
        }
    } else {
        children.push(node)
    }

    return children;
}
