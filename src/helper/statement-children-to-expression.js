import { types as t } from "@babel/core";
import clone from "./clone-babel-node";


export default function statementChildrenToExpression(sourceNodeList) {
    sourceNodeList = sourceNodeList.filter(unprocessedNodes);

    if (sourceNodeList.length == 0) {
        return t.nullLiteral();
    }

    if (sourceNodeList.length == 1) {
        let [node] = sourceNodeList;

        return toExpression(node);
    }

    return t.jsxFragment(
        t.jsxOpeningFragment(), t.jsxClosingFragment(), sourceNodeList.map(toJSXItem)
    );
}

function unprocessedNodes(node) {
    if (t.isJSXText(node)) {
        return node.value.trim() != "";
    }

    if (t.isJSXEmptyExpression(node)) {
        return false;
    }

    return true;
}

// node: JSXText | JSXExpressionContainer | JSXSpreadChild | JSXElement | JSXFragment
function toExpression(node) {
    if (t.isJSXText(node)) {
        return t.stringLiteral(node.value.trim());
    }

    if (t.isJSXExpressionContainer(node)) {
        return node.expression;
    }

    if (t.isJSXSpreadChild(node)) {
        return node.expression;
    }

    if (t.isJSXElement(node)) {
        return clone(node);
    }

    if (t.isJSXFragment(node)) {
        return clone(node);
    }
}

// node: JSXText | JSXExpressionContainer | JSXSpreadChild | JSXElement | JSXFragment
function toJSXItem(node) {
    if (t.isJSXText(node)) {
        return t.jsxText(node.value.trim());
    }

    return clone(node);
}
