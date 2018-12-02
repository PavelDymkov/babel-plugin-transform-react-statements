export default function throwIf(condition, errorMessage) {
    if (condition) {
        throw new Error(errorMessage);
    }
}
