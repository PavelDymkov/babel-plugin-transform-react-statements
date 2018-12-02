const { assert } = require("chai");
const createPluginTestHelper = require("babel-plugin-test-helper");

const isEqual = createPluginTestHelper(require("../../lib/statement/switch.js"));


describe("Switch statement test:", () => {
    it("should transform simple case", () => {
        let input = `
            <Switch value={x}>
                <Case value={1}>
                    <div> Text 1 </div>
                </Case>
                <Case value={"lol"}>
                    <div> Text 2 </div>
                </Case>
                <Default>
                    <div> default </div>
                </Default>
            </Switch>;
        `;
        let output = `
            (function (value, case1, case2) {
                switch (value) {
                    case case1: return <div> Text 1 </div>;
                    case case2: return <div> Text 2 </div>;
                }
            
                return <div> default </div>;
            }).call(this, x, 1, "lol");
        `;

        assert.isTrue(isEqual(input, output));
    });

    it ("should change statement name", () => {
        let input = `
            <div>
                <Switch value={x}>
                    <Case value={1}>
                        <div> Text 1 </div>
                    </Case>
                    <Default>
                        <div> default </div>
                    </Default>
                </Switch>

                <Custom value={x}>
                    <CustomCase value={1}>
                        <div> Text 1 </div>
                    </CustomCase>
                    <CustomDefault>
                        <div> default </div>
                    </CustomDefault>
                </Custom>
            </div>;
        `;
        let output = `
            <div>
                <Switch value={x}>
                    <Case value={1}>
                        <div> Text 1 </div>
                    </Case>
                    <Default>
                        <div> default </div>
                    </Default>
                </Switch>

                {function (value, case1) {
                    switch (value) {
                        case case1: return <div> Text 1 </div>;
                    }

                    return <div> default </div>;
                }.call(this, x, 1)}
            </div>;
        `;

        let aliases = { caseAlias: "CustomCase", defaultCaseAlias: "CustomDefault" };

        assert.isTrue(isEqual(input, output, { statementName: "Custom", ...aliases }));
    });
});
