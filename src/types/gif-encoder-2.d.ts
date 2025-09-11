declare module "gif-encoder-2" {
  interface GIFEncoderOutput {
    getData(): Uint8Array;
  }

  class GIFEncoder {
    out: GIFEncoderOutput;

    constructor(
      width: number,
      height: number,
      algorithm?: string,
      useOptimized?: boolean
    );

    setDelay(delay: number): void;
    setRepeat(repeat: number): void;
    start(): void;
    addFrame(imageData: Uint8Array | Uint8ClampedArray): void;
    finish(): void;
  }

  export default GIFEncoder;
}
