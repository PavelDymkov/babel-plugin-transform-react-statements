const {assert} = require("chai");
const isEquil = require("./tools");


describe("Combining child node tests: ", () => {
    it("case 1", () => {
        let input = `
            <If true={1}>
                <div> foo </div>
                <div> bar </div>
            </If>
        `;
        let output = `
            <span>
                {1 && <div> foo </div>}
                {1 && <div> bar </div>}
            </span>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("case 2", () => {
        let input = `
            <p>
                <If true={1}>
                    <div> foo </div>
                    <div> bar </div>
                </If>
            </p>
        `;
        let output = `
            <p>
                {1 && <div> foo </div>}
                {1 && <div> bar </div>}
            </p>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("case 3", () => {
        let input = `
            <p>
                <For each="item" in={list}>
                    <If true={1}>
                        <div> foo </div>
                        <div> bar </div>
                    </If>
                </For>
            </p>;
        `;
        let output = `
            <p>
                {
                    Array.prototype.map.call(list, function (item, index) {
                        return <span>
                            {1 && <div> foo </div>}
                            {1 && <div> bar </div>}
                        </span>;
                    }, this)
                }
            </p>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("case 4", () => {
        let options = {
            wrapper: '<span class="x" data-attr="0" />'
        };
        let input = `
            <For each="item" in={array}>
                <div> foo </div>
                <div> bar </div>
            </For>;
        `;
        let output = `
            <span class="x" data-attr="0">
                {
                    Array.prototype.map.call(array, function (item, index) {
                        return <span class="x" data-attr="0">
                            <div> foo </div>
                            <div> bar </div>
                        </span>;
                    }, this)
                }
            </span>;
        `;

        assert.isTrue(isEquil(input, output, options));
    });

    it("case 5", () => {
        let input = `
            <Switch value={x}>
                <Case value={1}>
                    <For each="item" in={list}>
                        <If true={1}>
                            <div> foo </div>
                            <div> bar </div>
                        </If>
                    </For>
                </Case>
                
                <Case value={2}>
                    <div> text </div>
                
                    <For each="item" in={list}>
                        <If true={1}>
                            <div> foo </div>
                            <div> bar </div>
                        </If>
                    </For>
                </Case>
            </Switch>;
        `;
        let output = `
            (function (value, case1, case2) {
                switch (value) {
                    case case1:
                        return <span>
                            {
                                Array.prototype.map.call(list, function (item, index) {
                                    return <span>
                                        {1 && <div> foo </div>}
                                        {1 && <div> bar </div>}
                                    </span>;
                                }, this)
                            }
                        </span>;

                    case case2:
                        return <span>
                            <div> text </div>

                            {
                                Array.prototype.map.call(list, function (item, index) {
                                    return <span>
                                        {1 && <div> foo </div>}
                                        {1 && <div> bar </div>}
                                    </span>;
                                }, this)
                            }
                        </span>;
                }
            }).call(this, x, 1, 2);
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("case 6", () => {
        let input = `
            <For each="item" in={list}>
                <If true={1}>
                    <div> foo </div>
                    <div> bar </div>
                </If>
            </For>;
        `;
        let output = `
            <span>
                {
                    Array.prototype.map.call(list, function (item, index) {
                        return <span>
                            {1 && <div> foo </div>}
                            {1 && <div> bar </div>}
                        </span>;
                    }, this)
                }
            </span>;
        `;

        assert.isTrue(isEquil(input, output));
    });
});
