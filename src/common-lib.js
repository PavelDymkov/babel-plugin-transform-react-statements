const babel = require("babel-core");
const t = require("babel-types");

const errors = {
    WRAPPER_PARSE_ERROR: "WRAPPER_PARSE_ERROR"
};


export function getTagName(path) {
    if (!path.isJSXElement())
        return null;

    let identifier = path.get("openingElement").get("name");

    return identifier.isJSXIdentifier() && identifier.node ? identifier.node.name : null;
}


export function getAttributeName(attribute) {
    return attribute.get("name").node.name;
}


export function getAttributes(path) {
    return path.isJSXElement() ? path.get("openingElement").get("attributes") : [];
}


export function getAttribute(path, name) {
    let attributes = getAttributes(path);

    for (let i = 0, lim = attributes.length; i < lim; i++) {
        let attribute = attributes[i];

        if (getAttributeName(attribute) == name)
            return attribute;
    }

    return null;
}

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


export function combineElements(elements, options) {
    if (elements.length == 1) return elements[0];

    let wrapper = options.wrapper || "<div />";

    try {
        debugger
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

export function getChildren(path) {
    return path.get("children").filter(notEmptyText);
}

export function getChildNodes(path) {
    return path.get("children").filter(notEmptyText).map(toNode);
}

function notEmptyText(path) {
    return path.isJSXText() ? path.node.value.trim() != "" : true;
}

export function toNode(path) {
    return path.node;
}
