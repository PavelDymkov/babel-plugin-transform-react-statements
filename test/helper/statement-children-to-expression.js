const { assert } = require("chai");
const { transformSync: transform, types: t } = require("@babel/core");
const { default: statementChildrenToExpression } = require("../../lib/helper/statement-children-to-expression.js");
const { default: getComponentName } = require("../../lib/helper/get-component-name.js");

const statementChildrenToExpressionTestTransform = () => ({
    name: "statement-children-to-expression-test-transform",
    manipulateOptions(_, parserOptions) {
        parserOptions.plugins.push("jsx");
    },
    visitor: {
        JSXElement(path) {
            let { node } = path;

            if (getComponentName(node) != "AbstarctStatement") return;

            let expression = statementChildrenToExpression(node.children);
            let outputExpression = t.binaryExpression(">", t.identifier("expression"), expression);

            path.replaceWith(outputExpression);
        },
    },
});


describe(`statement-children-to-expression test:`, () => {
    it("case 1", () => {
        let input = `
            <div></div>
        `;
        let output = `
            <div></div>
        `;
    
        assert.isTrue(isEqual(input, output));
    });

    it("case 2", () => {
        let input = `
            <div></div>
            <div></div>
        `;
        let output = `
            <>
                <div></div>
                <div></div>
            </>
        `;
    
        assert.isTrue(isEqual(input, output));
    });

    it("case 3", () => {
        let input = `
            <div></div>
            {1}
        `;
        let output = `
            <>
                <div></div>
                {1}
            </>
        `;
    
        assert.isTrue(isEqual(input, output));
    });

    it("case 4", () => {
        let input = `
            {1}
            text
        `;
        let output = `
            <>
                {1}
                text
            </>
        `;
    
        assert.isTrue(isEqual(input, output));
    });

    it("case 5", () => {
        let input = `
            {1}
        `;
        let output = `
            1
        `;
    
        assert.isTrue(isEqual(input, output));
    });

    it("case 6", () => {
        let input = `
            text
        `;
        let output = `
            "text"
        `;
    
        assert.isTrue(isEqual(input, output));
    });
});


function wrap(input) {
    return `<AbstarctStatement>${input}</AbstarctStatement>`;
}

function unwrap(output) {
    return output.replace(/^\s*expression\s*>\s*/, "").replace(/;\s*$/, "");
}

function isEqual(input, expected) {
    let babelOptions = {
        plugins: [statementChildrenToExpressionTestTransform],
    };
    let rowOutput = transform(wrap(input), babelOptions).code;
    let output = unwrap(rowOutput);

    let spaces = /\s+/g;

    return output.replace(spaces, "") == expected.replace(spaces, "");
}
