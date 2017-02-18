const {assert} = require("chai");
const isEquil = require("./tools");


describe("For statement", () => {
    it("should transform with \"in\" attribute", () => {
        let input = `
            props => <div>
                <For each="item" in={array}>
                    <div>{ item }</div>
                </For>
            </div>;
        `;
        let output = `
            var _this = this;

            props => <div>
                {
                    Array.prototype.map.call(array, function (item) {
                        return <div>{item}</div>;
                    }, _this)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("should transform without \"in\" attribute", () => {
        let input = `
            props => <div>
                <For in={array}>
                    <div> text </div>
                </For>
            </div>;
        `;
        let output = `
            var _this = this;

            props => <div>
                {
                    Array.prototype.map.call(array, function (value) {
                        return <div {...value}> text </div>;
                    }, _this)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("should transform loop in loop", () => {
        let input = `
            props => <div>
                <For each="item" in={array}>
                    <For in={item}>
                        <div> text </div>
                    </For>
                </For>
            </div>;
        `;
        let output = `
            var _this = this;

            props => <div>
                {
                    Array.prototype.map.call(array, function (item) {
                        return Array.prototype.map.call(item, function (value) {
                            return <div {...value}> text </div>;
                        }, this);
                    }, _this)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });
});
