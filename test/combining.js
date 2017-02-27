const {assert} = require("chai");
const isEquil = require("./tools");


describe("Combining child node tests", () => {
    it("should wrap contitions in div element", () => {
        let input = `
            let x =
                <If true={1}>
                    <div> foo </div>
                    <div> bar </div>
                </If>
        `;
        let output = `
            let x =
                <div>
                    {1 && <div> foo </div>}
                    {1 && <div> bar </div>}
                </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("should wrap in custom element", () => {
        let options = {
            wrapper: '<span class="x" data-attr="0" />'
        };
        let input = `
            let x =
                <For each="item" in={array}>
                    <div> foo </div>
                    <div> bar </div>
                </For>
        `;
        let output = `
            let x =
                <span class="x" data-attr="0">
                    {
                        Array.prototype.map.call(array, function (item) {
                            return <div> foo </div>;
                        }, this)
                    }
                    {
                        Array.prototype.map.call(array, function (item) {
                            return <div> bar </div>;
                        }, this)
                    }
                </span>;
        `;

        assert.isTrue(isEquil(input, output, options));
    });
});