const path = require("path");

describe("language-source", function () {
  // The package ships no grammar and no code: it is the scoped defaults every
  // `source.*` grammar inherits when its own package sets nothing. Those
  // defaults are the whole contract. Borrow the CSV parser under a synthetic
  // source scope so this suite does not depend on CSV's own comment policy.
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

  it("applies the defaults when a source scope has no comment policy", async function () {
    const csv = lumine.grammars.grammarForScopeName("source.csv");
    const grammar = lumine.grammars.createGrammar(csv.grammarFilePath, {
      ...csv.definition,
      name: "Unconfigured source fixture",
      scopeName: "source.source-default-spec",
      fileTypes: [],
      injectionNames: [],
    });
    const registration = lumine.grammars.addGrammar(grammar);
    let editor;
    try {
      editor = await lumine.workspace.open(path.join(__dirname, "fixtures", "sample.csv"));
      editor.setGrammar(grammar);
      await editor.whenGrammarSettled();

      expect(editor.getGrammar().scopeName).toBe("source.source-default-spec");
      const comments = await editor.getCommentDelimitersForBufferPosition([0, 0]);
      expect(comments.block).toEqual(["/*", "*/"]);
      await editor.toggleLineCommentsForBufferRows(0, 0);
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(0)).toBe("/* name,value */");
    } finally {
      editor?.destroy();
      registration.dispose();
      grammar.deactivate();
    }
  });
});
