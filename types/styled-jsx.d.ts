// Minimal declaration to allow `style jsx` usage with `jsx` prop in TSX
// This avoids TS2322 errors where components use `<style jsx>{`...`}</style>`

declare namespace JSX {
  interface IntrinsicElements {
    style: any;
  }
}
