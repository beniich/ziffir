// Ambient module declaration so that '@casl/ability' resolves correctly
// under moduleResolution: "node" without requiring node16/nodenext.
declare module '@casl/ability' {
  export * from '@casl/ability/dist/types/index';
}
