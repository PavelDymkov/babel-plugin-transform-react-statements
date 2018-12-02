const { assert } = require("chai");
const createPluginTestHelper = require("babel-plugin-test-helper");

const isEqual = createPluginTestHelper(require("../../lib/statement/if.js"));


describe("If statement test:", () => {
    it("should transform simple case", () => {
        let input = `
            <div>
                <If true={true}>
                    <div> test </div>
                </If>
            </div>;
        `;
        let output = `
            <div>
                { true && <div> test </div> }
            </div>;
        `;

        assert.isTrue(isEqual(input, output));
    });

    it ("should transform to milti expressions", () => {
        let input = `
            <div>
                <If true={true}>
                    <div> test </div>
                    <div> test </div>
                </If>
            </div>;
        `;
        let output = `
            <div>
                { true && <> <div> test </div><div> test </div> </> }
            </div>;
        `;

        assert.isTrue(isEqual(input, output));
    });

    it ("should transform jsx expression", () => {
        let input = `
            <div>
                <If true={true}>
                    { x }
                </If>
            </div>;
        `;
        let output = `
            <div>{true && x}</div>;
        `;

        assert.isTrue(isEqual(input, output));
    });

    it ("should transform", () => {
        let input = `
            <div>
                <div> test </div>

                <If true={true}>
                    <div> test </div>
                </If>
                
                <div> test </div>
            </div>;
        `;
        let output = `
            <div>
                <div> test </div>

                {true && <div> test </div>}
                
                <div> test </div>
            </div>;
        `;

        assert.isTrue(isEqual(input, output));
    });

    it ("should change statement name", () => {
        let input = `
            <div>
                <If true={1}>
                    <div>x</div>
                </If>

                <Custom true={1}>
                    <div>x</div>
                </Custom>
            </div>;
        `;
        let output = `
            <div>
                <If true={1}>
                    <div>x</div>
                </If>

                {1 && <div>x</div>}
            </div>;
        `;

        assert.isTrue(isEqual(input, output, { statementName: "Custom" }));
    });
});
