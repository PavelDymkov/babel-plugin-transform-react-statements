const { assert } = require("chai");
const createPluginTestHelper = require("babel-plugin-test-helper");

const isEqual = createPluginTestHelper(require("../../lib/statement/component.js"));


describe("Component statement test:", () => {
    it("default prop name", () => {
        let input = `
            <Component>
                <div> { props.children } </div>
            </Component>;
        `;
        let output = `
            props => <div> { props.children } </div>;
        `;

        assert.isTrue(isEqual(input, output));
    });

    it("user prop name", () => {
        let input = `
            <Component props="item">
                <div> { item.children } </div>
            </Component>;
        `;
        let output = `
            item => <div> { item.children } </div>;
        `;

        assert.isTrue(isEqual(input, output));
    });

    it("rename statement name", () => {
        let input = `
            <div>
                <Component>
                    <div> { props.children } </div>
                </Component>

                <Custom props="item">
                    <div> { item.children } </div>
                </Custom>
            </div>
        `;
        let output = `
            <div>
                <Component>
                    <div> {props.children} </div>
                </Component>

                {item => <div> {item.children} </div>}
            </div>;
        `;

        assert.isTrue(isEqual(input, output, { statementName: "Custom" }));
    });
});
