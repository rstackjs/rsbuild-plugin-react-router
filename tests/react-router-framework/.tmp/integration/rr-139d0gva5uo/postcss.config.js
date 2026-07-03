
export default ({
  plugins: [
    {
      // Minimal PostCSS plugin to test that it's being used
      postcssPlugin: 'replace',
      Declaration (decl) {
        decl.value = decl.value
          .replace(
            /NEW_PADDING_INJECTED_VIA_POSTCSS/g,
            "30px",
          )
          .replace(
            /PADDING_INJECTED_VIA_POSTCSS/g,
            "20px",
          );
      },
    },
  ],
});
  