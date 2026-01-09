export interface CompressedResult<T> {
  compressed: T;
  prefixMap: Record<string, string>;
}
