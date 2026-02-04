// ==UserScript==
// @name         I'm not a robot neal.fun cheats
// @namespace    http://tampermonkey.net/
// @version      15.7
// @description  Codes auto-complete some levels
// @author       Suomynona589
// @match        https://neal.fun/not-a-robot/
// @icon         https://neal.fun/favicons/not-a-robot.png
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    //----Small helpers----

const log = (...args) => console.log('[robot-cheats]', ...args);

function waitFor(selector, timeout = 5000, interval = 50) {
  return new Promise(resolve => {
    const start = Date.now();
    const timer = setInterval(() => {
      const els = document.querySelectorAll(selector);
      if (els.length) {
        clearInterval(timer);
        resolve(true);
      } else if (Date.now() - start > timeout) {
        clearInterval(timer);
        resolve(false);
      }
    }, interval);
  });
}

function simulateClick(el) {
  if (!el) return;
  const opts = { bubbles: true, composed: true };
  try {
    el.dispatchEvent(new PointerEvent('pointerdown', opts));
    el.dispatchEvent(new MouseEvent('mousedown', opts));
    el.dispatchEvent(new MouseEvent('mouseup', opts));
    el.dispatchEvent(new MouseEvent('click', opts));
  } catch {
    el.click?.();
  }
}

// Helper to click at coordinates using simulateClick
function clickAt(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) {
    log(`No element found at (${x}, ${y})`);
    return;
  }
  simulateClick(el);
  log(`Clicked at (${x}, ${y}) on`, el);
}

    //----Cheats----

//----Stop sign cheat----

async function runStopSignCheat() {

    let refreshCount = 0;

    while (true) {

        await waitFor('.grid-item.grid-item-with-image');

        const tiles = Array.from(document.querySelectorAll('.grid-item.grid-item-with-image'));

        const set0 = [
            "66.6667% 0%",
            "100% 0%",
            "66.6667% 33.3333%",
            "100% 33.3333%"
        ];

        const set1 = [
            "0% 33.3333%",
            "0% 0%",
            "33.3333% 0%",
            "66.6667% 0%",
            "33.3333% 33.3333%",
            "66.6667% 33.3333%",
            "0% 66.6667%",
            "33.3333% 66.6667%",
            "66.6667% 66.6667%"
        ];

        const set2 = [
            "33.3333% 0%",
            "66.6667% 0%",
            "100% 0%",
            "100% 33.3333%",
            "66.6667% 33.3333%",
            "33.3333% 33.3333%",
            "33.3333% 66.6667%",
            "66.6667% 66.6667%",
            "100% 66.6667%"
        ];

        const set3 = [
            "0% 33.3333%",
            "0% 0%",
            "33.3333% 0%",
            "33.3333% 33.3333%",
            "66.6667% 33.3333%",
            "66.6667% 0%"
        ];

        let targets;

        if (refreshCount === 0) targets = set0;
        else if (refreshCount === 1) targets = set1;
        else if (refreshCount === 2) targets = set2;
        else targets = set3;

        for (const el of tiles) {
            const style = el.getAttribute('style') || "";
            if (targets.some(pos => style.includes(`background-position: ${pos}`))) {
                if (!el.classList.contains('grid-item-selected')) {
                    simulateClick(el);
                }
            }
        }

        await new Promise(resolve => {
            function handler(e) {
                if (e.target.closest(".captcha-refresh")) {
                    document.removeEventListener("click", handler, true);
                    resolve();
                }
            }
            document.addEventListener("click", handler, true);
        });

        refreshCount++;
        if (refreshCount >= 4) refreshCount = 0;

        await new Promise(r => setTimeout(r, 200));
    }
}

