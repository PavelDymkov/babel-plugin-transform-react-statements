const {assert} = require("chai");
const isEquil = require("./tools");


describe("For statement", () => {
    it("should transform with \"in\" attribute", () => {
        let input = `
            <div>
                <For each="item" in={array}>
                    <div>{ item }</div>
                </For>
            </div>;
        `;
        let output = `
            <div>
                {
                    Array.prototype.map.call(array, function (item) {
                        return <div>{item}</div>;
                    }, this)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("should transform without \"in\" attribute", () => {
        let input = `
            <div>
                <For in={array}>
                    <div> text </div>
                </For>
            </div>;
        `;
        let output = `
            <div>
                {
                    Array.prototype.map.call(array, function (value) {
                        return <div {...value}> text </div>;
                    }, this)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("should transform loop in loop", () => {
        let input = `
            <div>
                <For each="item" in={array}>
                    <For in={item}>
                        <div> text </div>
                    </For>
                </For>
            </div>;
        `;
        let output = `
            <div>
                {
                    Array.prototype.map.call(array, function (item) {
                        return <span>
                            {
                                Array.prototype.map.call(item, function (value) {
                                    return <div {...value}> text </div>;
                                }, this)
                            }
                        </span>;
                    }, this)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("should transform key-is without each", () => {
        let input = `
            <div>
                <For in={array} key-is="id">
                    <div />
                </For>
            </div>;
        `;
        let output = `
            <div>
                {
                    Array.prototype.map.call(array, function (value) {
                        return <div key={value.id} {...value} />;
                    }, this)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("should transform key-is with each", () => {
        let input = `
            <div>
                <For each="item" in={array} key-is="id">
                    <div>{ item.value }</div>
                </For>
            </div>;
        `;
        let output = `
            <div>
                {
                    Array.prototype.map.call(array, function (item) {
                        return <div key={item.id}>{item.value}</div>;
                    }, this)
                }
            </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });
});
