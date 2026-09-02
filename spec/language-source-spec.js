describe("language-source", function () {
  // The package ships no grammar and no code: it is the scoped defaults every
  // `source.*` grammar inherits when its own package sets nothing. Those
  // defaults are the whole contract, so they are what gets asserted.
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-source");
  });

  function settingFor(key, scope) {
    return lumine.config.get(`editor.${key}`, { scope: [scope] });
  }

  it("applies C-style comment delimiters to any source scope", function () {
    expect(settingFor("commentStart", "source.example")).toBe("/*");
    expect(settingFor("commentEnd", "source.example")).toBe("*/");
  });

  it("leaves scopes outside source.* alone", function () {
    expect(settingFor("commentStart", "text.plain")).not.toBe("/*");
  });
});
