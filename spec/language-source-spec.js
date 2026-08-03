describe("language-source", function () {
  // The package ships no grammar and no code: it is the scoped defaults every
  // `source.*` grammar inherits when its own package sets nothing. Those
  // defaults are the whole contract, so they are what gets asserted.
  beforeEach(function () {
    waitsForPromise(() => atom.packages.activatePackage("language-source"));
  });

  function settingFor(key, scope) {
    return atom.config.get(`language.${key}`, { scope: [scope] });
  }

  it("applies C-style comment delimiters to any source scope", function () {
    expect(settingFor("commentStart", "source.example")).toBe("/*");
    expect(settingFor("commentEnd", "source.example")).toBe("*/");
  });

  it("indents after an unclosed brace or paren", function () {
    let increase = new RegExp(settingFor("increaseIndentPattern", "source.example"));

    expect(increase.test("if (x) {")).toBe(true);
    expect(increase.test("foo(")).toBe(true);
    expect(increase.test("let x = 1;")).toBe(false);
    // A brace inside a string or a comment is not an open block.
    expect(increase.test('let x = "{";')).toBe(false);
  });

  it("dedents a line that closes a block", function () {
    let decrease = new RegExp(settingFor("decreaseIndentPattern", "source.example"));

    expect(decrease.test("  }")).toBe(true);
    expect(decrease.test("  };")).toBe(true);
    expect(decrease.test("  */ }")).toBe(true);
    expect(decrease.test("  } else {")).toBe(false);
  });

  it("leaves scopes outside source.* alone", function () {
    expect(settingFor("commentStart", "text.plain")).not.toBe("/*");
  });
});