//----Veggie cheat----

    async function runVegetableCheat() {
    const ready = await waitFor('.grid-item img.vegetable-image');
    if (!ready) { log('vegetables: tiles not found'); return; }

    const veggies = ["tomato.webp","carrot.webp","onion.webp","corn.webp","potato.webp","eggplant.webp"];

    function selectVeggies() {
        const tiles = Array.from(document.querySelectorAll('.grid-item'));
        let clicks = 0;

        tiles.forEach(el => {
            const img = el.querySelector('img.vegetable-image');
            if (!img) return;
            const src = img.getAttribute('src') || "";
            if (veggies.some(v => src.includes(`/vegetables/${v}`))) {
                if (!el.classList.contains('grid-item-selected')) {
                    simulateClick(el);
                    clicks++;
                }
            }
        });

        if (clicks > 0) log('vegetables: clicked', clicks, 'tiles');

        const allSelected = tiles.filter(el => {
            const img = el.querySelector('img.vegetable-image');
            if (!img) return false;
            const src = img.getAttribute('src') || "";
            return veggies.some(v => src.includes(`/vegetables/${v}`));
        }).every(el => el.classList.contains('grid-item-selected'));

        return allSelected;
    }

    const observer = new MutationObserver(() => {
        if (selectVeggies()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    let attempts = 0;
    const maxAttempts = 100;
    const interval = setInterval(() => {
        attempts++;
        if (selectVeggies() || attempts >= maxAttempts) clearInterval(interval);
    }, 100);
}

//----Intersection Cheat----

async function runIntersectionCheat() {

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    async function waitForSelector(selector, timeout = 6000) {
        const start = Date.now();
        return new Promise(resolve => {
            const tick = () => {
                const els = document.querySelectorAll(selector);
                if (els.length) return resolve(Array.from(els));
                if (Date.now() - start > timeout) return resolve([]);
                requestAnimationFrame(tick);
            };
            tick();
        });
    }

    function getRotationDeg(el) {
        const inline = el.getAttribute("style") || "";
        const m = inline.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/i);
        if (m) return parseFloat(m[1]);
        return 0;
    }

    function isGoodRotation(el) {
        const deg = getRotationDeg(el);
        const mod = ((deg % 360) + 360) % 360;
        return mod === 0;
    }

    while (true) {

        const items = await waitForSelector(".rotating-item");
        if (!items.length) return;

        for (const el of items) {
            if (isGoodRotation(el)) continue;
            for (let i = 0; i < 20; i++) {
                simulateClick(el);
                await sleep(100);
                if (isGoodRotation(el)) break;
            }
        }

        await new Promise(resolve => {
            function handler(e) {
                if (e.target.closest(".captcha-refresh")) {
                    document.removeEventListener("click", handler, true);
                    resolve();
                }
            }
            document.addEventListener("click", handler, true);
        });

        await sleep(200);
    }
}

//----Tic Tac Toe Cheat----

async function runTicTacToeCheat() {

    const X = "X";
    const O = "O";
    const EMPTY = "";

    const LINES = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const CORNERS = [0, 2, 6, 8];
    const EDGES = [1, 3, 5, 7];
    const CENTER = 4;

    function cloneBoard(board) {
        return board.slice();
    }

    function isBoardEmpty(board) {
        return board.every((c) => c === EMPTY);
    }

    function getAvailableMoves(board) {
        const moves = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === EMPTY) moves.push(i);
        }
        return moves;
    }

    function checkWin(board, player) {
        return LINES.some(
            ([a, b, c]) =>
                board[a] === player &&
                board[b] === player &&
                board[c] === player
        );
    }

    function findWinningMove(board, player) {
        for (const [a, b, c] of LINES) {
            const line = [board[a], board[b], board[c]];
            const countPlayer = line.filter((v) => v === player).length;
            const countEmpty = line.filter((v) => v === EMPTY).length;

            if (countPlayer === 2 && countEmpty === 1) {
                if (board[a] === EMPTY) return a;
                if (board[b] === EMPTY) return b;
                if (board[c] === EMPTY) return c;
            }
        }
        return null;
    }

    function simulateMove(board, index, player) {
        const b = cloneBoard(board);
        b[index] = player;
        return b;
    }

    function evaluateBoard(board) {
        if (checkWin(board, X)) return 1;
        if (checkWin(board, O)) return -1;
        if (getAvailableMoves(board).length === 0) return 0;
        return null;
    }

    function minimax(board, player) {
        const evalScore = evaluateBoard(board);
        if (evalScore !== null) return { score: evalScore, move: null };

        const moves = getAvailableMoves(board);
        let bestMove = null;

        if (player === X) {
            let bestScore = -Infinity;
            for (const m of moves) {
                const next = simulateMove(board, m, X);
                const { score } = minimax(next, O);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = m;
                }
            }
            return { score: bestScore, move: bestMove };
        } else {
            let bestScore = Infinity;
            for (const m of moves) {
                const next = simulateMove(board, m, O);
                const { score } = minimax(next, X);
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = m;
                }
            }
            return { score: bestScore, move: bestMove };
        }
    }

    function countPlayer(board, player) {
        return board.filter((c) => c === player).length;
    }

    function firstXIndex(board) {
        for (let i = 0; i < 9; i++) if (board[i] === X) return i;
        return null;
    }

    function firstOIndex(board) {
        for (let i = 0; i < 9; i++) if (board[i] === O) return i;
        return null;
    }

    function isCorner(i) {
        return CORNERS.includes(i);
    }

    function isEdge(i) {
        return EDGES.includes(i);
    }

    function oppositeCorner(i) {
        switch (i) {
            case 0: return 8;
            case 2: return 6;
            case 6: return 2;
            case 8: return 0;
            default: return null;
        }
    }

    function cornerAcrossButNotThroughO(board, xCorner, oIndex) {
        const candidates = CORNERS.filter((c) => board[c] === EMPTY);

        for (const c of candidates) {
            const sameRowAsX = Math.floor(c / 3) === Math.floor(xCorner / 3);
            const sameColAsX = c % 3 === xCorner % 3;
            const sameRowAsO = Math.floor(c / 3) === Math.floor(oIndex / 3);
            const sameColAsO = c % 3 === oIndex % 3;

            if ((sameRowAsX || sameColAsX) && !(sameRowAsO || sameColAsO)) {
                return c;
            }
        }
        return null;
    }

    function anyEmptyCorner(board) {
        const empty = CORNERS.filter((c) => board[c] === EMPTY);
        return empty.length ? empty[0] : null;
    }

    function anyEmptyEdge(board) {
        const empty = EDGES.filter((e) => board[e] === EMPTY);
        return empty.length ? empty[0] : null;
    }

    function findForkMove(board, player) {
        const moves = getAvailableMoves(board);

        for (const m of moves) {
            const b = simulateMove(board, m, player);
            let winningLines = 0;

            for (const [a, b1, c] of LINES) {
                const line = [b[a], b[b1], b[c]];
                const countP = line.filter((v) => v === player).length;
                const countE = line.filter((v) => v === EMPTY).length;

                if (countP === 2 && countE === 1) winningLines++;
            }

            if (winningLines >= 2) return m;
        }

        return null;
    }

    function getBestMove(board) {
        if (isBoardEmpty(board)) {
            return CORNERS[Math.floor(Math.random() * CORNERS.length)];
        }

        const winNow = findWinningMove(board, X);
        if (winNow !== null) return winNow;

        const blockNow = findWinningMove(board, O);
        if (blockNow !== null) return blockNow;

        const xCount = countPlayer(board, X);
        const oCount = countPlayer(board, O);
        const firstX = firstXIndex(board);
        const firstO = firstOIndex(board);

        if (xCount === 1 && isCorner(firstX)) {
            if (isCorner(firstO) && firstO === oppositeCorner(firstX)) {
                const otherCorners = CORNERS.filter(
                    (c) => c !== firstX && c !== firstO && board[c] === EMPTY
                );
                if (otherCorners.length) return otherCorners[0];
            }

            if (firstO === CENTER) {
                const opp = oppositeCorner(firstX);
                if (opp !== null && board[opp] === EMPTY) return opp;
            }

            if (isEdge(firstO)) {
                const special = cornerAcrossButNotThroughO(board, firstX, firstO);
                if (special !== null) return special;
            }

            if (isCorner(firstO) && firstO !== oppositeCorner(firstX)) {
                const oppO = oppositeCorner(firstO);
                if (oppO !== null && board[oppO] === EMPTY) return oppO;

                const anyC = anyEmptyCorner(board);
                if (anyC !== null) return anyC;
            }
        }

        const forkMove = findForkMove(board, X);
        if (forkMove !== null) return forkMove;

        const oForkMove = findForkMove(board, O);
        if (oForkMove !== null && board[oForkMove] === EMPTY) {
            return oForkMove;
        }

        if (board[CENTER] === EMPTY) return CENTER;

        const corner = anyEmptyCorner(board);
        if (corner !== null) return corner;

        const edge = anyEmptyEdge(board);
        if (edge !== null) return edge;

        const { move } = minimax(board, X);
        if (move !== null) return move;

        const moves = getAvailableMoves(board);
        return moves.length ? moves[0] : 0;
    }

    await waitFor(".tic-tac-toe-container");
    await waitFor(".captcha-refresh");

    const resolve = (el) =>
        typeof el === "string" ? document.querySelector(el) : el;

    const click = (el) => simulateClick(resolve(el));

    let refreshTriggered = false;

    document.addEventListener(
        "click",
        (e) => {
            if (e.target.closest(".captcha-refresh")) {
                refreshTriggered = true;
            }
        },
        true
    );

    const getBoard = () => {
        return Array.from(
            document.querySelectorAll(".grid-item.grid-item")
        ).map((el) => {
            const c = el.classList;
            if (c.contains("grid-item-selected")) return "X";
            if (c.contains("grid-item-disabled")) return "O";
            return "";
        });
    };

    const waitForO = async (prev) => {
        return new Promise((resolve) => {
            const check = () => {
                if (refreshTriggered) return resolve();

                const items = document.querySelectorAll(
                    ".grid-item.grid-item"
                );

                for (let i = 0; i < 9; i++) {
                    const c = items[i].classList;

                    if (
                        c.contains("grid-item-disabled") &&
                        !c.contains("grid-item-selected") &&
                        prev[i] === ""
                    ) {
                        return resolve();
                    }
                }

                setTimeout(check, 50);
            };

            check();
        });
    };

    while (true) {
        refreshTriggered = false;

        while (true) {
            if (refreshTriggered) break;

            await new Promise((r) => setTimeout(r, 50));

            const board = getBoard();
            const empty = board.filter((v) => v === "").length;
            const xCount = board.filter((v) => v === "X").length;
            const oCount = board.filter((v) => v === "O").length;

            if (empty === 9) {
                const index = getBestMove(board);
                click(
                    document.querySelectorAll(".grid-item.grid-item")[index]
                );
                continue;
            }

            if (oCount === 1 && xCount === 0) {
                click(".captcha-refresh");
                break;
            }

            if (empty === 0) break;

            if (xCount > oCount) {
                await waitForO(board);
                continue;
            }

            const index = getBestMove(board);
            const items = document.querySelectorAll(".grid-item.grid-item");
            const target = items[index];

            if (!target) break;

            click(target);
            await waitForO(board);
        }
    }
}

