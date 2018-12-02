const { assert } = require("chai");
const { types: t } = require("@babel/core");
const createPluginTestHelper = require("babel-plugin-test-helper");
const { default: replaceStatement } = require("../../lib/helper/replace-statement.js");
const { default: getComponentName } = require("../../lib/helper/get-component-name.js");

const replaceStatementTestTransform = () => ({
    name: "replace-statement-test-transform",
    manipulateOptions(_, parserOptions) {
        parserOptions.plugins.push("jsx");
    },
    visitor: {
        JSXElement(path) {
            let { node } = path;

            if (getComponentName(node) != "AbstractStatement") return;

            let replacementExpression = t.identifier("abstractStatement");

            replaceStatement(path, replacementExpression);
        },
    },
});
const isEqual = createPluginTestHelper(replaceStatementTestTransform);


describe(`replace-statement test:`, () => {
    it("case 1", () => {
        let input = `
            <div>
                <AbstractStatement/>
            </div>
        `;
        let output = `
            <div>{abstractStatement}</div>;
        `;

        assert.isTrue(isEqual(input, output));
    });

    it("case 2", () => {
        let input = `
            <AbstractStatement/>
        `;
        let output = `
            abstractStatement;
        `;

        assert.isTrue(isEqual(input, output));
    });
});
