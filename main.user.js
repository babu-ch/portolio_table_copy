// ==UserScript==
// @name        portofolio table to tsv
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       babu-ch
// @match        https://finance.yahoo.co.jp/portfolio/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rightcode.co.jp
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  /**
   * @typedef {string[]} Row
   */

  /**
   * テーブルをarrayに
   * @returns {Row[]}
   */
  const parse = () => {
    const rawRows = []
    document.querySelectorAll("#list tr").forEach(tr => {
      const children = tr.childNodes
      rawRows.push([...children].map(node => node.innerText)) // innerTextで取得しているので\n区切りの文字
    });
    return rawRows
  };

  /**
   * TSV変換前に加工する
   * @param {Row[]} rawRows
   * @returns {Row[]}
   */
  const process = (rawRows) => {
    const headerRow = rawRows[0];
    const codeIndex = headerRow.findIndex(text => text === "コード・市場・名称")
    // コード・市場・名称だけ分割してヘッダに追加
    const newHeader = headerRow.concat()
    newHeader.splice(codeIndex, 1, "コード", "市場", "名称")

    const newTable = [newHeader];

    rawRows.slice(1).forEach(row => {
      // コード・市場・名称は分割して追加
      const codes = row[codeIndex].split("\n")
      row.splice(codeIndex, 1, codes[0], codes[1], codes[2]);

      // 先頭に+があると数式エラーになるので取る
      // ソートの邪魔になる無駄な文字も消す
      const replaceRegex = /(^\+|\([連単]\))|(?<=[\d.]+)[倍株]$/;
      const newRow = row.map(col => col.split("\n")[0]) // \nでsplitするのは２行目以降が無駄な情報のため
        .map(col => col .replace(replaceRegex, ""))
      newTable.push(newRow)
    })
    return newTable;
  }

  /**
   * @param {Row[]} processed
   * @returns {string}
   */
  const toTsv = (processed) => {
    return processed.map(row => row.join("\t")).join("\n")
  }

  const button = document.createElement("button")
  button.textContent = "COPY TSV"
  button.style.border = "1px solid red"
  button.style.margin = "20px";
  button.style.padding = "20px";
  document.body.append(button)

  button.onclick = async () => {
    const rawRows = parse()
    const processed = process(rawRows)
    const tsv = toTsv(processed)
    await navigator.clipboard.writeText(tsv)
    alert("DONE!")
  }
})();