//----Stop & Bike Cheat----

async function runStopBikeCheat() {

    while (true) {

        await waitFor(".grid-inner .grid-item.letter");

        const items = [...document.querySelectorAll(".grid-inner .grid-item.letter")];

        const grid = [];
        for (let r = 0; r < 10; r++) {
            grid[r] = [];
            for (let c = 0; c < 10; c++) {
                const idx = r * 10 + c;
                const el = items[idx];
                const span = el.querySelector("span");
                const char = span ? span.textContent.trim().toUpperCase() : "";
                grid[r][c] = { el, char, r, c };
            }
        }

        const dirs = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];

        function findWord(word) {
            const W = word.split("");

            for (let r = 0; r < 10; r++) {
                for (let c = 0; c < 10; c++) {

                    if (grid[r][c].char !== W[0]) continue;

                    for (const [dr, dc] of dirs) {
                        let rr = r;
                        let cc = c;
                        const path = [grid[rr][cc]];
                        let ok = true;

                        for (let i = 1; i < W.length; i++) {
                            rr += dr;
                            cc += dc;

                            if (rr < 0 || rr >= 10 || cc < 0 || cc >= 10) {
                                ok = false;
                                break;
                            }

                            if (grid[rr][cc].char !== W[i]) {
                                ok = false;
                                break;
                            }

                            path.push(grid[rr][cc]);
                        }

                        if (ok) return path;
                    }
                }
            }

            return null;
        }

        const stopSignPath = findWord("STOPSIGN");
        if (!stopSignPath) {
            await new Promise(r => setTimeout(r, 200));
            continue;
        }

        const bikePath = findWord("BIKE");
        if (!bikePath) {
            await new Promise(r => setTimeout(r, 200));
            continue;
        }

        const finalSet = new Set();
        const finalList = [];

        function addPath(path) {
            for (const cell of path) {
                const key = cell.r + "," + cell.c;
                if (!finalSet.has(key)) {
                    finalSet.add(key);
                    finalList.push(cell);
                }
            }
        }

        addPath(stopSignPath);
        addPath(bikePath);

        for (const cell of finalList) {
            simulateClick(cell.el);
        }

        await new Promise(resolve => {
            function handler(e) {
                if (e.target.closest(".captcha-refresh")) {
                    document.removeEventListener("click", handler, true);
                    resolve();
                }
            }
            document.addEventListener("click", handler, true);
        });

        await new Promise(r => setTimeout(r, 200));
    }
}

//----License Plate Cheat----

async function runLicensePlateCheat() {
  log("runLicensePlateCheat: starting");

  const ready = await waitFor(".license-image");
  if (!ready) { log("license: image not found"); return; }

  const img = document.querySelector(".license-image");
  if (!img) { log("license: no image element"); return; }
  const src = img.getAttribute("src") || "";
  const m = src.match(/\/license\/([^/.]+)\.webp/i);
  if (!m) { log("license: could not parse src", src); return; }
  const answer = m[1];
  log("license: answer =", answer);

  const input = document.querySelector(".captcha-input-text");
  if (!input) { log("license: captcha input not found"); return; }

  input.focus();
  input.value = "";
  const perCharDelay = 75;
  [...answer].forEach((ch, i) => {
    setTimeout(() => {
      input.value += ch;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      log("license: typed", ch);
    }, i * perCharDelay);
  });
}

//----Box In Box Cheat----

async function runBoxInBoxCheat() {
  await waitFor(".nested-wrapper");
  await waitFor(".nested-grid");
  await waitFor(".box");

  const coords = [
    [1062,306],[980,369],[980,369],[980,369],[988,319],[1047,316],
    [1043,367],[976,418],[976,418],[976,418],[1038,415],[931,414],
    [931,414],[931,414],[940,364],[940,364],[940,364],[938,320],
    [1031,306],[1030,307]
  ];

  for (const [x,y] of coords) {
    clickAt(x,y);
    await new Promise(r => setTimeout(r, 5));
  }

  async function runBoxInBox2Cheat() {
    const coords = [
      [974,303],[1002,300],[1031,303],[1028,331],[1059,333],[1054,355],
      [1026,361],[1001,360],[999,331],[971,331],[945,331],[919,354],
      [919,383],[919,412],[944,414],[946,446],[946,388],[946,358],
      [973,358],[968,392],[971,411],[974,445],[997,441],[999,412],
      [996,381],[1028,381],[1055,389],[1054,411],[1025,417],[1031,442]
    ];

    for (const [x,y] of coords) {
      clickAt(x,y);
      await new Promise(r => setTimeout(r, 5));
    }
  }

  runBoxInBox2Cheat();
}

document.addEventListener("click", e => {
  if (e.target.closest(".captcha-refresh")) {
    runBoxInBoxCheat();
  }
});

//----Whack-a-Mole Cheat----

async function runMoleCheat() {

    await waitFor(".mole-wrapper");

    setInterval(() => {
        const selected = document.querySelectorAll(".grid-item-selected").length;

        if (selected < 5) {
            const active = document.querySelector(".mole.active");
            if (!active) return;
            const wrapper = active.closest(".mole-wrapper");
            if (wrapper) simulateClick(wrapper);
        }
    }, 1);
}

//----Waldo Cheat----

async function runWaldoCheat() {
  const ready = await waitFor('.grid-item.grid-item-with-image');
  if (!ready) {
    log('waldo: tiles not found');
    return;
  }

  const targets = [
    "75% 33.3333%",
    "75% 37.5%"
  ];

  const tiles = Array.from(document.querySelectorAll('.grid-item.grid-item-with-image'));
  let clicks = 0;

  tiles.forEach(el => {
    const style = el.getAttribute('style') || "";
    if (targets.some(pos => style.includes(`background-position: ${pos}`))) {
      if (!el.classList.contains('grid-item-selected')) {
        simulateClick(el);
        clicks++;
      }
    }
  });

  log('waldo: clicked', clicks, 'tiles');
}

//----Chihuahua Cheat----

