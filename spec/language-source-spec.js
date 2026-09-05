const path = require("path");

describe("language-source", function () {
  // The package ships no grammar and no code: it is the scoped defaults every
  // `source.*` grammar inherits when its own package sets nothing. Those
  // defaults are the whole contract, so the fixture uses CSV as a real
  // `source.*` host whose package declares no scoped comment settings.
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-source");
    await lumine.packages.activatePackage("language-csv");
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

  it("applies the defaults to an opened source fixture", async function () {
    const editor = await lumine.workspace.open(path.join(__dirname, "fixtures", "sample.csv"));
    await editor.getBuffer().getLanguageMode().ready;

    expect(editor.getGrammar().scopeName).toBe("source.csv");
    expect(
      lumine.config.get("editor.commentStart", { scope: editor.getRootScopeDescriptor() }),
    ).toBe("/*");
    expect(lumine.config.get("editor.commentEnd", { scope: editor.getRootScopeDescriptor() })).toBe(
      "*/",
    );
  });
});
