export default function manipulateOptions(_, parserOptions) {
    let { plugins } = parserOptions;

    if (!plugins.includes("jsx")) {
        plugins.push("jsx");
    }
}
