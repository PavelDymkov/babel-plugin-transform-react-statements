const { assert } = require("chai");
const createPluginTestHelper = require("babel-plugin-test-helper");

const isEqual = createPluginTestHelper(require("../../lib/statement/for.js"));

describe("For statement test:", () => {
    it("should transform with \"in\" attribute", () => {
        let input = `
            <For each="item" in={array}>
                <div>{item}</div>
            </For>;
        `;
        let output = `
            Array.prototype.map.call(array, function (item, index) {
                return <div>{item}</div>;
            }, this);
        `;

        assert.isTrue(isEqual(input, output));
    });

    it("should use default item name", () => {
        let input = `
            <For in={array}>
                <div>{item}</div>
            </For>;
        `;
        let output = `
            Array.prototype.map.call(array, function (item, index) {
                return <div>{item}</div>;
            }, this);
        `;

        assert.isTrue(isEqual(input, output));
    });

    it("should change index name", () => {
        let input = `
            <For in={array} itex="idx">
                <div key={idx} />
            </For>;
        `;
        let output = `
            Array.prototype.map.call(array, function (item, index) {
                return <div key={idx} />;
            }, this);
        `;

        assert.isTrue(isEqual(input, output));
    });

    it ("should change statement name", () => {
        let input = `
            <div>
                <For in={array}>
                    <div>{item}</div>
                </For>

                <Custom in={array}>
                    <div>{item}</div>
                </Custom>
            </div>;
        `;
        let output = `
            <div>
                <For in={array}>
                    <div>{item}</div>
                </For>

                {Array.prototype.map.call(array, function (item, index) {
                    return <div>{item}</div>;
                }, this)}
            </div>;
        `;

        assert.isTrue(isEqual(input, output, { statementName: "Custom" }));
    });
});