async function runChihuahuaCheat() {
    const ready = await waitFor('img.muffin-img');
    if (!ready) { log('muffins: tiles not found'); return; }

    const chihuahuas = [
        "/not-a-robot/muffins/chihuahuas/1.webp",
        "/not-a-robot/muffins/chihuahuas/2.webp",
        "/not-a-robot/muffins/chihuahuas/3.webp",
        "/not-a-robot/muffins/chihuahuas/4.webp",
        "/not-a-robot/muffins/chihuahuas/5.webp",
        "/not-a-robot/muffins/chihuahuas/6.webp"
    ];

    const muffins = Array.from({ length: 11 }, (_, i) =>
        `/not-a-robot/muffins/muffins/${i + 1}.webp`
    );

    function selectChihuahuas() {
        const tiles = Array.from(document.querySelectorAll('.grid-item'));
        let clicks = 0;

        tiles.forEach(el => {
            const img = el.querySelector('img.muffin-img');
            if (!img) return;
            const src = img.getAttribute('src') || "";
            if (chihuahuas.some(t => src.includes(t))) {
                if (!el.classList.contains('grid-item-selected')) {
                    simulateClick(el);
                    clicks++;
                }
            }
        });

        if (clicks > 0) log('muffins: clicked', clicks, 'tiles');

        const allSelected = tiles.filter(el => {
            const img = el.querySelector('img.muffin-img');
            if (!img) return false;
            const src = img.getAttribute('src') || "";
            return chihuahuas.some(t => src.includes(t));
        }).every(el => el.classList.contains('grid-item-selected'));

        return allSelected;
    }

    function handleRefresh() {
        const tiles = Array.from(document.querySelectorAll('.grid-item'));

        tiles.forEach(el => {
            const img = el.querySelector('img.muffin-img');
            if (!img) return;
            const src = img.getAttribute('src') || "";

            if (muffins.some(t => src.includes(t))) {
                if (el.classList.contains('grid-item-selected')) {
                    simulateClick(el);
                }
            }
        });

        tiles.forEach(el => {
            const img = el.querySelector('img.muffin-img');
            if (!img) return;
            const src = img.getAttribute('src') || "";

            if (chihuahuas.some(t => src.includes(t))) {
                if (!el.classList.contains('grid-item-selected')) {
                    simulateClick(el);
                }
            }
        });
    }

    document.addEventListener("click", e => {
        if (e.target.closest(".captcha-refresh")) {
            setTimeout(handleRefresh, 150);
        }
    }, true);

    const observer = new MutationObserver(() => {
        if (selectChihuahuas()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    let attempts = 0;
    const maxAttempts = 100;
    const interval = setInterval(() => {
        attempts++;
        if (selectChihuahuas() || attempts >= maxAttempts) clearInterval(interval);
    }, 100);
}

//----Without Stop Sign Cheat----

async function runWithoutCheat() {
    const ready = await waitFor('.grid-item.grid-item-with-image');
    if (!ready) { log('without: tiles not found'); return; }

    const cycles = [
        [
            "0% 0%","0% 33.3333%","0% 66.6667%","0% 100%",
            "33.3333% 100%","66.6667% 100%","100% 100%",
            "100% 66.6667%","100% 33.3333%","100% 0%"
        ],
        [
            "0% 0%","33.3333% 0%","66.6667% 0%","100% 0%",
            "100% 33.3333%","0% 33.3333%","0% 66.6667%",
            "100% 66.6667%","100% 100%","0% 100%",
            "66.6667% 33.3333%"
        ],
        [
            "0% 0%","33.3333% 0%","66.6667% 0%",
            "0% 66.6667%","0% 100%","33.3333% 100%",
            "33.3333% 66.6667%"
        ]
    ];

    let cycleIndex = 0;

    function selectTiles() {
        const targets = cycles[cycleIndex];
        const expectedImage = `/not-a-robot/without/${cycleIndex + 1}.webp`;
        const tiles = Array.from(document.querySelectorAll('.grid-item.grid-item-with-image'));
        let clicks = 0;

        tiles.forEach(el => {
            const style = el.getAttribute('style') || "";
            if (style.includes(expectedImage)) {
                if (targets.some(pos => style.includes(`background-position: ${pos}`))) {
                    if (!el.classList.contains('grid-item-selected')) {
                        simulateClick(el);
                        clicks++;
                    }
                }
            }
        });

        if (clicks > 0) log('without: clicked', clicks, 'tiles');

        const allSelected = tiles.filter(el => {
            const style = el.getAttribute('style') || "";
            return style.includes(expectedImage) &&
                   targets.some(pos => style.includes(`background-position: ${pos}`));
        }).every(el => el.classList.contains('grid-item-selected'));

        return allSelected;
    }

    document.addEventListener('click', e => {
        if (e.target.closest('.captcha-refresh')) {
            cycleIndex = (cycleIndex + 1) % cycles.length;
            setTimeout(selectTiles, 50);
        }
    });

    const observer = new MutationObserver(() => {
        selectTiles();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    while (true) {
        await new Promise(r => setTimeout(r, 50));
        selectTiles();
    }
}

//----Recaptcha Cheat----

async function runRecaptchaCheat() {
    const ready = await waitFor('.captcha-text');
    if (!ready) { log('recaptcha: captcha text not found'); return; }

    const captchaTextEls = Array.from(document.querySelectorAll('.captcha-text'));
    const targetTextEl = captchaTextEls.find(el => el.textContent.trim() === "I'm not a robot");
    if (!targetTextEl) { log('recaptcha: correct text not found'); return; }

    const captchaBox = targetTextEl.closest('.captcha-box');
    if (!captchaBox) { log('recaptcha: captcha box not found'); return; }

    const checkbox = captchaBox.querySelector('.captcha-box-checkbox-input');
    if (!checkbox) { log('recaptcha: checkbox not found in target box'); return; }

    simulateClick(checkbox);
    log('recaptcha: clicked checkbox linked to "I\'m not a robot"');
}

//----Circle Cheat----

async function runCircleCheat() {
    await waitFor(".container");
    await waitFor("main svg");
    await waitFor("main div");

    const svg = document.querySelector("main svg");
    const drawDiv = document.querySelector("main div");

    const s = svg.getBoundingClientRect();
    const cx = s.width / 2 + s.x;
    const cy = s.height / 2 + s.y;
    const r = s.width / 5;
    let a = 0;

    for (let e = 0; e < 50; e++) {
        a += Math.acos(1 - Math.pow(60 / r, 2) / 2);
        const t = Math.round(cx + r * Math.cos(a));
        const n = Math.round(cy + r * Math.sin(a));

        if (e === 0) {
            drawDiv.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: t, clientY: n }));
        }

        drawDiv.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, clientX: t, clientY: n }));
    }

    drawDiv.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
}

runCircleCheat();

//----Hydrants Cheat----

