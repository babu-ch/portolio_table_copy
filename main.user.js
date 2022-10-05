// ==UserScript==
// @name        portofolio table to tsv
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       babu-ch
// @match        https://finance.yahoo.co.jp/portfolio/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rightcode.co.jp
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Your code here...
  const parse = () => {
    const rawRows = []
    document.querySelectorAll("#list tr").forEach(tr => {
      const children = tr.childNodes
      rawRows.push([...children].map(node => node.innerText))
    });
    return rawRows
  };

  const process = (rawRows) => {
    const headerRow = rawRows[0];
    const codeIndex = headerRow.findIndex(text => text === "コード・市場・名称")
    const newHeader = headerRow.concat()
    newHeader.splice(codeIndex, 1, "コード", "市場", "名称")

    const newTable = [newHeader];

    rawRows.slice(1).forEach(row => {
      const codes = row[codeIndex].split("\n")
      row.splice(codeIndex, 1, ...codes)
      const newRow = row.map(col => col.split("\n")[0])
        .map(col => col.replace(/^\+/, "")) // 先頭に+があると数式エラーになるので取る
      newTable.push(newRow)
    })
    return newTable;
  }

  const toTsv = (processed) => {
    return processed.map(row => row.join("\t")).join("\n")
  }

  const button = document.createElement("button")
  button.textContent = "COPY TSV"
  document.body.prepend(button)

  button.onclick = async () => {
    const rawRows = parse()
    const processed = process(rawRows)
    const tsv = toTsv(processed)
    await navigator.clipboard.writeText(tsv)
    alert("DONE!")
  }
})();