function runHydrantCheat() {
  log("runHydrantCheat: starting");

  const targets = [
    "/not-a-robot/sisyphus/hydrants/1.webp",
    "/not-a-robot/sisyphus/hydrants/2.webp",
    "/not-a-robot/sisyphus/hydrants/3.webp",
    "/not-a-robot/sisyphus/hydrants/4.webp",
    "/not-a-robot/sisyphus/hydrants/5.webp",
    "/not-a-robot/sisyphus/hydrants/6.webp",
    "/not-a-robot/sisyphus/hydrants/7.webp",
    "/not-a-robot/sisyphus/hydrants/8.webp",
    "/not-a-robot/sisyphus/hydrants/9.webp",
    "/not-a-robot/sisyphus/hydrants/10.webp",
    "/not-a-robot/sisyphus/hydrants/11.webp",
    "/not-a-robot/sisyphus/hydrants/12.webp",
    "/not-a-robot/sisyphus/hydrants/13.webp",
    "/not-a-robot/sisyphus/hydrants/14.webp",
    "/not-a-robot/sisyphus/hydrants/15.webp",
    "/not-a-robot/sisyphus/hydrants/16.webp",
    "/not-a-robot/sisyphus/hydrants/17.webp",
    "/not-a-robot/sisyphus/hydrants/18.webp",
    "/not-a-robot/sisyphus/hydrants/19.webp",
    "/not-a-robot/sisyphus/hydrants/20.webp",
    "/not-a-robot/sisyphus/hydrants/21.webp",
    "/not-a-robot/sisyphus/hydrants/22.webp",
    "/not-a-robot/sisyphus/hydrants/23.webp",
    "/not-a-robot/sisyphus/hydrants/24.webp",
    "/not-a-robot/sisyphus/hydrants/25.webp",
    "/not-a-robot/sisyphus/hydrants/26.webp",
    "/not-a-robot/sisyphus/hydrants/27.webp",
    "/not-a-robot/sisyphus/hydrants/28.webp",
    "/not-a-robot/sisyphus/hydrants/29.webp",
    "/not-a-robot/sisyphus/hydrants/30.webp",
    "/not-a-robot/sisyphus/hydrants/31.webp",
    "/not-a-robot/sisyphus/hydrants/32.webp"
  ];

  let clicked = new Set();

  function clickVisibleTargets() {
    const items = document.querySelectorAll(".sisyphus-item");
    items.forEach(item => {
      const src = item.getAttribute("src");
      if (src && targets.includes(src) && !clicked.has(src)) {
        simulateClick(item);
        clicked.add(src);
        log("runHydrantCheat: clicked " + src);
      }
    });
  }

  const timer = setInterval(() => {
    clickVisibleTargets();
    if (clicked.size >= targets.length) {
      log("runHydrantCheat: all 32 hydrants clicked");
      clearInterval(timer);
      observer.disconnect();
    }
  }, 150);

  const observer = new MutationObserver(() => {
    clickVisibleTargets();
    if (clicked.size >= targets.length) {
      log("runHydrantCheat: all 32 hydrants clicked");
      clearInterval(timer);
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

//----In Dark Cheat----

async function runInDarkCheat() {
  log("runInDarkCheat: starting");

  const ok1 = await waitFor(".captcha-words");
  const ok2 = await waitFor(".captcha-input-text");
  if (!ok1 || !ok2) return;

  let letters = [...document.querySelectorAll(".letter")].map(el => el.textContent.trim());
  let answer = letters.join("");

  console.log("Answer is:", answer);

  let input = document.querySelector(".captcha-input-text");
  if (!input) return;

  input.value = "";
  letters.forEach((ch, i) => {
    setTimeout(() => {
      input.value += ch;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      console.log("Typed:", ch);
    }, i * 75);
  });
}

//----Describe What You See Cheat----

async function runWhatYouSeeCheat() {
    const ready = await waitFor('.captcha-input-text');
    if (!ready) { log('what-you-see: input not found'); return; }

    const input = document.querySelector('.captcha-input-text');

    const letters = "abcdefghijklmnopqrstuvwxyz";
    let randomWord = "";
    for (let i = 0; i < 6; i++) {
        randomWord += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    if (input) {
        input.value = "";
        [...randomWord].forEach((ch, i) => {
            setTimeout(() => {
                input.value += ch;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                if (i === randomWord.length - 1) {
                    log('what-you-see: filled with "' + randomWord + '"');
                }
            }, i * 75);
        });
    }
}

//----Minecraft Cheat----

async function runMinecraftCheat() {
    console.log("minecraft cheat: starting");

    function waitForSelector(selector, timeout = 8000) {
        return new Promise(resolve => {
            const start = Date.now();
            const tick = () => {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                if (Date.now() - start > timeout) return resolve(null);
                requestAnimationFrame(tick);
            };
            tick();
        });
    }

    function clickElement(el, button = 0) {
        if (!el) return;
        const opts = { bubbles: true, cancelable: true, button };
        el.dispatchEvent(new PointerEvent('pointerdown', opts));
        el.dispatchEvent(new MouseEvent('mousedown', opts));
        el.dispatchEvent(new PointerEvent('pointerup', opts));
        el.dispatchEvent(new MouseEvent('mouseup', opts));
        el.dispatchEvent(new MouseEvent('click', opts));
        if (button === 2) {
            el.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        }
    }

    const invLog0 = await waitForSelector('.crafting-slot[data-location="inventoryItems"][data-index="0"]');
    const invDiam1 = await waitForSelector('.crafting-slot[data-location="inventoryItems"][data-index="1"]');
    const grid0 = await waitForSelector('.crafting-slot[data-location="craftingGrid"][data-index="0"]');
    const grid1 = await waitForSelector('.crafting-slot[data-location="craftingGrid"][data-index="1"]');
    const grid2 = await waitForSelector('.crafting-slot[data-location="craftingGrid"][data-index="2"]');
    const grid4 = await waitForSelector('.crafting-slot[data-location="craftingGrid"][data-index="4"]');
    const grid7 = await waitForSelector('.crafting-slot[data-location="craftingGrid"][data-index="7"]');
    const output = await waitForSelector('.crafting-slot[data-location="outputCell"][data-index="0"]');
    const inv0 = await waitForSelector('.crafting-slot[data-location="inventoryItems"][data-index="0"]');

    if (!invLog0 || !invDiam1 || !grid0 || !grid1 || !grid2 || !grid4 || !grid7 || !output) {
        console.warn("minecraft cheat: missing slots, run dumpSlots() in console to debug");
        return;
    }

    await new Promise(r => setTimeout(r, 200)); clickElement(invLog0, 0);
    await new Promise(r => setTimeout(r, 200)); clickElement(grid7, 0);
    await new Promise(r => setTimeout(r, 200)); clickElement(output, 0);
    await new Promise(r => setTimeout(r, 200)); clickElement(grid7, 2);
    await new Promise(r => setTimeout(r, 200)); clickElement(grid4, 2);
    await new Promise(r => setTimeout(r, 200)); clickElement(inv0, 0);
    await new Promise(r => setTimeout(r, 200)); clickElement(output, 0);
    await new Promise(r => setTimeout(r, 200)); clickElement(grid7, 2);
    await new Promise(r => setTimeout(r, 200)); clickElement(grid4, 2);
    await new Promise(r => setTimeout(r, 200)); clickElement(inv0, 0);
    await new Promise(r => setTimeout(r, 200)); clickElement(invDiam1, 0);
    await new Promise(r => setTimeout(r, 200)); clickElement(grid0, 2);
    await new Promise(r => setTimeout(r, 200)); clickElement(grid1, 2);
    await new Promise(r => setTimeout(r, 200)); clickElement(grid2, 2);
    await new Promise(r => setTimeout(r, 300)); clickElement(output, 0);

    console.log("minecraft cheat: done");
}

//----Catch Ducks Cheat----

async function runCatchDucksCheat() {
    console.log("duck cheat: starting");

    function waitForSelector(selector, timeout = 5000) {
        return new Promise(resolve => {
            const start = Date.now();
            const tick = () => {
                const els = document.querySelectorAll(selector);
                if (els.length > 0) return resolve(els);
                if (Date.now() - start > timeout) return resolve([]);
                requestAnimationFrame(tick);
            };
            tick();
        });
    }


    const ducks = await waitForSelector(".duck.roaming");
    if (!ducks.length) {
        console.warn("duck cheat: no ducks found");
        return;
    }

    ducks.forEach(el => simulateClick(el));
    console.log("duck cheat: clicked", ducks.length, "ducks");

    const container = document.querySelector(".duck-container");
    if (container) {
        const msg = document.createElement("div");
        msg.textContent = "They got clicked by the way";
        msg.style.position = "absolute";
        msg.style.left = (container.getBoundingClientRect().left - 250) + "px";
        msg.style.top = container.getBoundingClientRect().top + "px";
        msg.style.fontSize = "20px";
        msg.style.fontWeight = "bold";
        msg.style.color = "yellow";
        msg.style.textShadow = "2px 2px 4px black";
        msg.style.zIndex = "999999";
        document.body.appendChild(msg);

        function removeMsg() {
            msg.remove();
            clearInterval(levelCheck);
        }

        const levelCheck = setInterval(() => {
            const lvl = localStorage.getItem("not-a-robot-level");
            if (lvl !== "21") removeMsg();
        }, 200);
    }
}

//----Panorama Cheat----

async function runPanoramaCheat() {
    const ok = await waitFor('.captcha-title-type');
    if (!ok) return;

    if (localStorage.getItem("not-a-robot-level") !== "22") {
        const old = document.getElementById("panorama-cheat-video");
        if (old) old.remove();
        return;
    }

    const titleEl = document.querySelector('.captcha-title-type');
    if (!titleEl) return;

    const title = titleEl.textContent.trim();
    let url = "";

    if (title === "Couple Kissing") {
        url = "https://suomynona589.github.io/videos/couple.mp4";
    } else if (title === "Guitar Cat") {
        url = "https://suomynona589.github.io/videos/guitarcat.mp4";
    } else if (title === "Chilli's Sign") {
        url = "https://suomynona589.github.io/videos/chillis.mp4";
    } else {
        return;
    }

    const old = document.getElementById("panorama-cheat-video");
    if (old) old.remove();

    const vid = document.createElement("video");
    vid.id = "panorama-cheat-video";
    vid.src = url;
    vid.autoplay = true;
    vid.loop = true;
    vid.muted = true;
    vid.controls = true;
    vid.controlsList = "nodownload";

    vid.style.position = "fixed";
    vid.style.left = "95px";
    vid.style.top = "calc(50% - 50px)";
    vid.style.transform = "translateY(-50%)";
    vid.style.width = "425px";
    vid.style.height = "auto";
    vid.style.zIndex = 999999;
    vid.style.cursor = "grab";

    document.body.appendChild(vid);

    let drag = false;
    let offX = 0;
    let offY = 0;

    vid.addEventListener("mousedown", e => {
        drag = true;
        offX = e.clientX - vid.getBoundingClientRect().left;
        offY = e.clientY - vid.getBoundingClientRect().top;
        vid.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", e => {
        if (!drag) return;
        vid.style.left = e.clientX - offX + "px";
        vid.style.top = e.clientY - offY + "px";
        vid.style.transform = "";
    });

    document.addEventListener("mouseup", () => {
        drag = false;
        vid.style.cursor = "grab";
    });
}

let lastTitle = null;

setInterval(() => {
    if (localStorage.getItem("not-a-robot-level") !== "22") {
        const old = document.getElementById("panorama-cheat-video");
        if (old) old.remove();
        return;
    }

    const el = document.querySelector('.captcha-title-type');
    if (!el) return;

    const title = el.textContent.trim();
    if (!title) return;

    if (title !== lastTitle) {
        lastTitle = title;
        runPanoramaCheat();
    }
}, 1);

//----Eye Exam Cheat----

async function runEyeExamCheat() {
  console.log("eye exam cheat: starting");

  let stage = 0;

  function typeIntoInput(el, text) {
    el.focus();
    el.value = "";
    [...text].forEach((ch, i) => {
      setTimeout(() => {
        el.value += ch;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }, i * 75);
    });
  }

  const interval = setInterval(() => {
    const labelEl = document.querySelector(".eye-exam-input-label");
    const label = labelEl?.textContent?.toLowerCase() || "";

    if (stage === 0 && label.includes("letters")) {
      const input = document.querySelector("input[type='text']");
      if (input) {
        typeIntoInput(input, "EDFCZP");
        stage = 1;
      }
      return;
    }

    if (stage === 1 && label.includes("number")) {
      const input = document.querySelector("input[type='text']");
      if (input) {
        typeIntoInput(input, "8");
        stage = 2;
      }
      return;
    }

    if (stage === 2 && label.includes("dots")) {
      const input = document.querySelector("input[type='text']");
      if (input) {
        typeIntoInput(input, "34");
        stage = 3;
      }
      return;
    }

    if (stage === 3) {
      const squares = document.querySelectorAll(".color-square");
      if (squares.length > 0) {
        let target = null;
        squares.forEach(sq => {
          const style = sq.getAttribute("style") || "";
          if (style.includes("rgb(84, 255, 41)")) target = sq;
        });
        if (target) {
          simulateClick(target);
          clearInterval(interval);
          console.log("eye exam cheat: finished");
        }
      }
    }
  }, 200);
}

//----Networking Cheat----

async function runNetworkCheat() {
  function waitFor(sel) {
    return new Promise(resolve => {
      const check = setInterval(() => {
        const el = document.querySelector(sel);
        if (el) {
          clearInterval(check);
          resolve(el);
        }
      }, 100);
    });
  }

  const wrapper = await waitFor(".captcha-content-wrapper");

  const img = document.createElement("img");
  img.src = "https://suomynona589.github.io/images/networking.png";
  img.style.position = "absolute";
  img.style.width = "300px";
  img.style.zIndex = 999999;

  const rect = wrapper.getBoundingClientRect();
  img.style.left = rect.left - 350 + "px";
  img.style.top = rect.top + 75 + "px";

  document.body.appendChild(img);

  function removeImg() {
    img.remove();
    clearInterval(levelCheck);
  }

  const levelCheck = setInterval(() => {
    const lvl = localStorage.getItem("not-a-robot-level");
    if (lvl !== "26") removeImg();
  }, 200);
}

//----Soul Cheat----

async function runSoulCheat() {
  const ready = await waitFor('.grid-item');
  log("runSoulCheat: starting");

  const targets = [
    "/not-a-robot/soul/1.webp",
    "/not-a-robot/soul/3.webp",
    "/not-a-robot/soul/6.webp",
    "/not-a-robot/soul/8.webp"
  ];

  const tiles = Array.from(document.querySelectorAll(".grid-item"));
  let clicks = 0;

  tiles.forEach(tile => {
    const img = tile.querySelector(".soul-image");
    if (!img) return;
    const src = img.getAttribute("src") || "";
    if (targets.includes(src)) {
      if (!tile.classList.contains("grid-item-selected")) {
        simulateClick(tile);
        clicks++;
      }
    }
  });

  log("soul: clicked", clicks, "tiles");
}

//----Traffic Tree Cheat----

async function runTrafficTreeCheat() {
  log("runTrafficTreeCheat: starting");

  function getBackgroundPos(styleStr) {
    const m = styleStr.match(/background-position:\s*([0-9.]+%)\s+([0-9.]+%)/);
    return m ? `${m[1]} ${m[2]}` : null;
  }

  const exclude = new Set(["100% 0%", "0% 0%"]);

  const ready = await waitFor(".grid-item.grid-item-with-image");
  if (!ready) { log("traffic-tree: tiles not found"); return; }

  const tiles = document.querySelectorAll(".grid-item.grid-item-with-image");
  let clicks = 0;

  tiles.forEach(tile => {
    const style = tile.getAttribute("style") || "";
    if (!/tree\/tree\.webp/.test(style)) return;
    const bp = getBackgroundPos(style);
    if (!bp || exclude.has(bp)) return;
    simulateClick(tile);
    clicks++;
    log("traffic-tree: clicked", bp);
  });

  log("traffic-tree: total clicked =", clicks);
}

//----Beats Cheat----

async function runBeatsCheat() {
    await runPart(1, 3);
    await runPart(2, 4);
    await runPart(3, 5);
}

async function runPart(partId, amount) {
    let count = 0;
    let lastPlaying = null;

    while (count < amount) {
        const fail = document.querySelector(".dance-square.launchpad-pad.user-selected.failed");
        if (fail) {
            location.reload();
            return;
        }

        const playing = document.querySelector(".dance-square.launchpad-pad.playing");

        if (playing && playing !== lastPlaying) {
            lastPlaying = playing;
            count++;

            const parent = playing.closest(".grid-item.grid-item");
            if (parent) {
                let label = parent.querySelector(".beats-label");

                if (!label) {
                    label = document.createElement("div");
                    label.className = "beats-label";
                    label.textContent = String(count);
                    label.style.position = "absolute";
                    label.style.top = "2px";
                    label.style.right = "4px";
                    label.style.color = "white";
                    label.style.fontSize = "18px";
                    label.style.fontWeight = "bold";
                    label.style.pointerEvents = "none";
                    parent.appendChild(label);

                    parent.addEventListener("click", () => {
                        label.remove();
                    });
                } else {
                    const old = label.textContent;
                    label.textContent = old + ", " + count;
                }
            }
        }

        if (!playing) {
            lastPlaying = null;
        }

        await new Promise(r => setTimeout(r, 10));
    }

    while (document.querySelector(".beats-label")) {
        const fail = document.querySelector(".dance-square.launchpad-pad.user-selected.failed");
        if (fail) {
            location.reload();
            return;
        }

        await new Promise(r => setTimeout(r, 20));
    }
}

//----Brands Cheat----

async function runBrandsCheat() {
  log("runBrandsCheat: starting");

  const ready =
    (await waitFor('.brands')) &&
    (await waitFor('.brands img[src*="/not-a-robot/brands/"], .brands [style*="/not-a-robot/brands/"]'));
  if (!ready) { log("brands: logos not found"); return; }

  const brandMap = {
    tesla: "T", adobe: "A", bing: "B", pinterest: "P", x: "X",
    netflix: "N", wordpress: "W", kelloggs: "K", monster: "M",
    notion: "N", facebook: "F", xbox: "X", verizon: "V",
    google: "G", honda: "H", disney: "D", mcdonalds: "M"
  };

  function extractBrand(el) {
    const src = el.getAttribute("src");
    if (src && src.includes("/not-a-robot/brands/")) {
      const m = src.match(/\/brands\/([^/.]+)\.svg/i);
      if (m) return m[1].toLowerCase();
    }
    const style = el.getAttribute("style") || "";
    const ms = style.match(/\/brands\/([^"')]+)\.svg/i);
    return ms ? ms[1].toLowerCase() : null;
  }

  const container = document.querySelector(".brands");
  const logoNodes = container.querySelectorAll('img[src*="/not-a-robot/brands/"], [style*="/not-a-robot/brands/"]');

  const letters = [];
  logoNodes.forEach(el => {
    const key = extractBrand(el);
    if (key && brandMap[key]) {
      letters.push(brandMap[key]);
      log("brands:", key, "->", brandMap[key]);
    }
  });

  const input = document.querySelector('.captcha-input-text');
  if (!input) { log("brands: captcha input not found"); return; }

  input.focus();
  input.value = "";
  const perCharDelay = 100;
  letters.forEach((ch, i) => {
    setTimeout(() => {
      input.value += ch;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, i * perCharDelay);
  });
}

//----Math Cheat----

async function runMathCheat() {
  log("runMathCheat: starting");

  const ready = await waitFor(".math-grid-item");
  if (!ready) {
    log("math-cheat: tiles not found");
    return;
  }

  const tiles = [...document.querySelectorAll(".math-grid-item")];

  const tileData = tiles.map(tile => {
    const valEl = tile.querySelector(".math-grid-term-actual");
    if (!valEl) return { tile, value: Infinity };

    let raw = valEl.textContent.trim();
    let value = raw === "Infinity" ? Infinity : parseFloat(raw);

    return { tile, value };
  });

  tileData.sort((a, b) => a.value - b.value);

  let clicks = 0;
  for (const entry of tileData) {
    simulateClick(entry.tile);
    clicks++;
    log("math-cheat: clicked", entry.value);
    await new Promise(r => setTimeout(r, 25));
  }

  log("math-cheat: total clicked =", clicks);
}

//----Cup Shuffle Cheat----

async function runCupCheat() {
    log("runCupCheat: starting");

    const ok = await waitFor(".cup");
    if (!ok) return;

    let cup = null;
    while (!cup) {
        cup = document.querySelector(".cup.has-ball");
        if (!cup) await new Promise(r => setTimeout(r, 75));
    }

    cup.style.outline = "4px solid #4da3ff";
    cup.style.outlineOffset = "3px";
    cup.style.borderRadius = "6px";

    let clicks = 0;
    function handler() {
        clicks++;
        if (clicks >= 3) {
            cup.removeEventListener("click", handler);
            log("cup-cheat: done");
        }
    }

    cup.addEventListener("click", handler);
}

//----Impostor Cheat----

async function runImpostorCheat() {
  log("runImpostorCheat: starting");

  const ready = await waitFor(".grid-item.grid-item");
  if (!ready) { log("impostor: tiles not found"); return; }

  const targets = new Set([
    "/not-a-robot/imposters/1.webp",
    "/not-a-robot/imposters/6.webp",
    "/not-a-robot/imposters/9.webp"
  ]);

  const tiles = document.querySelectorAll(".grid-item.grid-item");
  let clicks = 0;

  tiles.forEach(tile => {
    const img = tile.querySelector("img.ai-generated");
    if (!img) return;
    const src = img.getAttribute("src") || "";
    if (targets.has(src)) {
      if (!tile.classList.contains("grid-item-selected")) {
        simulateClick(tile);
        clicks++;
        log("impostor: clicked", src);
      }
    }
  });

  log("impostor: total clicked =", clicks);
}

//----Convo Cheat----

async function runConvoCheat() {
  console.log("runConvoCheat: starting");

  function waitFor(selector, timeout = 8000) {
    return new Promise(resolve => {
      const start = Date.now();
      const check = () => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);
        if (Date.now() - start > timeout) return resolve(null);
        requestAnimationFrame(check);
      };
      check();
    });
  }

  const input = await waitFor('input[placeholder="Type your message..."]');
  if (!input) {
    console.log("Input not found");
    return;
  }

  console.log("Input found, proceeding");

  input.focus();
  console.log("Input focused");

  input.value = "Start at 97%";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  console.log("Input set to Start at 95%");
}

//----Jessica Cheat----

async function runJessicaCheat() {
  console.log("runJessicaCheat: starting");

  function waitFor(selector, timeout = 8000) {
    return new Promise(resolve => {
      const start = Date.now();
      const check = () => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);
        if (Date.now() - start > timeout) return resolve(null);
        requestAnimationFrame(check);
      };
      check();
    });
  }

  const input = await waitFor('input[placeholder="Chat with Jessica..."]');
  if (!input) {
    console.log("jessica: input not found");
    return;
  }

  console.log("jessica: input found, proceeding");

  input.focus();
  console.log("jessica: input focused");

  input.value = 'Start at "End"';
  input.dispatchEvent(new Event("input", { bubbles: true }));
  console.log('jessica: input set to Start at "End"');
}

//----Empire State Building Cheat----

async function runEmpSteCheat() {
  const ready = await waitFor('.grid-item.grid-item-with-image');
  if (!ready) {
    log('empire: tiles not found');
    return;
  }

  const targets = [
    "76.9231% 51.7857%",
    "69.2308% 51.7857%",
    "61.5385% 51.7857%",
    "53.8462% 51.7857%",
    "46.1538% 51.7857%",
    "38.4615% 51.7857%",
    "30.7692% 51.7857%",
    "23.0769% 51.7857%"
  ];

  const tiles = Array.from(document.querySelectorAll('.grid-item.grid-item-with-image'));
  let clicks = 0;

  tiles.forEach(el => {
    const style = el.getAttribute('style') || "";
    if (targets.some(pos => style.includes(`background-position: ${pos}`))) {
      if (!el.classList.contains('grid-item-selected')) {
        simulateClick(el);
        clicks++;
      }
    }
  });

  log('empire: clicked', clicks, 'tiles');
}

//----DDR Cheat----

async function runDDRCheat() {
  log("runDDRCheat: waiting for start click");

  let starter = null;

  // poll for the .start div with the correct <img>
  while (!starter) {
    starter = [...document.querySelectorAll(".start")].find(div => {
      const img = div.querySelector("img");
      return img && img.src.includes("/not-a-robot/play.svg");
    });
    if (!starter) await new Promise(r => setTimeout(r, 75));
  }

  let clicked = false;
  starter.addEventListener("click", () => clicked = true, { once: true });

  // wait until user actually clicks it
  while (!clicked) {
    await new Promise(r => setTimeout(r, 75));
  }

  log("runDDRCheat: starting");

  const keyDir = {
    Up: "ArrowUp",
    Down: "ArrowDown",
    Left: "ArrowLeft",
    Right: "ArrowRight"
  };

  function fireKey(k) {
    if (!k) return;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: k }));
    requestAnimationFrame(() => {
      document.dispatchEvent(new KeyboardEvent("keyup", { key: k }));
    });
  }

  const ok1 = await waitFor(".arrows-container");
  if (!ok1) return;

  let video = null;
  while (!video) {
    video = [...document.querySelectorAll("video")].find(v =>
      v.src.includes("dance.mp4")
    );
    if (!video) await new Promise(r => setTimeout(r, 75));
  }

  const target = document.querySelector(".arrows-container");
  const hitbox = target.getBoundingClientRect();
  const top = hitbox.top;
  const bottom = hitbox.bottom;

  function readDirection(note) {
    const arrow = note.querySelector(".note-arrow");
    if (!arrow) return null;
    for (const c of arrow.classList) {
      if (keyDir[c]) return c;
    }
    return null;
  }

  function cycle() {
    const pending = [...document.querySelectorAll("div.note:not(.note-played):not(.note-missed)")];

    for (const node of pending) {
      const y = node.getBoundingClientRect().top;

      if (y >= top && y <= bottom) {
        const dir = readDirection(node);
        if (dir) {
          fireKey(keyDir[dir]);
          node.classList.add("note-played");
          log("ddr: hit", dir);
        }
      }
    }

    requestAnimationFrame(cycle);
  }

  cycle();
  log("runDDRCheat: active");
}

    //----Orchestrator----

function runCheatsForLevel(level) {
    log('level', level, 'detected');

    if (level === 1) runStopSignCheat();
    if (level === 3) runVegetableCheat();
    if (level === 4) runIntersectionCheat();
    if (level === 5) runTicTacToeCheat();
    if (level === 6) runStopBikeCheat();
    if (level === 7) runLicensePlateCheat();
    if (level === 8) runBoxInBoxCheat();
    if (level === 9) runMoleCheat();
    if (level === 10) runWaldoCheat();
    if (level === 11) runChihuahuaCheat();
    if (level === 12) runWithoutCheat();
    if (level === 13) runRecaptchaCheat();
    if (level === 16) runCircleCheat();
    if (level === 17) runHydrantCheat();
    if (level === 18) runInDarkCheat();
    if (level === 19) runWhatYouSeeCheat();
    if (level === 20) runMinecraftCheat();
    if (level === 21) runCatchDucksCheat();
    if (level === 22) runPanoramaCheat();
    if (level === 23) runEyeExamCheat();
    if (level === 26) runNetworkCheat();
    if (level === 28) runSoulCheat();
    if (level === 30) runTrafficTreeCheat();
    if (level === 31) runBeatsCheat();
    if (level === 32) runBrandsCheat();
    if (level === 33) runMathCheat();
    if (level === 34) runCupCheat();
    if (level === 36) runImpostorCheat();
    if (level === 41) runConvoCheat();
    if (level === 44) runJessicaCheat();
    if (level === 45) runEmpSteCheat();
    if (level === 46) runDDRCheat();
}

let lastLevel = -1;

function checkLevelAndRun() {
    const level = parseInt(localStorage.getItem('not-a-robot-level') || '0', 10);
    if (level !== lastLevel) {
        lastLevel = level;
        runCheatsForLevel(level);
    }
}

const bodyObserver = new MutationObserver(() => checkLevelAndRun());
bodyObserver.observe(document.body, { childList: true, subtree: true });

setInterval(checkLevelAndRun, 400);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkLevelAndRun, { once: true });
} else {
    checkLevelAndRun();
}
})();
